import { redirect } from "react-router"
import { getSession } from "../../lib/auth"
import { DashboardHeader } from "../../components/dashboard-header"
import { ProjectList } from "../../components/project-list"
import { Button } from "../../components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router"
import { getAllProjects } from "~/lib/projects"
import { getAllTasks } from "~/lib/tasks"
import type { Route } from "../+types/_index"

export async function loader() {
  const projects = await getAllProjects()
  const tasks = await getAllTasks()
  return { projects, tasks }
}
export default function ProjectsPage({ loaderData }: Route.ComponentProps) {
  const { projects, tasks } = loaderData
  const session = getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Projects</h1>
        <Link to="/projects/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <ProjectList projects={projects} tasks={tasks} />
    </div>
  )
}
