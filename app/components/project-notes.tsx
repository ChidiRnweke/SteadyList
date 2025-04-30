"use client"

import { useState } from "react"
import { Link } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { formatDate } from "../lib/utils"
import { Plus } from "lucide-react"
import type { Note } from "../lib/types"

interface ProjectNotesProps {
  projectId: string
  notes: Note[]
}

export function ProjectNotes({ projectId, notes }: ProjectNotesProps) {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary">Project Notes</h2>
        <Link to={`/notes/new?projectId=${projectId}`}>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border">
          <p className="text-muted-foreground mb-4">No notes for this project yet</p>
          <Link to={`/notes/new?projectId=${projectId}`}>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create First Note
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map((note) => (
            <Link key={note.id} to={`/notes/${note.id}/edit`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-primary">{note.title}</CardTitle>
                  <CardDescription>Created on {formatDate(note.createdAt)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4">{note.content}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
