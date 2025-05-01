"use client"

import { useState, useEffect } from "react"
import { Trash2, RefreshCcw, ExternalLink, ChevronLeft } from "lucide-react"
import { Link } from "react-router"
import { useFetcher } from "react-router"
import { formatDistanceToNow } from "date-fns"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
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
    const [isHovering, setIsHovering] = useState(false)
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
                    <div
                        className="relative inline-flex"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative transition-all duration-300 hover:bg-secondary/5"
                        >
                            <motion.div
                                animate={{
                                    rotate: isHovering ? [0, -10, 0, 10, 0] : 0,
                                    scale: isHovering ? 1.1 : 1
                                }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeInOut"
                                }}
                            >
                                <Trash2
                                    className={`h-4 w-4 ${isHovering ? 'text-secondary' : ''}`}
                                />
                            </motion.div>

                            <AnimatePresence>
                                {totalItems > 0 && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                        className="absolute -top-1 -right-1"
                                    >
                                        <Badge
                                            variant="outline"
                                            className="h-4 min-w-4 px-1 py-0 flex items-center justify-center rounded-full text-[9px] font-medium
                                                    bg-secondary text-white border-secondary shadow-sm"
                                        >
                                            {totalItems < 100 ? totalItems : '99+'}
                                        </Badge>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between py-3">
                        <span className="font-semibold text-base flex items-center gap-2">
                            <Trash2 className="h-3.5 w-3.5 text-secondary" />
                            Trash
                        </span>
                        <Badge
                            variant="outline"
                            className="font-normal text-xs bg-secondary/10 text-secondary border-secondary/30"
                        >
                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </Badge>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {recentTasks.length > 0 && (
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                Recent Tasks
                            </DropdownMenuLabel>

                            <AnimatePresence>
                                {recentTasks.map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <DropdownMenuItem
                                            disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
                                            className="py-2 focus:bg-secondary/5"
                                        >
                                            <div className="flex flex-col w-full gap-1">
                                                <div className="flex justify-between items-start w-full">
                                                    <span className="font-medium text-sm truncate max-w-[180px]">{task.title}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`
                                                          ${task.status === 'todo' ? 'bg-secondary/10 text-secondary border-secondary/30' : ''}
                                                          ${task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : ''}
                                                          ${task.status === 'blocked' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                                                          ${task.status === 'done' ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}
                                                          text-[9px] py-0 h-4
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
                                                        className="h-6 text-xs p-0 px-2 hover:bg-secondary/10 hover:text-secondary"
                                                        disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            handleRestore('task', task.id)
                                                        }}
                                                    >
                                                        <RefreshCcw className="h-2.5 w-2.5 mr-1" />
                                                        Restore
                                                    </Button>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                        {index < recentTasks.length - 1 && (
                                            <div className="mx-2 my-0.5 h-[1px] bg-border/40" />
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </DropdownMenuGroup>
                    )}

                    {recentProjects.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                    Recent Projects
                                </DropdownMenuLabel>

                                <AnimatePresence>
                                    {recentProjects.map((project, index) => (
                                        <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <DropdownMenuItem
                                                disabled={busy || restoredIds.includes(project.id)}
                                                className="py-2 focus:bg-secondary/5"
                                            >
                                                <div className="flex flex-col w-full gap-1">
                                                    <div className="flex justify-between items-start w-full">
                                                        <span className="font-medium text-sm">{project.name}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[9px] py-0 h-4 bg-secondary/10 text-secondary border-secondary/30"
                                                        >
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
                                                            className="h-6 text-xs p-0 px-2 hover:bg-secondary/10 hover:text-secondary"
                                                            disabled={busy || restoredIds.includes(project.id)}
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                handleRestore('project', project.id)
                                                            }}
                                                        >
                                                            <RefreshCcw className="h-2.5 w-2.5 mr-1" />
                                                            Restore
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                            {index < recentProjects.length - 1 && (
                                                <div className="mx-2 my-0.5 h-[1px] bg-border/40" />
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </DropdownMenuGroup>
                        </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="justify-center text-xs hover:bg-secondary/10 hover:text-secondary"
                        onSelect={() => setIsDialogOpen(true)}
                    >
                        <ExternalLink className="h-3 w-3 mr-1.5" />
                        View all trash items ({totalItems})
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-4 top-4 p-0 w-7 h-7 hover:bg-secondary/10 hover:text-secondary"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <DialogTitle className="text-center pt-2 flex items-center justify-center gap-2 text-base">
                            <Trash2 className="h-4 w-4 text-secondary" />
                            Trash ({totalItems})
                        </DialogTitle>
                        <DialogDescription className="text-center text-xs">
                            Deleted items will be permanently removed after 30 days
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="tasks" className="text-xs data-[state=active]:bg-secondary data-[state=active]:text-white">
                                Tasks ({deletedTasks.length})
                            </TabsTrigger>
                            <TabsTrigger value="projects" className="text-xs data-[state=active]:bg-secondary data-[state=active]:text-white">
                                Projects ({deletedProjects.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tasks" className="mt-4">
                            {deletedTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed">
                                    <Trash2 className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                                    <p className="text-muted-foreground text-sm">No deleted tasks</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {deletedTasks.map((task, index) => (
                                            <motion.div
                                                key={task.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{
                                                    opacity: restoredIds.includes(task.id) ? 0.5 : 1,
                                                    y: 0,
                                                    height: restoredIds.includes(task.id) ? 0 : 'auto'
                                                }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.05,
                                                    height: { delay: restoredIds.includes(task.id) ? 0.3 : 0 }
                                                }}
                                            >
                                                <div className={`border rounded-lg p-3 transition-all duration-300 ${restoredIds.includes(task.id) ? 'border-secondary/20' : 'hover:border-secondary/50'}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-medium text-sm">{task.title}</h3>
                                                        <div className="flex gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`
                                                                  ${task.status === 'todo' ? 'bg-secondary/10 text-secondary border-secondary/30' : ''}
                                                                  ${task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : ''}
                                                                  ${task.status === 'blocked' ? 'bg-destructive/10 text-destructive border-destructive/30' : ''}
                                                                  ${task.status === 'done' ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}
                                                                  text-[9px]
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
                                                                  text-[9px]
                                                                `}
                                                            >
                                                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {task.description && (
                                                        <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <span className="text-xs text-muted-foreground">Project: </span>
                                                            {task.projectDeleted ? (
                                                                <span className="ml-1 text-xs text-destructive flex items-center">
                                                                    {task.projectName}
                                                                    <Badge variant="outline" className="ml-2 text-[8px] py-0 h-3.5 bg-destructive/10 text-destructive border-destructive/30">
                                                                        deleted
                                                                    </Badge>
                                                                </span>
                                                            ) : (
                                                                <span className="ml-1 text-xs">{task.projectName}</span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={`
                                                                text-xs h-7
                                                                transition-all duration-300
                                                                ${!task.projectDeleted && !restoredIds.includes(task.id)
                                                                    ? 'hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30'
                                                                    : ''}
                                                            `}
                                                            disabled={busy || restoredIds.includes(task.id) || task.projectDeleted}
                                                            onClick={() => handleRestore('task', task.id)}
                                                        >
                                                            <motion.div
                                                                animate={{ rotate: restoredIds.includes(task.id) ? 360 : 0 }}
                                                                transition={{ duration: 0.5 }}
                                                                className="mr-1.5"
                                                            >
                                                                <RefreshCcw className="h-3 w-3" />
                                                            </motion.div>
                                                            {restoredIds.includes(task.id) ? "Restoring..." : "Restore"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="projects" className="mt-4">
                            {deletedProjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed">
                                    <Trash2 className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                                    <p className="text-muted-foreground text-sm">No deleted projects</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {deletedProjects.map((project, index) => (
                                            <motion.div
                                                key={project.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{
                                                    opacity: restoredIds.includes(project.id) ? 0.5 : 1,
                                                    y: 0,
                                                    height: restoredIds.includes(project.id) ? 0 : 'auto'
                                                }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.05,
                                                    height: { delay: restoredIds.includes(project.id) ? 0.3 : 0 }
                                                }}
                                            >
                                                <div className={`border rounded-lg p-3 transition-all duration-300 ${restoredIds.includes(project.id) ? 'border-secondary/20' : 'hover:border-secondary/50'}`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-medium text-sm">{project.name}</h3>
                                                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30 text-[9px]">
                                                            {project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
                                                        </Badge>
                                                    </div>

                                                    {project.description && (
                                                        <p className="text-xs text-muted-foreground mb-3">{project.description}</p>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">
                                                            Deleted {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className={`
                                                                text-xs h-7
                                                                transition-all duration-300
                                                                ${!restoredIds.includes(project.id)
                                                                    ? 'hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30'
                                                                    : ''}
                                                            `}
                                                            disabled={busy || restoredIds.includes(project.id)}
                                                            onClick={() => handleRestore('project', project.id)}
                                                        >
                                                            <motion.div
                                                                animate={{ rotate: restoredIds.includes(project.id) ? 360 : 0 }}
                                                                transition={{ duration: 0.5 }}
                                                                className="mr-1.5"
                                                            >
                                                                <RefreshCcw className="h-3 w-3" />
                                                            </motion.div>
                                                            {restoredIds.includes(project.id) ? "Restoring..." : "Restore"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    )
} 