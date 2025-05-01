import { NoteForm } from "../../components/note-form"
import { getAllProjects } from "../../lib/projects"
import { createNote } from "../../lib/notes"
import { redirect } from "react-router"
import type { Route } from './+types/route'

export async function loader() {
  const projects = await getAllProjects()
  return { projects }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const projectId = formData.get("projectId") as string
  const shareable = formData.get("shareable") === "true"

  // Validate required fields
  if (!title) {
    return { error: "Title is required" }
  }

  // Create new note
  const note = await createNote({
    title,
    content: content || "",
    projectId: projectId === "none" ? "" : projectId,
    shareable
  })

  return redirect(`/notes/${note.id}`)
}

export default function NewNotePage({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData

  return (
    <NoteForm projects={projects} />
  )
}
