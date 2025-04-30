"use client"

import { useEffect, useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { TaskCard } from "./task-card"
import type { Task } from "../lib/types"

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


export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", tasks: [], color: "border-secondary bg-secondary/5" },
    { id: "in-progress", title: "In Progress", tasks: [], color: "border-amber-500 bg-amber-500/5" },
    { id: "blocked", title: "Blocked", tasks: [], color: "border-destructive bg-destructive/5" },
    { id: "done", title: "Done", tasks: [], color: "border-green-500 bg-green-500/5" },
  ])

  useEffect(() => {
    const loadTasks = () => {
      const activeTasks = tasks.filter((task) => !task.deleted)

      setColumns(
        columns.map((column) => ({
          ...column,
          tasks: activeTasks.filter((task) => task.status === column.id),
        })),
      )

    }

    loadTasks()
  }, [tasks])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    // Dropped outside the list
    if (!destination) return

    // Dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    // Find source and destination columns
    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    // Moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newTasks = Array.from(sourceColumn.tasks)
      const [movedTask] = newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, movedTask)

      const newColumns = columns.map((col) => (col.id === sourceColumn.id ? { ...col, tasks: newTasks } : col))

      setColumns(newColumns)
    }
    // Moving to another column
    else {
      const sourceTasks = Array.from(sourceColumn.tasks)
      const [movedTask] = sourceTasks.splice(source.index, 1)

      const destTasks = Array.from(destColumn.tasks)
      destTasks.splice(destination.index, 0, { ...movedTask, status: destination.droppableId as 'todo' | 'in-progress' | 'blocked' | 'done' })

      const newColumns = columns.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: sourceTasks }
        }
        if (col.id === destination.droppableId) {
          return { ...col, tasks: destTasks }
        }
        return col
      })

      setColumns(newColumns)

      // Update task status in the database
      console.log(newColumns)
    }
  }


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
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
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
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
  )
}
