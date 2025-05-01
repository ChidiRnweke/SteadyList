import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { getNoteById } from "../../lib/notes"
import { getProjectById } from "../../lib/projects"
import { formatDate, formatDateRelative } from "../../lib/utils"
import { ArrowLeft, Calendar, ExternalLink, FileText, Clock } from "lucide-react"
import { Link } from "react-router"
import type { Route } from './+types/route'

export async function loader({ params }: Route.LoaderArgs) {
    const noteId = params.id

    if (!noteId) {
        throw new Error("Note ID is required")
    }

    const note = await getNoteById(noteId)

    if (!note) {
        throw new Error("Note not found")
    }

    if (!note.shareable) {
        throw new Error("This note is not shareable")
    }

    // Get project info if the note is linked to a project
    let project = null
    if (note.projectId) {
        project = await getProjectById(note.projectId)
    }

    return { note, project }
}

export default function SharedNotePage({ loaderData }: Route.ComponentProps) {
    const { note, project } = loaderData

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Header Bar */}
            <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-primary truncate">{note.title}</h1>
                </div>

                <Badge variant="secondary" className="gap-1 font-normal">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Shared Note
                </Badge>
            </div>

            {/* Info Bar */}
            <div className="px-4 py-2 bg-muted/20 text-xs text-muted-foreground flex items-center gap-3 overflow-x-auto">
                <div className="flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDateRelative(note.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    <span>Updated {formatDateRelative(note.updatedAt)}</span>
                </div>

                {project && (
                    <Badge variant="outline" className="font-normal text-xs h-5 whitespace-nowrap">
                        {project.name}
                    </Badge>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                <div
                    className="prose prose-sm sm:prose max-w-none prose-headings:text-primary prose-a:text-blue-600"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                />
            </div>

            {/* Footer */}
            <div className="text-center p-4 text-xs text-muted-foreground border-t">
                <p>This note was shared from SteadyList - a task and note management application.</p>
            </div>
        </div>
    )
} 