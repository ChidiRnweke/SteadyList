"use client"

import { useFetcher } from "react-router";
import { Link } from "react-router"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Edit, MoreHorizontal, Sparkles, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import type { Project, Task } from "../lib/types"
import { formatDate } from "../lib/utils"

interface ProjectListProps {
  projects: Project[]
  tasks: Task[]
}

export function ProjectList({ projects, tasks }: ProjectListProps) {
  const fetcher = useFetcher()
  let busy = fetcher.state !== "idle";


  const activeProjects = projects.filter((p) => !p.deleted)

  const projectsWithProgress =
    activeProjects.map((project) => {
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
    })


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
      {projectsWithProgress.map((project) => (
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
                  <DropdownMenuItem asChild>

                    <Link to={`/projects/${project.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>

                  <Link to={`/projects/${project.id}/ai-tasks`}>
                    <DropdownMenuItem>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Generate Tasks
                    </DropdownMenuItem>
                  </Link>
                  <fetcher.Form method="delete" action={`/projects/${project.id}`}>
                    <DropdownMenuItem className="text-destructive">
                      <Button type="submit" variant="ghost" className="w-full justify-between hover:bg-white hover:text-primary" disabled={busy}  >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </DropdownMenuItem>
                  </fetcher.Form>
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
