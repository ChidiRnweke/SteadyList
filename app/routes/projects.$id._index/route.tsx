import { redirect } from "react-router"
import { getSession } from "../../lib/auth"
import { getProjectById, softDeleteProject } from "../../lib/projects"
import { getTasksByProject } from "../../lib/tasks"
import { getNotesByProject } from "../../lib/notes"
import { DashboardHeader } from "../../components/dashboard-header"
import { KanbanBoard } from "../../components/kanban-board"
import { ProjectHeader } from "../../components/project-header"
import { ProjectNotes } from "../../components/project-notes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Notebook, KanbanIcon as LayoutKanban } from "lucide-react"
import type { Route } from "./+types/route"


export async function action({ request, params }: Route.ActionArgs) {
  console.log("action", request, params)
  const method = request.method
  if (method === "DELETE") {
    await softDeleteProject(params.id)
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  const projectId = params.id;
  const project = await getProjectById(projectId);
  const tasks = await getTasksByProject(projectId);
  const notes = await getNotesByProject(projectId);

  if (!project) {
    return redirect("/projects");
  }

  return { project, tasks, notes };
}

export default function ProjectPage({ loaderData }: Route.ComponentProps) {
  const { project, tasks, notes } = loaderData

  if (!project) {
    return redirect("/projects")
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
          <KanbanBoard tasks={tasks} projectId={project.id} />
        </TabsContent>
        <TabsContent value="notes">
          <ProjectNotes projectId={project.id} notes={notes} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
