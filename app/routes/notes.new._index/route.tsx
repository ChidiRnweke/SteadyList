import { NoteForm } from "../../components/note-form"

export default function NewNotePage() {

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6 text-primary">Create New Note</h1>
        <NoteForm />
      </div>
    </div>
  )
}
