"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Edit, MoreHorizontal, Sparkles, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { getAllProjects, softDeleteProject } from "../lib/projects"
import { getTasksByProject } from "../lib/tasks"
import type { Project } from "../lib/types"
import { formatDate } from "../lib/utils"

export function ProjectList() {
  const [projects, setProjects] = useState<(Project & { progress: number })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      try {
        const allProjects = await getAllProjects()
        const activeProjects = allProjects.filter((p) => !p.deleted)

        // Get progress for each project
        const projectsWithProgress = await Promise.all(
          activeProjects.map(async (project) => {
            const tasks = await getTasksByProject(project.id)
            const activeTasks = tasks.filter((t) => !t.deleted)
            const completedTasks = activeTasks.filter((t) => t.status === "done")

            const progress = activeTasks.length > 0 ? Math.round((completedTasks.length / activeTasks.length) * 100) : 0

            return {
              ...project,
              progress,
              taskCount: activeTasks.length,
              completedTaskCount: completedTasks.length,
              blockedTaskCount: activeTasks.filter((t) => t.status === "blocked").length,
            }
          }),
        )

        setProjects(projectsWithProgress)
      } catch (error) {
        console.error("Failed to load projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleDelete = async (id: string) => {
    await softDeleteProject(id)
    setProjects(projects.filter((project) => project.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
        <p className="text-muted-foreground mb-4">Create your first project to get started</p>
        <Link to="/projects/new">
          <Button className="bg-primary hover:bg-primary/90">Create Project</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden border-slate-200 transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl text-primary">{project.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link to={`/projects/${project.id}/edit`}>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </Link>
                  <Link to={`/projects/${project.id}/ai-tasks`}>
                    <DropdownMenuItem>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Generate Tasks
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => handleDelete(project.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {project.taskCount} tasks
                </Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  {project.completedTaskCount} completed
                </Badge>
                {project.blockedTaskCount > 0 && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    {project.blockedTaskCount} blocked
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <p className="text-sm text-muted-foreground">Created on {formatDate(project.createdAt)}</p>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100">
            <Link to={`/projects/${project.id}`} className="w-full">
              <Button variant="ghost" className="w-full justify-between hover:bg-white hover:text-primary">
                View Project
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
