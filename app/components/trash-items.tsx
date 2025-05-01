"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router"
import { useFetcher } from "react-router"
import { ArrowUpRight, RefreshCcw, Trash2, Calendar, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { toast } from 'sonner'
import { motion } from "framer-motion"
import type { Task, Project } from "../lib/types"

interface TrashItemsProps {
    deletedTasks: (Task & { projectName: string; projectDeleted: boolean })[]
    deletedProjects: Project[]
}

export function TrashItems({ deletedTasks, deletedProjects }: TrashItemsProps) {
    const [activeTab, setActiveTab] = useState("projects")
    const fetcher = useFetcher()
    const busy = fetcher.state !== "idle"
    const [restoredIds, setRestoredIds] = useState<string[]>([])

    useEffect(() => {
        // Check if we got a success response
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

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Trash</h1>
                    <p className="text-muted-foreground mt-1">
                        View and restore deleted projects and tasks
                    </p>
                </div>
                <div className="bg-muted/50 p-2 rounded-full">
                    <Trash2 className="h-6 w-6 text-muted-foreground" />
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
                    <TabsTrigger value="projects" className="text-sm sm:text-base">
                        Projects ({deletedProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="text-sm sm:text-base">
                        Tasks ({deletedTasks.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="space-y-6">
                    {deletedProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-lg border border-dashed">
                            <Trash2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <p className="text-muted-foreground text-center text-lg">No deleted projects found</p>
                            <p className="text-muted-foreground text-center text-sm mt-1">Projects you delete will appear here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {deletedProjects.map((project) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: restoredIds.includes(project.id) ? 0 : 1,
                                        y: restoredIds.includes(project.id) ? -20 : 0,
                                        scale: restoredIds.includes(project.id) ? 0.9 : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="overflow-hidden h-full border-muted/60 transition-all hover:shadow-md">
                                        <CardHeader className="pb-3 bg-muted/20">
                                            <CardTitle className="text-xl text-primary/90">{project.name}</CardTitle>
                                            <CardDescription className="text-sm flex items-center">
                                                <Clock className="h-3 w-3 mr-1 inline" />
                                                Deleted {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            {project.description && (
                                                <p className="line-clamp-2 text-sm mb-3 text-foreground/80">{project.description}</p>
                                            )}
                                            <div className="flex items-center">
                                                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                                                    {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between pt-2 border-t bg-muted/10">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                disabled={busy || restoredIds.includes(project.id)}
                                                onClick={() => handleRestore('project', project.id)}
                                                className="w-full transition-all"
                                            >
                                                <RefreshCcw className="h-3.5 w-3.5 mr-2" />
                                                {restoredIds.includes(project.id) ? "Restoring..." : "Restore Project"}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="tasks" className="space-y-6">
                    {deletedTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-lg border border-dashed">
                            <Trash2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <p className="text-muted-foreground text-center text-lg">No deleted tasks found</p>
                            <p className="text-muted-foreground text-center text-sm mt-1">Tasks you delete will appear here</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {deletedTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: restoredIds.includes(task.id) ? 0 : 1,
                                        y: restoredIds.includes(task.id) ? -20 : 0,
                                        scale: restoredIds.includes(task.id) ? 0.9 : 1,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="overflow-hidden h-full border-muted/60 transition-all hover:shadow-md">
                                        <CardHeader className="pb-3 bg-muted/20">
                                            <CardTitle className="text-lg text-primary/90">{task.title}</CardTitle>
                                            <CardDescription className="text-sm flex items-center">
                                                <Clock className="h-3 w-3 mr-1 inline" />
                                                Deleted {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            {task.description && (
                                                <p className="line-clamp-2 text-sm mb-3 text-foreground/80">{task.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-2 mb-3">
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
                                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                                </Badge>
                                            </div>

                                            {task.dueDate && (
                                                <div className="flex items-center mb-3 text-sm text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm">
                                                <span className="text-muted-foreground">Project: </span>
                                                {task.projectDeleted ? (
                                                    <span className="ml-1 text-destructive flex items-center">
                                                        {task.projectName}
                                                        <Badge variant="outline" className="ml-2 text-[10px] py-0 h-4 bg-destructive/10 text-destructive border-destructive/30">
                                                            deleted
                                                        </Badge>
                                                    </span>
                                                ) : (
                                                    <span className="ml-1 text-foreground">{task.projectName}</span>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-between pt-2 border-t bg-muted/10">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
                                                onClick={() => handleRestore('task', task.id)}
                                                className="w-full transition-all"
                                                title={task.projectDeleted ? "Project must be restored first" : ""}
                                            >
                                                <RefreshCcw className="h-3.5 w-3.5 mr-2" />
                                                {task.projectDeleted
                                                    ? "Restore Project First"
                                                    : restoredIds.includes(task.id)
                                                        ? "Restoring..."
                                                        : "Restore Task"
                                                }
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
} 