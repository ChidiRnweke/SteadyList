import { getTaskById } from "../../lib/tasks"
import { DashboardHeader } from "../../components/dashboard-header"
import { TaskForm } from "../../components/task-form"
import type { Task } from "~/lib/types"
import type { Route } from "./+types/route"


export async function loader({ params }: Route.LoaderArgs): Promise<Task> {
  const task = await getTaskById(params.taskId)
  return task!
}

export default function EditTaskPage(loaderData: Route.ComponentProps) {
  const task = loaderData.loaderData



  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Edit Task</h1>
        <p className="text-muted-foreground mb-6">Update task details</p>
        <TaskForm projectId={task.projectId} />
      </div>
    </div>
  )
}
