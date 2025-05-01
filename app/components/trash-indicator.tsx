"use client"

import { useState, useEffect } from "react"
import { Trash2, RefreshCcw, ExternalLink, ChevronLeft } from "lucide-react"
import { Link } from "react-router"
import { useFetcher } from "react-router"
import { formatDistanceToNow } from "date-fns"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuLabel
} from "./ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "./ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import type { Task, Project } from "../lib/types"

interface TrashIndicatorProps {
    deletedTasks: (Task & { projectName: string; projectDeleted: boolean })[]
    deletedProjects: Project[]
}

export function TrashIndicator({ deletedTasks, deletedProjects }: TrashIndicatorProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("tasks")
    const [restoredIds, setRestoredIds] = useState<string[]>([])
    const totalItems = deletedTasks.length + deletedProjects.length
    const fetcher = useFetcher()
    const busy = fetcher.state !== "idle"

    // Show max 3 items in dropdown
    const recentTasks = deletedTasks.slice(0, 3)
    const recentProjects = deletedProjects.slice(0, 3)

    useEffect(() => {
        if (fetcher.data && fetcher.data.success) {
            toast.success(fetcher.data.message)
        } else if (fetcher.data && !fetcher.data.success) {
            toast.error(fetcher.data.message || "Failed to restore item")
        }
    }, [fetcher.data])

    const handleRestore = (type: 'task' | 'project', id: string) => {
        setRestoredIds(prev => [...prev, id])
        fetcher.submit(
            { id, type },
            { method: "post", action: "/trash" }
        )
    }

    if (totalItems === 0) return null

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Trash2 className="h-5 w-5" />
                        {totalItems > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                {totalItems}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Trash</span>
                        <Badge variant="outline" className="font-normal">{totalItems} item{totalItems !== 1 ? 's' : ''}</Badge>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {recentTasks.length > 0 && (
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Recent Tasks</DropdownMenuLabel>
                            {recentTasks.map(task => (
                                <DropdownMenuItem key={task.id} disabled={busy || restoredIds.includes(task.id) || task.projectDeleted} className="py-2">
                                    <div className="flex flex-col w-full gap-1">
                                        <div className="flex justify-between items-start w-full">
                                            <span className="font-medium truncate max-w-[180px]">{task.title}</span>
                                            <Badge
                                                variant="outline"
                                                className={`
                          ${task.status === 'todo' ? 'bg-secondary/10 text-secondary border-secondary/30' : ''}
                          ${task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : ''}
                          ${task.status === 'blocked' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                          ${task.status === 'done' ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}
                          text-[10px] py-0 h-5
                        `}
                                            >
                                                {task.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Project: {task.projectName}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs p-0 px-2"
                                                disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleRestore('task', task.id)
                                                }}
                                            >
                                                <RefreshCcw className="h-3 w-3 mr-1" />
                                                Restore
                                            </Button>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    )}

                    {recentProjects.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Recent Projects</DropdownMenuLabel>
                                {recentProjects.map(project => (
                                    <DropdownMenuItem key={project.id} disabled={busy || restoredIds.includes(project.id)} className="py-2">
                                        <div className="flex flex-col w-full gap-1">
                                            <div className="flex justify-between items-start w-full">
                                                <span className="font-medium">{project.name}</span>
                                                <Badge variant="outline" className="text-[10px] py-0 h-5 bg-secondary/10 text-secondary border-secondary/30">
                                                    {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    Deleted {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs p-0 px-2"
                                                    disabled={busy || restoredIds.includes(project.id)}
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        handleRestore('project', project.id)
                                                    }}
                                                >
                                                    <RefreshCcw className="h-3 w-3 mr-1" />
                                                    Restore
                                                </Button>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center" onSelect={() => setIsDialogOpen(true)}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        View all ({totalItems})
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-4 top-4 p-0 w-8 h-8"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <DialogTitle className="text-center pt-2">Trash</DialogTitle>
                        <DialogDescription className="text-center">
                            Deleted items will be permanently removed after 30 days
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="tasks">
                                Tasks ({deletedTasks.length})
                            </TabsTrigger>
                            <TabsTrigger value="projects">
                                Projects ({deletedProjects.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tasks" className="mt-4">
                            {deletedTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed">
                                    <Trash2 className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                                    <p className="text-muted-foreground">No deleted tasks</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {deletedTasks.map(task => (
                                        <div key={task.id} className={`border rounded-lg p-3 ${restoredIds.includes(task.id) ? 'opacity-50' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium">{task.title}</h3>
                                                <div className="flex gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`
                              ${task.status === 'todo' ? 'bg-secondary/10 text-secondary border-secondary/30' : ''}
                              ${task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : ''}
                              ${task.status === 'blocked' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                              ${task.status === 'done' ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}
                            `}
                                                    >
                                                        {task.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={`
                              ${task.priority === 'low' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                              ${task.priority === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                              ${task.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                            `}
                                                    >
                                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {task.description && (
                                                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-sm text-muted-foreground">Project: </span>
                                                    {task.projectDeleted ? (
                                                        <span className="ml-1 text-sm text-destructive flex items-center">
                                                            {task.projectName}
                                                            <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4 bg-destructive/10 text-destructive border-destructive/30">
                                                                deleted
                                                            </Badge>
                                                        </span>
                                                    ) : (
                                                        <span className="ml-1 text-sm">{task.projectName}</span>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
                                                    onClick={() => handleRestore('task', task.id)}
                                                >
                                                    <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                                                    {restoredIds.includes(task.id) ? "Restoring..." : "Restore"}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="projects" className="mt-4">
                            {deletedProjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed">
                                    <Trash2 className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                                    <p className="text-muted-foreground">No deleted projects</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {deletedProjects.map(project => (
                                        <div key={project.id} className={`border rounded-lg p-3 ${restoredIds.includes(project.id) ? 'opacity-50' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium">{project.name}</h3>
                                                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                                                    {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>

                                            {project.description && (
                                                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Deleted {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={busy || restoredIds.includes(project.id)}
                                                    onClick={() => handleRestore('project', project.id)}
                                                >
                                                    <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                                                    {restoredIds.includes(project.id) ? "Restoring..." : "Restore"}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    )
} 