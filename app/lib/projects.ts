import { v4 as uuidv4 } from "uuid"
import type { Project, CreateProjectInput, UpdateProjectInput } from "./types"
import { getTasksByProject } from "./tasks"

// Local storage key
const PROJECTS_KEY = "mock_projects"

// Helper function to get projects from localStorage
function getProjectsFromStorage(): Project[] {
  if (typeof window === "undefined") {
    return []
  }

  const projectsData = localStorage.getItem(PROJECTS_KEY)

  if (!projectsData) {
    return []
  }

  try {
    return JSON.parse(projectsData)
  } catch (error) {
    console.error("Failed to parse projects data:", error)
    return []
  }
}

// Helper function to save projects to localStorage
function saveProjectsToStorage(projects: Project[]): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

// Get all projects
export async function getAllProjects(): Promise<Project[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const projects = getProjectsFromStorage()

  // Calculate task counts for each project
  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const tasks = await getTasksByProject(project.id)
      const activeTasks = tasks.filter((task) => !task.deleted)
      const completedTaskCount = activeTasks.filter((task) => !task.deleted && task.status === "done").length
      const blockedTaskCount = activeTasks.filter((task) => !task.deleted && task.status === "blocked").length

      return {
        ...project,
        taskCount: activeTasks.length,
        completedTaskCount,
        blockedTaskCount,
      }
    }),
  )

  return projectsWithCounts
}

// Get project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const projects = getProjectsFromStorage()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return null
  }

  // Calculate task counts
  const tasks = await getTasksByProject(project.id)
  const activeTasks = tasks.filter((task) => !task.deleted)
  const completedTaskCount = activeTasks.filter((task) => task.status === "done").length
  const blockedTaskCount = activeTasks.filter((task) => task.status === "blocked").length

  return {
    ...project,
    taskCount: activeTasks.length,
    completedTaskCount,
    blockedTaskCount,
  }
}

// Create a new project
export async function createProject(data: CreateProjectInput): Promise<Project> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const projects = getProjectsFromStorage()

  const newProject: Project = {
    id: uuidv4(),
    name: data.name,
    description: data.description || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user-1", // Mock user ID
    deleted: false,
    taskCount: 0,
    completedTaskCount: 0,
    blockedTaskCount: 0,
  }

  saveProjectsToStorage([...projects, newProject])

  return newProject
}

// Update a project
export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const projects = getProjectsFromStorage()
  const projectIndex = projects.findIndex((p) => p.id === id)

  if (projectIndex === -1) {
    return null
  }

  const updatedProject = {
    ...projects[projectIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  projects[projectIndex] = updatedProject
  saveProjectsToStorage(projects)

  return updatedProject
}

// Soft delete a project
export async function softDeleteProject(id: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const projects = getProjectsFromStorage()
  const projectIndex = projects.findIndex((p) => p.id === id)

  if (projectIndex === -1) {
    return false
  }

  projects[projectIndex] = {
    ...projects[projectIndex],
    deleted: true,
    updatedAt: new Date().toISOString(),
  }

  saveProjectsToStorage(projects)

  return true
}
