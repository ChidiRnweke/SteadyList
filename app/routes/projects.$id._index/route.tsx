import { redirect } from "react-router";
import { getProjectById, softDeleteProject } from "../../lib/projects";
import { getTasksByProject } from "../../lib/tasks";
import { getNotesByProject } from "../../lib/notes";
import { KanbanBoard } from "../../components/kanban-board";
import { ProjectHeader } from "../../components/project-header";
import type { Route } from "./+types/route";

export async function action({ request, params }: Route.ActionArgs) {
  console.log("action", request, params);
  const method = request.method;
  if (method === "DELETE") {
    await softDeleteProject(params.id);
  }
}

export async function loader({ params }: Route.LoaderArgs) {
  const projectId = params.id;
  const [project, tasks, notes] = await Promise.all([
    getProjectById(projectId),
    getTasksByProject(projectId),
    getNotesByProject(projectId),
  ]);

  return { project, tasks, notes };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const serverData = await serverLoader();
  const project = serverData.project;
  const tasks = serverData.tasks;
  const notes = serverData.notes;

  return { project, tasks, notes };
}

export default function ProjectPage({ loaderData }: Route.ComponentProps) {
  const { project, tasks, notes } = loaderData;

  if (!project) {
    return redirect("/projects");
  }

  return (
    <div className="space-y-8">
      <ProjectHeader project={project} />

      <KanbanBoard tasks={tasks} projectId={project.id} />
    </div>
  );
}
