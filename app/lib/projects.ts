import { v4 as uuidv4 } from "uuid"
import type { Project, CreateProjectInput, UpdateProjectInput } from "./types"
import prisma from "./prisma"

// Get all projects
export async function getAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { deleted: false },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: {
          tasks: {
            where: {
              deleted: false
            }
          }
        }
      },
      tasks: {
        where: {
          deleted: false,
          status: 'done'
        },
        select: {
          id: true
        }
      }
    }
  })

  return projects.map((project: any) => ({
    ...project,
    taskCount: project._count.tasks,
    completedTaskCount: project.tasks.length,
    blockedTaskCount: 0, // We'll need to add a separate query for this
  })) as Project[]
}

// Get project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          tasks: {
            where: {
              deleted: false
            }
          }
        }
      },
      tasks: {
        where: {
          deleted: false,
          status: 'done'
        },
        select: {
          id: true
        }
      }
    }
  })

  if (!project) {
    return null
  }

  // Get blocked tasks count
  const blockedTasks = await prisma.task.count({
    where: {
      projectId: id,
      deleted: false,
      status: 'blocked'
    }
  })

  return {
    ...project,
    description: project.description || undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    taskCount: project._count.tasks,
    completedTaskCount: project.tasks.length,
    blockedTaskCount: blockedTasks,
  } 
}

// Create a new project
export async function createProject(data: CreateProjectInput): Promise<Project> {
  const newProject = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description || "",
      userId: "user-1", // Mock user ID
      deleted: false,
    }
  })

  return {
    ...newProject,
    taskCount: 0,
    description: newProject.description || undefined,
    completedTaskCount: 0,
    blockedTaskCount: 0,
    createdAt: newProject.createdAt.toISOString(),
    updatedAt: newProject.updatedAt.toISOString(),
  }
}

// Update a project
export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project | null> {
  const project = await prisma.project.findUnique({
    where: { id }
  })

  if (!project) {
    return null
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
    },
    include: {
      _count: {
        select: {
          tasks: {
            where: {
              deleted: false
            }
          }
        }
      },
      tasks: {
        where: {
          deleted: false,
          status: 'done'
        },
        select: {
          id: true
        }
      }
    }
  })

  // Get blocked tasks count
  const blockedTasks = await prisma.task.count({
    where: {
      projectId: id,
      deleted: false,
      status: 'blocked'
    }
  })

  return {
    ...updatedProject,
    taskCount: updatedProject._count.tasks,
    completedTaskCount: updatedProject.tasks.length,
    blockedTaskCount: blockedTasks,
    description: updatedProject.description || undefined,
    createdAt: updatedProject.createdAt.toISOString(),
    updatedAt: updatedProject.updatedAt.toISOString(),
  }
}

// Soft delete a project
export async function softDeleteProject(id: string): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id }
  })

  if (!project) {
    return false
  }

  await prisma.project.update({
    where: { id },
    data: { deleted: true }
  })

  // Also mark all tasks in this project as deleted
  await prisma.task.updateMany({
    where: { projectId: id },
    data: { deleted: true }
  })

  return true
}
