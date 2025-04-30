import { redirect } from "react-router"
import { getProjectById } from "../../lib/services/projects"
import { DashboardHeader } from "../../components/dashboard-header"
import { ProjectForm } from "../../components/project-form"
import type { Project } from "~/lib/types"
import type { Route } from "./+types/route"



export async function loader({ params }: Route.LoaderArgs): Promise<Project> {
  const project = await getProjectById(params.id)
  return project!
}

export default function EditProjectPage(loaderData: Route.ComponentProps) {
  const project = loaderData.loaderData

  if (!project) {
    redirect("/projects")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />
      <div>
        <h1 className="text-3xl font-bold mb-6 text-primary">Edit Project</h1>
        <ProjectForm project={project!} />
      </div>
    </div>
  )
}
