import { redirect } from "react-router"
import { getSession } from "../../../lib/auth"
import { getProjectById } from "../../../lib/projects"
import { DashboardHeader } from "../../../components/dashboard-header"
import { KanbanBoard } from "../../../components/kanban-board"
import { ProjectHeader } from "../../../components/project-header"
import { ProjectNotes } from "../../../components/project-notes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Notebook, KanbanIcon as LayoutKanban } from "lucide-react"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
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
      <ProjectHeader project={project} />

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tasks" className="flex items-center">
            <LayoutKanban className="mr-2 h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center">
            <Notebook className="mr-2 h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <KanbanBoard projectId={params.id} />
        </TabsContent>
        <TabsContent value="notes">
          <ProjectNotes projectId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
