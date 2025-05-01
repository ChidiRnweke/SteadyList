import { redirect } from "react-router"
import { getProjectById } from "../../lib/projects"
import { TaskForm } from "../../components/task-form"
import type { Route } from "./+types/route"



export async function loader({ params }: Route.LoaderArgs) {
  const project = await getProjectById(params.id)
  if (!project) {
    return redirect("/projects")
  }
  return { project }
}


export default function NewTaskPage({ loaderData }: Route.ComponentProps) {
  const { project } = loaderData

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Create New Task</h1>
        <p className="text-muted-foreground mb-6">Add a new task to {project.name}</p>
        <TaskForm projectId={project.id} />
      </div>
    </div>
  )
}
