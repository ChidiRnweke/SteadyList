"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { getAllTasks } from "../lib/tasks"
import { getAllProjects } from "../lib/projects"
import { AlertCircle, Clock, ListTodo } from "lucide-react"

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
    blockedTasks: 0,
    dueSoonTasks: 0,
  })

  useEffect(() => {
    const loadMetrics = async () => {
      const [tasks, projects] = await Promise.all([getAllTasks(), getAllProjects()])

      const activeTasks = tasks.filter((task) => !task.deleted)
      const activeProjects = projects.filter((project) => !project.deleted)

      // Calculate due soon tasks (due in the next 48 hours)
      const now = new Date()
      const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)
      const dueSoonTasks = activeTasks.filter((task) => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate > now && dueDate <= in48Hours && task.status !== "done"
      })

      setMetrics({
        totalProjects: activeProjects.length,
        totalTasks: activeTasks.length,
        todoTasks: activeTasks.filter((task) => task.status === "todo").length,
        inProgressTasks: activeTasks.filter((task) => task.status === "in-progress").length,
        doneTasks: activeTasks.filter((task) => task.status === "done").length,
        blockedTasks: activeTasks.filter((task) => task.status === "blocked").length,
        dueSoonTasks: dueSoonTasks.length,
      })
    }

    loadMetrics()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          <FolderKanban className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{metrics.totalProjects}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">To Do Tasks</CardTitle>
          <ListTodo className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">{metrics.todoTasks}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Blocked Tasks</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{metrics.blockedTasks}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Due Soon</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{metrics.dueSoonTasks}</div>
        </CardContent>
      </Card>
    </div>
  )
}

function FolderKanban(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="M8 10v4" />
      <path d="M12 10v2" />
      <path d="M16 10v6" />
    </svg>
  )
}
