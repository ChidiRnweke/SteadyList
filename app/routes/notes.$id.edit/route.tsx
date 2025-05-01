import { getNoteById, updateNote } from "../../lib/notes"
import { getAllProjects } from "../../lib/projects"
import { NoteForm } from "../../components/note-form"
import { redirect } from "react-router"
import type { Route } from "./+types/route"

export async function loader({ params }: Route.LoaderArgs) {
  const noteData = await getNoteById(params.id)
  const projects = await getAllProjects()

  if (!noteData) {
    throw new Error("Note not found")
  }

  return { note: noteData, projects }
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const projectId = formData.get("projectId") as string
  const shareable = formData.get("shareable") === "true"

  // Validate required fields
  if (!title) {
    return { error: "Title is required" }
  }

  // Update note
  await updateNote(params.id, {
    title,
    content: content || "",
    projectId: projectId === "none" ? "" : projectId,
    shareable
  })

  return redirect(`/notes/${params.id}`)
}

export default function EditNotePage({ loaderData }: Route.ComponentProps) {
  const { note, projects } = loaderData

  return (
    <NoteForm note={note} projects={projects} />
  )
}


