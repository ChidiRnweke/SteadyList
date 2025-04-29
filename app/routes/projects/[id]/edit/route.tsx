import { redirect } from "react-router"
import { getSession } from "../../../../lib/auth"
import { getProjectById } from "../../../../lib/projects"
import { DashboardHeader } from "../../../../components/dashboard-header"
import { ProjectForm } from "../../../../components/project-form"

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const project = await getProjectById(params.id)

  if (!project) {
    redirect("/projects")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />
      <div>
        <h1 className="text-3xl font-bold mb-6 text-primary">Edit Project</h1>
        <ProjectForm project={project} />
      </div>
    </div>
  )
}
