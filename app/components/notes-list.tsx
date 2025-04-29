"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { getAllNotes, softDeleteNote } from "../lib/notes"
import { getProjectById } from "../lib/projects"
import { formatDate } from "../lib/utils"
import type { Note } from "../lib/types"

export function NotesList() {
  const [notes, setNotes] = useState<(Note & { projectName?: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true)
      try {
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

        setNotes(notesWithProjects)
      } catch (error) {
        console.error("Failed to load notes:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [])

  const handleDelete = async (id: string) => {
    await softDeleteNote(id)
    setNotes(notes.filter((note) => note.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No notes yet</h3>
        <p className="text-muted-foreground mb-4">Create your first note to get started</p>
        <Link to="/notes/new">
          <Button className="bg-primary hover:bg-primary/90">Create Note</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <Card key={note.id} className="overflow-hidden border-slate-200 transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl text-primary">{note.title}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link to={`/notes/${note.id}/edit`}>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => handleDelete(note.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>Created on {formatDate(note.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>

              {note.projectName && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Project: {note.projectName}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
