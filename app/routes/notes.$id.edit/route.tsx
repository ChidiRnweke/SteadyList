
import { getNoteById } from "../../lib/notes"
import { NoteForm } from "../../components/note-form"
import type { Note } from "../../lib/types"
import type { Route } from "./+types/route"

export async function loader({ params }: Route.LoaderArgs): Promise<Note> {
  const noteData = await getNoteById(params.id)
  return noteData!
}

export default function EditNotePage(loaderData: Route.ComponentProps) {


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6 text-primary">Edit Note</h1>
        {<NoteForm note={loaderData.loaderData} />}
      </div>
    </div>

  )
}


