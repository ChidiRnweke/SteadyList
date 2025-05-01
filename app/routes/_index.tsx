import { getAllProjects } from "~/lib/projects"
import { getAllTasks } from "~/lib/tasks"
import { DashboardMetrics } from "../components/dashboard-metrics"
import { DashboardTasks } from "../components/dashboard-tasks"
import { DashboardProjects } from "../components/dashboard-projects"
import type { Task, Project } from "~/lib/types"
import type { Route } from './+types/_index'

export async function loader(): Promise<{ tasks: Task[], projects: Project[] }> {
  const tasks = await getAllTasks()
  const projects = await getAllProjects()
  return { tasks, projects }
}


export default function Home({ loaderData }: Route.ComponentProps) {
  const { tasks, projects } = loaderData
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

        <DashboardMetrics tasks={tasks} projects={projects} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DashboardProjects projects={projects} tasks={tasks} />
          <DashboardTasks tasks={tasks} projects={projects} />
        </div>
      </div>
    </div>
  )
}
