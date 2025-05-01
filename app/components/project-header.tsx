"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router"
import { useNavigate } from "react-router"
import { useFetcher } from "react-router"
import { Button } from "./ui/button"
import { Edit, Plus, Sparkles, Trash2, RefreshCcw } from "lucide-react"
import { Badge } from "./ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu"
import { toast } from "sonner"
import type { Project, Task } from "../lib/types"
import { formatDate } from "../lib/utils"

interface ProjectHeaderProps {
  project: Project
}

type ProjectDeletedTask = Task & { projectName: string; projectDeleted: boolean };

const onDelete = async (id: string) => {
  console.log("Deleting project", id)
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const [deletedTasks, setDeletedTasks] = useState<ProjectDeletedTask[]>([])
  const [restoredIds, setRestoredIds] = useState<string[]>([])

  // Fetch deleted tasks for this project
  useEffect(() => {
    fetcher.load("/trash")
  }, [project.id])

  // Update deleted tasks when data changes
  useEffect(() => {
    if (fetcher.data && fetcher.data.deletedTasks) {
      // Filter for deleted tasks that belong to this project
      const projectDeletedTasks = fetcher.data.deletedTasks.filter(
        (task: ProjectDeletedTask) => task.projectId === project.id
      )
      setDeletedTasks(projectDeletedTasks)
    }
  }, [fetcher.data, project.id])

  // Handle restore action responses
  useEffect(() => {
    if (fetcher.data && fetcher.data.success) {
      toast.success(fetcher.data.message)
    }
  }, [fetcher.state])

  const handleDelete = async () => {
    await onDelete(project.id)
    navigate("/projects")
  }

  const handleRestore = (taskId: string) => {
    setRestoredIds(prev => [...prev, taskId])
    fetcher.submit(
      { id: taskId, type: "task" },
      { method: "post", action: "/trash" }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{project.name}</h1>
          <p className="text-muted-foreground mt-1">Created on {formatDate(project.createdAt)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {deletedTasks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-secondary border-secondary/20 hover:bg-secondary/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Trash ({deletedTasks.length})
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Deleted Tasks ({deletedTasks.length})</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {deletedTasks.map(task => (
                  <DropdownMenuItem
                    key={task.id}
                    disabled={restoredIds.includes(task.id)}
                    className="py-2"
                  >
                    <div className="flex flex-col w-full gap-1">
                      <div className="flex justify-between items-start">
                        <span className="font-medium truncate max-w-[180px]">{task.title}</span>
                        <Badge
                          variant="outline"
                          className={`
                            ${task.status === 'todo' ? 'bg-secondary/10 text-secondary border-secondary/30' : ''}
                            ${task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : ''}
                            ${task.status === 'blocked' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                            ${task.status === 'done' ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}
                            text-[10px] py-0 h-5
                          `}
                        >
                          {task.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs p-0 px-2"
                          disabled={restoredIds.includes(task.id)}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleRestore(task.id)
                          }}
                        >
                          <RefreshCcw className="h-3 w-3 mr-1" />
                          {restoredIds.includes(task.id) ? "Restoring..." : "Restore"}
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button className="bg-primary hover:bg-primary/90" asChild>
            <Link to={`/projects/${project.id}/tasks/new`} >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Link>
          </Button>

          <Button variant="outline" className="border-secondary/20 text-secondary hover:bg-secondary/10" asChild>
            <Link to={`/projects/${project.id}/tasks/new`} >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Generate
            </Link>
          </Button>


          <Button variant="outline" asChild>
            <Link to={`/projects/${project.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the project and all its tasks. This action can be undone from the trash.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {project.description && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-slate-700">{project.description}</p>
        </div>
      )}
    </div>
  )
}
