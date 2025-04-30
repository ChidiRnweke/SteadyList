"use client"

import { Link } from "react-router"
import { useNavigate } from "react-router"
import { Button } from "./ui/button"
import { Edit, Plus, Sparkles, Trash2 } from "lucide-react"
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
import type { Project } from "../lib/types"
import { formatDate } from "../lib/utils"

interface ProjectHeaderProps {
  project: Project
}
const onDelete = async (id: string) => {
  console.log("Deleting project", id)
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const navigate = useNavigate()

  const handleDelete = async () => {
    await onDelete(project.id)
    navigate("/projects")
    navigate(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{project.name}</h1>
          <p className="text-muted-foreground mt-1">Created on {formatDate(project.createdAt)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/projects/${project.id}/tasks/new`}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </Link>

          <Link to={`/projects/${project.id}/ai-tasks`}>
            <Button variant="outline" className="border-secondary/20 text-secondary hover:bg-secondary/10">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Generate
            </Button>
          </Link>

          <Link to={`/projects/${project.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>

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
