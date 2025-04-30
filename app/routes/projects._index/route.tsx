import { redirect } from "react-router"
import { getSession } from "../../lib/auth"
import { DashboardHeader } from "../../components/dashboard-header"
import { ProjectList } from "../../components/project-list"
import { Button } from "../../components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router"
import { getAllProjects, createProject } from "~/lib/projects"
import { getAllTasks } from "~/lib/tasks"
import type { Route } from "./+types/route"


export async function loader() {
  const session = await getSession()

  if (!session) {
    return redirect("/login")
  }

  const projects = await getAllProjects()
  const tasks = await getAllTasks()
  return { projects, tasks }
}

export async function action({ request }: Route.ActionArgs) {
  const method = request.method

  if (method === "POST") {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    const project = await createProject({ name, description })
    return redirect(`/projects/${project.id}`)
  }
}

export default function ProjectsPage({ loaderData }: Route.ComponentProps) {
  const { projects, tasks } = loaderData

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
