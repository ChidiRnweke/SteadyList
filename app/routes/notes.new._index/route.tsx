import { DashboardHeader } from "../../components/dashboard-header"
import { NoteForm } from "../../components/note-form"

export default function NewNotePage() {

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />
      <div>
        <h1 className="text-3xl font-bold mb-6 text-primary">Create New Note</h1>
        <NoteForm />
      </div>
    </div>
  )
}
