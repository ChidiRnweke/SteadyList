import { redirect } from "react-router"
import { getProjectById } from "../../lib/projects"
import { TaskForm } from "../../components/task-form"
import type { Route } from "./+types/route"

export async function loader({ params, request }: Route.LoaderArgs) {
  const project = await getProjectById(params.id)
  if (!project) {
    return redirect("/projects")
  }

  // Extract status from URL query parameter
  const url = new URL(request.url)
  const status = url.searchParams.get("status") as "todo" | "in-progress" | "blocked" | "done" | null

  return { project, status }
}

export default function NewTaskPage({ loaderData }: Route.ComponentProps) {
  const { project, status } = loaderData

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Create New Task</h1>
        <p className="text-muted-foreground mb-6">
          Add a new task to {project.name}
          {status && <span className="ml-1">with status: <span className="font-medium capitalize">{status.replace('-', ' ')}</span></span>}
        </p>
        <TaskForm projectId={project.id} initialStatus={status || undefined} />
      </div>
    </div>
  )
}
