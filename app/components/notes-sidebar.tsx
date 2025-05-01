"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import {
    ChevronRight,
    ChevronDown,
    Folder,
    File,
    Plus,
    Search,
    Settings,
    ChevronLeft
} from "lucide-react"
import { cn } from "../lib/utils"
import type { Note, Project } from "../lib/types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { Badge } from "./ui/badge"

interface NotesSidebarProps {
    notes: (Note & { projectName?: string })[]
    projects: Project[]
    collapsed?: boolean
    onToggleCollapse?: () => void
}

export function NotesSidebar({
    notes,
    projects,
    collapsed = false,
    onToggleCollapse
}: NotesSidebarProps) {
    const location = useLocation()
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedProjects, setExpandedProjects] = useState<string[]>([])

    // Expand all projects by default on first load
    useEffect(() => {
        setExpandedProjects(projects.map(p => p.id))
    }, [projects])

    const toggleProject = (projectId: string) => {
        setExpandedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        )
    }

    const filteredNotes = searchTerm
        ? notes.filter(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : notes

    // Group notes by project
    const notesByProject = filteredNotes.reduce((acc, note) => {
        const projectId = note.projectId || "none"
        if (!acc[projectId]) {
            acc[projectId] = []
        }
        acc[projectId].push(note)
        return acc
    }, {} as Record<string, typeof filteredNotes>)

    // Sort projects to ensure consistent display order
    const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name))

    if (collapsed) {
        return (
            <div className="w-12 border-r h-full flex flex-col bg-background transition-all duration-300 ease-in-out">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-none border-b"
                    onClick={onToggleCollapse}
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="flex flex-col items-center py-4 gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/notes/new">
                            <Plus className="h-5 w-5" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Search className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-64 border-r h-full flex flex-col bg-background transition-all duration-300 ease-in-out">
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium text-sm">Notes</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onToggleCollapse}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-2 border-b">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search notes..."
                        className="pl-8 h-9 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <ScrollArea className="h-full">
                    <div className="p-2">
                        <Link to="/notes/new" className="w-full">
                            <Button
                                variant="outline"
                                className="w-full justify-start text-sm h-9 mb-4"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                New Note
                            </Button>
                        </Link>

                        {/* Unassigned notes */}
                        {notesByProject["none"] && notesByProject["none"].length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-xs font-medium text-muted-foreground mb-1 px-2">PERSONAL NOTES</h4>
                                <div className="space-y-1">
                                    {notesByProject["none"].map(note => (
                                        <Link
                                            key={note.id}
                                            to={`/notes/${note.id}`}
                                            className={cn(
                                                "block px-2 py-1.5 text-sm rounded-md",
                                                location.pathname === `/notes/${note.id}`
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <div className="flex items-center">
                                                <File className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{note.title}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects with notes */}
                        {sortedProjects.map(project => {
                            const projectNotes = notesByProject[project.id] || []
                            if (projectNotes.length === 0 && searchTerm) return null

                            return (
                                <div key={project.id} className="mb-2">
                                    <Collapsible
                                        open={expandedProjects.includes(project.id)}
                                        onOpenChange={() => toggleProject(project.id)}
                                        className="transition-all duration-200"
                                    >
                                        <CollapsibleTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start p-2 h-8 text-xs font-medium"
                                            >
                                                {expandedProjects.includes(project.id) ? (
                                                    <ChevronDown className="h-4 w-4 mr-1 transition-transform duration-200" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 mr-1 transition-transform duration-200" />
                                                )}
                                                <Folder className="h-4 w-4 mr-2 text-amber-500" />
                                                <span className="truncate">{project.name}</span>

                                                {projectNotes.length > 0 && (
                                                    <Badge variant="outline" className="ml-auto h-5 px-1.5">
                                                        {projectNotes.length}
                                                    </Badge>
                                                )}
                                            </Button>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent className="transition-all duration-200">
                                            <div className="pl-7 pr-2 space-y-1 mt-1">
                                                {projectNotes.length > 0 ? (
                                                    projectNotes.map(note => (
                                                        <Link
                                                            key={note.id}
                                                            to={`/notes/${note.id}`}
                                                            className={cn(
                                                                "block px-2 py-1.5 text-sm rounded-md",
                                                                location.pathname === `/notes/${note.id}`
                                                                    ? "bg-primary/10 text-primary font-medium"
                                                                    : "hover:bg-muted"
                                                            )}
                                                        >
                                                            <div className="flex items-center">
                                                                <File className="h-4 w-4 mr-2 flex-shrink-0" />
                                                                <span className="truncate">{note.title}</span>
                                                            </div>
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                        No notes
                                                    </div>
                                                )}

                                                <Link
                                                    to={`/notes/new?projectId=${project.id}`}
                                                    className="block px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md"
                                                >
                                                    <div className="flex items-center">
                                                        <Plus className="h-3.5 w-3.5 mr-2" />
                                                        <span>Add note</span>
                                                    </div>
                                                </Link>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
} 