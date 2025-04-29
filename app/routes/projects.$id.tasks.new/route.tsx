import { redirect } from "react-router"
import { getSession } from "../../lib/auth"
import { getProjectById } from "../../lib/projects"
import { DashboardHeader } from "../../components/dashboard-header"
import { TaskForm } from "../../components/task-form"
import type { Project } from "~/lib/types"
import type { Route } from "./+types/route"



export async function loader({ params }: Route.LoaderArgs): Promise<Project> {
  const project = await getProjectById(params.id)
  return project!
}

export default function NewTaskPage(loaderData: Route.ComponentProps) {
  const project = loaderData.loaderData

  if (!project) {
    redirect("/projects")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Create New Task</h1>
        <p className="text-muted-foreground mb-6">Add a new task to {project!.name}</p>
        <TaskForm projectId={project.id} />
      </div>
    </div>
  )
}
