"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import type { Project, Task } from "../lib/types"
import { ArrowRight, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DashboardTasksProps {
  tasks: Task[]
  projects: Project[]
}

const getProjectName = (projectId: string, projects: Project[]) => {
  const project = projects.find((p) => p.id === projectId)
  return project ? project.name : "Unknown Project"
}

export function DashboardTasks({ tasks, projects }: DashboardTasksProps) {


  const getStatusColor = (status: string) => {
    switch (status) {
      case "blocked":
        return "bg-destructive/10 text-destructive border-destructive/30"
      case "todo":
        return "bg-secondary/10 text-secondary border-secondary/30"
      case "in-progress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30"
      case "done":
        return "bg-green-500/10 text-green-500 border-green-500/30"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-primary">Important Tasks</CardTitle>
          <CardDescription>Tasks that need your attention</CardDescription>
        </div>
        <Link to="/projects">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pb-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No important tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link key={task.id} to={`/projects/${task.projectId}`}>
                <div className="p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge variant="outline" className={getStatusColor(task.status)}>
                      {task.status === "in-progress"
                        ? "In Progress"
                        : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{getProjectName(task.projectId, projects)}</p>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </Badge>

                    {task.dueDate && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
