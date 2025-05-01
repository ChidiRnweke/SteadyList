import { NotesList } from "../../components/notes-list"
import { Button } from "../../components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router"
import { getAllNotes, softDeleteNote } from "~/lib/notes"
import { getProjectById } from "~/lib/projects"
import type { Route } from './+types/route'

const onDelete = async (id: string) => {
  await softDeleteNote(id)
}

export async function loader() {
  const allNotes = await getAllNotes()
  const activeNotes = allNotes.filter((note) => !note.deleted)

  // Get project names for notes that are linked to projects
  const notesWithProjects = await Promise.all(
    activeNotes.map(async (note) => {
      if (note.projectId) {
        const project = await getProjectById(note.projectId)
        return {
          ...note,
          projectName: project?.name,
        }
      }
      return note
    }),
  )

  return { notes: notesWithProjects }
}

export default function NotesPage({ loaderData }: Route.ComponentProps) {
  const { notes } = loaderData

  return (
    <div className="space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Notes</h1>
        <Link to="/notes/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </Link>
      </div>

      <NotesList notes={notes} />
    </div>
  )
}
