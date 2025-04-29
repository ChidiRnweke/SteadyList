import { redirect } from "react-router"
import { getSession } from "../../../../../../lib/auth"
import { getProjectById } from "../../../../../../lib/projects"
import { getTaskById } from "../../../../../../lib/tasks"
import { DashboardHeader } from "../../../../../../components/dashboard-header"
import { TaskForm } from "../../../../../../components/task-form"

interface EditTaskPageProps {
  params: {
    id: string
    taskId: string
  }
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const project = await getProjectById(params.id)

  if (!project) {
    redirect("/projects")
  }

  const task = await getTaskById(params.taskId)

  if (!task || task.projectId !== params.id) {
    redirect("/projects")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Edit Task</h1>
        <p className="text-muted-foreground mb-6">Update task details</p>
        <TaskForm projectId={params.id} task={task} />
      </div>
    </div>
  )
}
