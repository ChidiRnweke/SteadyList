import { v4 as uuidv4 } from "uuid"
import type { Task, CreateTaskInput, UpdateTaskInput } from "./types"
import { createNotification } from "./notifications"

// Local storage key
const TASKS_KEY = "mock_tasks"

// Helper function to get tasks from localStorage
function getTasksFromStorage(): Task[] {
  if (typeof window === "undefined") {
    return []
  }

  const tasksData = localStorage.getItem(TASKS_KEY)

  if (!tasksData) {
    return []
  }

  try {
    return JSON.parse(tasksData)
  } catch (error) {
    console.error("Failed to parse tasks data:", error)
    return []
  }
}

// Helper function to save tasks to localStorage
function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

// Get all tasks
export async function getAllTasks(): Promise<Task[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return getTasksFromStorage()
}

// Get tasks by project ID
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const tasks = getTasksFromStorage()
  return tasks.filter((task) => task.projectId === projectId)
}

// Get task by ID
export async function getTaskById(id: string): Promise<Task | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const tasks = getTasksFromStorage()
  return tasks.find((task) => task.id === id) || null
}

// Create a new task
export async function createTask(data: CreateTaskInput): Promise<Task> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const tasks = getTasksFromStorage()

  const newTask: Task = {
    id: uuidv4(),
    title: data.title,
    description: data.description || "",
    dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
    priority: data.priority,
    status: data.status,
    reminder: data.reminder || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: data.projectId,
    userId: "user-1", // Mock user ID
    deleted: false,
  }

  saveTasksToStorage([...tasks, newTask])

  // Create a notification if the task has a due date and reminder is set
  if (newTask.dueDate && newTask.reminder) {
    const dueDate = new Date(newTask.dueDate)
    const now = new Date()

    // If due date is within the next 24 hours, create a notification
    if (dueDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
      await createNotification({
        title: "Task Due Soon",
        message: `Task "${newTask.title}" is due soon.`,
        taskId: newTask.id,
        projectId: newTask.projectId,
      })
    }
  }

  return newTask
}

// Update a task
export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const tasks = getTasksFromStorage()
  const taskIndex = tasks.findIndex((t) => t.id === id)

  if (taskIndex === -1) {
    return null
  }

  const updatedTask = {
    ...tasks[taskIndex],
    ...data,
    dueDate: data.dueDate ? data.dueDate.toISOString() : tasks[taskIndex].dueDate,
    updatedAt: new Date().toISOString(),
  }

  tasks[taskIndex] = updatedTask
  saveTasksToStorage(tasks)

  // Create a notification if the task has a due date and reminder is set
  if (updatedTask.dueDate && updatedTask.reminder) {
    const dueDate = new Date(updatedTask.dueDate)
    const now = new Date()

    // If due date is within the next 24 hours, create a notification
    if (dueDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
      await createNotification({
        title: "Task Due Soon",
        message: `Task "${updatedTask.title}" is due soon.`,
        taskId: updatedTask.id,
        projectId: updatedTask.projectId,
      })
    }
  }

  return updatedTask
}

// Update task status
export async function updateTaskStatus(id: string, status: string): Promise<Task | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const tasks = getTasksFromStorage()
  const taskIndex = tasks.findIndex((t) => t.id === id)

  if (taskIndex === -1) {
    return null
  }

  const updatedTask = {
    ...tasks[taskIndex],
    status,
    updatedAt: new Date().toISOString(),
  }

  tasks[taskIndex] = updatedTask
  saveTasksToStorage(tasks)

  return updatedTask
}

// Soft delete a task
export async function softDeleteTask(id: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const tasks = getTasksFromStorage()
  const taskIndex = tasks.findIndex((t) => t.id === id)

  if (taskIndex === -1) {
    return false
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    deleted: true,
    updatedAt: new Date().toISOString(),
  }

  saveTasksToStorage(tasks)

  return true
}
