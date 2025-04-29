import { getSession } from "../lib/auth"
import { DashboardHeader } from "../components/dashboard-header"
import { DashboardMetrics } from "../components/dashboard-metrics"
import { DashboardProjects } from "../components/dashboard-projects"
import { DashboardTasks } from "../components/dashboard-tasks"
import { redirect } from "react-router"

export default function Home() {

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

        <DashboardMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DashboardProjects />
          <DashboardTasks />
        </div>
      </div>
    </div>
  )
}
