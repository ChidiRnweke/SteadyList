import { useState } from "react"
import { NotesSidebar } from "../../components/notes-sidebar"
import { NotesList } from "../../components/notes-list"
import { Button } from "../../components/ui/button"
import { Plus, FileText } from "lucide-react"
import { Link, Outlet, useRouteLoaderData, useLocation } from "react-router"
import { getAllNotes } from "~/lib/notes"
import { getProjectById, getAllProjects } from "~/lib/projects"
import type { Route } from './+types/route'

export async function loader() {
  const allNotes = await getAllNotes()
  const activeNotes = allNotes.filter((note) => !note.deleted)
  const projects = await getAllProjects()

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

  return { notes: notesWithProjects, projects }
}

export default function NotesLayout({ loaderData }: Route.ComponentProps) {
  const { notes, projects } = loaderData
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation();

  // Check if we're at the index route with no specific note selected
  const isIndexRoute = location.pathname === "/notes" || location.pathname === "/notes/"

  // Check if we're in note creation mode
  const isNewNote = location.pathname.includes("/notes/new")

  // For edit or view pages, show a cleaner layout without extra chrome
  const isEditOrViewPage = !isIndexRoute && !isNewNote

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <NotesSidebar
        notes={notes}
        projects={projects}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      {isIndexRoute ? (
        <div className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary">All Notes</h1>
              <Link to="/notes/new">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </Link>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-16 bg-background rounded-lg border">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                <p className="text-muted-foreground mb-4">Start by creating your first note</p>
                <Link to="/notes/new">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Note
                  </Button>
                </Link>
              </div>
            ) : (
              <NotesList notes={notes} />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
          <Outlet />
        </div>
      )}
    </div>
  )
}
