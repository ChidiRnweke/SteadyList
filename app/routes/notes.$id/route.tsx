import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { getNoteById, softDeleteNote } from "../../lib/notes"
import { formatDate, formatDateRelative } from "../../lib/utils"
import { getProjectById, getAllProjects } from "../../lib/projects"
import {
    Edit,
    ArrowLeft,
    Share2,
    FileText,
    Trash2,
    Calendar,
    Clock,
    Copy,
    MoreHorizontal
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../../components/ui/dropdown-menu"
import { Link } from "react-router"
import { toast } from "sonner"
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

    // Get project info if the note is linked to a project
    let project = null
    if (note.projectId) {
        project = await getProjectById(note.projectId)
    }

    return { note, project }
}

export async function action({ params, request }: Route.ActionArgs) {
    const noteId = params.id
    const formData = await request.formData()
    const intent = formData.get("intent")

    if (intent === "delete") {
        await softDeleteNote(noteId)
        return { success: true }
    }

    return { success: false }
}

export default function NoteViewPage({ loaderData }: Route.ComponentProps) {
    const { note, project } = loaderData

    function copyShareLink() {
        const shareUrl = `${window.location.origin}/shared-notes/${note.id}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard");
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header Bar */}
            <div className="p-4 border-b flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary truncate">{note.title}</h1>

                <div className="flex items-center gap-2">
                    <Link to={`/notes/${note.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {note.shareable && (
                                <DropdownMenuItem onClick={copyShareLink}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy share link
                                </DropdownMenuItem>
                            )}

                            <Link to={note.projectId ? `/projects/${note.projectId}/tasks/new?fromNote=true` : `/tasks/new?fromNote=true`}>
                                <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Create task from note
                                </DropdownMenuItem>
                            </Link>

                            <DropdownMenuSeparator />

                            <form method="post">
                                <input type="hidden" name="intent" value="delete" />
                                <DropdownMenuItem className="text-destructive" asChild>
                                    <button type="submit" className="w-full flex items-center">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </button>
                                </DropdownMenuItem>
                            </form>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
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

                {note.shareable && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1 font-normal text-xs h-5 whitespace-nowrap">
                        <Share2 className="h-3 w-3" /> Shareable
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
        </div>
    )
} 