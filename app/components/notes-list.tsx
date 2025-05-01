"use client"

import { Link } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Edit, MoreHorizontal, Trash2, Share2, FileText, Calendar, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { formatDate, formatDateRelative } from "../lib/utils"
import type { Note } from "../lib/types"
import { useFetcher } from "react-router"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { toast } from "sonner"

interface NotesListProps {
  notes: (Note & { projectName?: string })[]
}

export function NotesList({ notes }: NotesListProps) {
  const fetcher = useFetcher()

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg border bg-slate-50/50">
        <h3 className="text-lg font-medium mb-2">No notes yet</h3>
        <p className="text-muted-foreground mb-4">Create your first note to get started</p>
        <Link to="/notes/new">
          <Button className="bg-primary hover:bg-primary/90">Create Note</Button>
        </Link>
      </div>
    )
  }

  function copyShareLink(noteId: string) {
    const shareUrl = `${window.location.origin}/shared-notes/${noteId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard");
  }

  // Safely extract a text preview from HTML content
  function getContentPreview(htmlContent: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > 160 ? text.substring(0, 160) + '...' : text;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {notes.map((note) => (
        <Link key={note.id} to={`/notes/${note.id}`} className="group block">
          <Card className="h-full overflow-hidden border-slate-200 transition-all hover:border-primary/30 hover:shadow-md">
            <CardHeader className="pb-2 flex flex-row justify-between">
              <div>
                <CardTitle className="text-lg font-medium text-primary line-clamp-1 group-hover:text-primary/80">
                  {note.title}
                </CardTitle>

                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateRelative(note.updatedAt)}
                  </span>

                  {note.projectName && (
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                      {note.projectName}
                    </span>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
                  <Link to={`/notes/${note.id}/edit`}>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </Link>

                  {note.shareable && (
                    <>
                      <DropdownMenuItem onClick={() => copyShareLink(note.id)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Copy share link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <Link to={note.projectId ? `/projects/${note.projectId}/tasks/new?fromNote=true` : `/tasks/new?fromNote=true`}>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      Create task
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator />

                  <fetcher.Form method="delete" action={`/notes/${note.id}`}>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </fetcher.Form>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent className="pb-3">
              <div className="text-sm text-muted-foreground line-clamp-3">
                {getContentPreview(note.content)}
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {note.shareable && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs font-normal flex items-center gap-1">
                          <Share2 className="h-3 w-3" /> Shareable
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This note can be shared with others</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <Button variant="ghost" size="sm" className="text-xs font-normal text-muted-foreground">
                View note
              </Button>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}
