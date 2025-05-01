import { redirect } from "react-router"
import { getSession } from "../../lib/auth"
import { getProjectById } from "../../lib/projects"
import { AITaskGenerator } from "../../components/ai-task-generator"
import type { Project } from "~/lib/types"
import type { Route } from "./+types/route"


export async function loader({ params }: Route.LoaderArgs): Promise<Project> {
  const project = await getProjectById(params.id)
  return project!
}

export default function AITasksPage(loaderData: Route.ComponentProps) {
  const project = loaderData.loaderData

  if (!project) {
    redirect("/projects")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">AI Task Generator</h1>
        <p className="text-muted-foreground mb-6">Generate tasks for {project!.name} using AI</p>
        <AITaskGenerator projectId={project.id} projectName={project.name} />
      </div>
    </div>
  )
}
