import { redirect } from "react-router"
import { getSession } from "../../../../../lib/auth"
import { getProjectById } from "../../../../../lib/projects"
import { DashboardHeader } from "../../../../../components/dashboard-header"
import { TaskForm } from "../../../../../components/task-form"

interface NewTaskPageProps {
  params: {
    id: string
  }
}

export default async function NewTaskPage({ params }: NewTaskPageProps) {
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
        <h1 className="text-3xl font-bold text-primary mb-2">Create New Task</h1>
        <p className="text-muted-foreground mb-6">Add a new task to {project!.name}</p>
        <TaskForm projectId={params.id} />
      </div>
    </div>
  )
}
