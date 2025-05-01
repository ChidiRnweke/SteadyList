"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { TaskCard } from "./task-card"
import type { Task } from "../lib/types"
import { useNavigation, useFetcher } from "react-router"
import { toast } from "sonner"

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

export function KanbanBoard({ tasks: initialTasks, projectId }: KanbanBoardProps) {
  const fetcher = useFetcher();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [toastId, setToastId] = useState<string | number | null>(null);

  // Store local tasks that include our optimistic updates
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

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

  // Memoize our populated columns for performance
  const populatedColumns = useMemo(() => {
    // Only show non-deleted tasks
    const activeTasks = localTasks.filter(task => !task.deleted);

    // Group tasks by status
    return columnDefinitions.map(column => ({
      ...column,
      tasks: activeTasks.filter(task => task.status === column.id)
    }));
  }, [localTasks]);

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
                      {column.tasks.map((task, index) => (
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
                      ))}
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
  );
}
