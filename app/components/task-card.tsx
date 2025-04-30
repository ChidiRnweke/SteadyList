"use client"

import { Link } from "react-router"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Calendar, Edit, MoreHorizontal, Trash2, Bell } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import type { Task } from "../lib/types"
import { formatDate } from "../lib/utils"
import { useFetcher } from "react-router"

interface TaskCardProps {
  task: Task
  projectId: string
}

export function TaskCard({ task, projectId }: TaskCardProps) {
  const fetcher = useFetcher()
  let busy = fetcher.state !== "idle";


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-secondary/10 text-secondary border-secondary/30"
      case "in-progress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30"
      case "blocked":
        return "bg-destructive/10 text-destructive border-destructive/30"
      case "done":
        return "bg-green-500/10 text-green-500 border-green-500/30"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

  return (
    <Card className="shadow-sm hover:shadow transition-shadow border-slate-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium line-clamp-2">{task.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link to={`/projects/${projectId}/tasks/${task.id}/edit`}>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Link>

              <DropdownMenuItem className="text-destructive">
                <fetcher.Form method="delete" action={`/projects/${projectId}/tasks/${task.id}`}>
                  <Button type="submit" variant="ghost" className="m-0 p-0 has-[>svg]:px-0">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </fetcher.Form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>}

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className={getPriorityColor(task.priority)}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>

          {task.dueDate && (
            <Badge variant="outline" className={isOverdue ? "text-destructive border-destructive/30" : ""}>
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(task.dueDate)}
              {isOverdue && " (Overdue)"}
            </Badge>
          )}

          {task.reminder && (
            <Badge variant="outline" className="text-primary border-primary/30">
              <Bell className="mr-1 h-3 w-3" />
              Reminder set
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link to={`/projects/${projectId}/tasks/${task.id}/edit`} className="w-full">
          <Button variant="ghost" size="sm" className="w-full justify-start hover:text-primary">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card >
  )
}
