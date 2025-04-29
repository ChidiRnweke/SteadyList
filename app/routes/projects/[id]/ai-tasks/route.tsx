import { redirect } from "react-router"
import { getSession } from "../../../../lib/auth"
import { getProjectById } from "../../../../lib/projects"
import { DashboardHeader } from "../../../../components/dashboard-header"
import { AITaskGenerator } from "../../../../components/ai-task-generator"

interface AITasksPageProps {
  params: {
    id: string
  }
}

export default async function AITasksPage({ params }: AITasksPageProps) {
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
        <h1 className="text-3xl font-bold text-primary mb-2">AI Task Generator</h1>
        <p className="text-muted-foreground mb-6">Generate tasks for {project!.name} using AI</p>
        <AITaskGenerator projectId={params.id} projectName={project!.name} />
      </div>
    </div>
  )
}
