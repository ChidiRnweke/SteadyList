"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { TaskCard } from "./task-card"
import type { Task } from "../lib/types"
import { useNavigation, useFetcher } from "react-router"
import { toast } from "sonner"
import { Search, Filter, Plus, ArrowUpDown, X } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Link } from "react-router"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem
} from "./ui/dropdown-menu"

interface KanbanBoardProps {
  tasks: Task[]
  projectId: string
}

type Column = {
  id: string
  title: string
  tasks: Task[]
  color: string
}

// Define a type for our pending updates
type PendingUpdate = {
  taskId: string;
  newStatus: string;
  prevStatus: string;
}

// Define filter options
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
type SortOption = 'newest' | 'oldest' | 'priority' | 'alphabetical';

export function KanbanBoard({ tasks: initialTasks, projectId }: KanbanBoardProps) {
  const fetcher = useFetcher();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [toastId, setToastId] = useState<string | number | null>(null);

  // Store local tasks that include our optimistic updates
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Use a ref to track pending updates to avoid race conditions
  const pendingUpdates = useRef<PendingUpdate[]>([]);

  // Initialize local tasks on first render and when props change significantly
  useEffect(() => {
    if (localTasks.length === 0 || initialTasks.length !== localTasks.length) {
      // Apply any pending updates to the new initial tasks
      const tasksWithPendingUpdates = [...initialTasks];

      pendingUpdates.current.forEach(update => {
        const taskIndex = tasksWithPendingUpdates.findIndex(t => t.id === update.taskId);
        if (taskIndex >= 0) {
          tasksWithPendingUpdates[taskIndex] = {
            ...tasksWithPendingUpdates[taskIndex],
            status: update.newStatus as any
          };
        }
      });

      setLocalTasks(tasksWithPendingUpdates);
    }
  }, [initialTasks, localTasks.length]);

  // Handle incoming task data without losing optimistic updates
  useEffect(() => {
    // Skip initial render
    if (localTasks.length === 0) return;

    // Create maps for faster lookups
    const initialTasksMap = new Map(initialTasks.map(task => [task.id, task]));
    const localTasksMap = new Map(localTasks.map(task => [task.id, task]));

    // Update local tasks while preserving optimistic updates
    const updatedTasks = localTasks.map(localTask => {
      const initialTask = initialTasksMap.get(localTask.id);

      // If task is not in the new data, keep it (might be a new task we added)
      if (!initialTask) return localTask;

      // If this task has a pending update, preserve the status
      const pendingUpdate = pendingUpdates.current.find(u => u.taskId === localTask.id);
      if (pendingUpdate) {
        return {
          ...initialTask,
          status: pendingUpdate.newStatus as any
        };
      }

      // Otherwise use the server data
      return initialTask;
    });

    // Add any new tasks from initialTasks that aren't in localTasks
    initialTasks.forEach(initialTask => {
      if (!localTasksMap.has(initialTask.id)) {
        updatedTasks.push(initialTask);
      }
    });

    setLocalTasks(updatedTasks);
  }, [initialTasks]);

  // Define the base column structure
  const columnDefinitions = [
    { id: "todo", title: "To Do", color: "border-secondary bg-secondary/5" },
    { id: "in-progress", title: "In Progress", color: "border-amber-500 bg-amber-500/5" },
    { id: "blocked", title: "Blocked", color: "border-destructive bg-destructive/5" },
    { id: "done", title: "Done", color: "border-green-500 bg-green-500/5" },
  ];

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    // First filter out deleted tasks
    let result = localTasks.filter(task => !task.deleted);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    // Apply sorting
    return result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [localTasks, searchQuery, priorityFilter, sortOption]);

  // Populate columns with filtered tasks
  const populatedColumns = useMemo(() => {
    return columnDefinitions.map(column => ({
      ...column,
      tasks: filteredAndSortedTasks.filter(task => task.status === column.id)
    }));
  }, [filteredAndSortedTasks]);

  // Calculate total tasks after filtering
  const totalFilteredTasks = useMemo(() => {
    return filteredAndSortedTasks.length;
  }, [filteredAndSortedTasks]);

  // Effect to handle server responses
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && updatingTaskId) {
      if (toastId) {
        toast.dismiss(toastId);
      }

      // Find the pending update for this task
      const pendingUpdateIndex = pendingUpdates.current.findIndex(u => u.taskId === updatingTaskId);

      if (fetcher.data.success) {
        toast.success(fetcher.data.message || "Task status updated");

        // Success - remove the pending update
        if (pendingUpdateIndex >= 0) {
          pendingUpdates.current.splice(pendingUpdateIndex, 1);
        }
      } else {
        toast.error(fetcher.data.message || "Failed to update task status");

        // Failure - revert the task status
        if (pendingUpdateIndex >= 0) {
          const revertTo = pendingUpdates.current[pendingUpdateIndex].prevStatus;

          // Update the local task state to revert the status
          setLocalTasks(prev =>
            prev.map(task =>
              task.id === updatingTaskId
                ? { ...task, status: revertTo as any }
                : task
            )
          );

          // Remove the pending update
          pendingUpdates.current.splice(pendingUpdateIndex, 1);
        }
      }

      setUpdatingTaskId(null);
      setToastId(null);
    }
  }, [fetcher.state, fetcher.data, updatingTaskId, toastId]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list or same position
    if (!destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)) {
      return;
    }

    // Find the task being moved
    const taskBeingMoved = localTasks.find(task => task.id === draggableId);
    if (!taskBeingMoved) return;

    const newStatus = destination.droppableId as Task['status'];
    const prevStatus = taskBeingMoved.status;

    // Skip if status didn't change (shouldn't happen, but just in case)
    if (newStatus === prevStatus) return;

    // Apply optimistic update
    setLocalTasks(prev =>
      prev.map(task =>
        task.id === draggableId ? { ...task, status: newStatus } : task
      )
    );

    // Add to pending updates
    pendingUpdates.current.push({
      taskId: draggableId,
      newStatus,
      prevStatus
    });

    // Update on server
    updateTaskStatus(draggableId, newStatus);
  };

  // Function to update task status on the server
  const updateTaskStatus = (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);

    // Show toast
    const id = toast.loading(`Updating task status to ${newStatus.replace('-', ' ')}...`);
    setToastId(id);

    // Send to server
    fetcher.submit(
      {
        taskId,
        status: newStatus,
        _action: "updateTaskStatus"
      },
      {
        method: "POST",
        action: `/projects/${projectId}/tasks/${taskId}`
      }
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setSortOption('newest');
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // If we have no tasks yet, show a loading state or empty state
  if (localTasks.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columnDefinitions.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            <Card className={`h-full flex flex-col border-t-4 ${column.color}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">{column.title}</CardTitle>
                  <Badge variant="outline">0</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden pt-0">
                <div className="min-h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  {initialTasks.length === 0 ? "No tasks yet" : "Loading..."}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  // Main render with the kanban board
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pb-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0.5 top-0.5 h-7 w-7 rounded-full p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Priority</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={priorityFilter === 'all'}
                onCheckedChange={() => setPriorityFilter('all')}
              >
                All Priorities
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={priorityFilter === 'high'}
                onCheckedChange={() => setPriorityFilter('high')}
              >
                High
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={priorityFilter === 'medium'}
                onCheckedChange={() => setPriorityFilter('medium')}
              >
                Medium
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={priorityFilter === 'low'}
                onCheckedChange={() => setPriorityFilter('low')}
              >
                Low
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={sortOption === 'newest'}
                onCheckedChange={() => setSortOption('newest')}
              >
                Newest First
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOption === 'oldest'}
                onCheckedChange={() => setSortOption('oldest')}
              >
                Oldest First
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOption === 'priority'}
                onCheckedChange={() => setSortOption('priority')}
              >
                Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOption === 'alphabetical'}
                onCheckedChange={() => setSortOption('alphabetical')}
              >
                Alphabetical
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {(searchQuery || priorityFilter !== 'all' || sortOption !== 'newest') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear
            </Button>
          )}

          <Link to={`/projects/${projectId}/tasks/new`}>
            <Button size="sm" className="flex items-center gap-1 ml-2">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtered results info */}
      {(searchQuery || priorityFilter !== 'all') && (
        <div className="text-sm text-muted-foreground mb-2">
          Showing {totalFilteredTasks} of {localTasks.filter(t => !t.deleted).length} tasks
          {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          {priorityFilter !== 'all' && (
            <span> with <Badge variant="outline" className="ml-1 font-normal text-xs">
              {priorityFilter} priority
            </Badge></span>
          )}
        </div>
      )}

      {/* Kanban board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {populatedColumns.map((column) => (
            <div key={column.id} className="flex flex-col h-full">
              <Card className={`h-full flex flex-col border-t-4 ${column.color}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">{column.title}</CardTitle>
                    <Badge variant="outline">{column.tasks.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden pt-0">
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3 min-h-[200px] overflow-y-auto max-h-[calc(100vh-300px)] p-1"
                      >
                        {column.tasks.length > 0 ? (
                          column.tasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                              isDragDisabled={updatingTaskId === task.id}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`
                                    transition-all duration-200
                                    ${updatingTaskId === task.id ? "opacity-60" : ""}
                                    ${snapshot.isDragging ? "shadow-lg scale-105 z-10" : ""}
                                  `}
                                  data-task-id={task.id}
                                  data-status={task.status}
                                >
                                  <TaskCard task={task} projectId={projectId} />
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground text-sm border border-dashed rounded-md">
                            {searchQuery || priorityFilter !== 'all' ? (
                              <p>No matching tasks</p>
                            ) : (
                              <>
                                <p className="mb-2">No tasks in this column</p>
                                <Link to={`/projects/${projectId}/tasks/new?status=${column.id}`}>
                                  <Button variant="ghost" size="sm" className="text-xs">
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Add task
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
