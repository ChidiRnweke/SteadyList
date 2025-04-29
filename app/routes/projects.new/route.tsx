import { redirect } from "react-router"
import { getSession } from "../../lib/auth"
import { DashboardHeader } from "../../components/dashboard-header"
import { ProjectForm } from "../../components/project-form"

export default function NewProjectPage() {
  const session = getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />
      <div>
        <h1 className="text-3xl font-bold mb-6 text-primary">Create New Project</h1>
        <ProjectForm />
      </div>
    </div>
  )
}
