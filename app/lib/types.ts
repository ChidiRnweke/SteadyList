// User Types
export interface User {
  id: string
  name: string
  email: string
  image?: string
}

export interface Session {
  user: User
  expires: string
}

// Project Types
export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  userId: string
  deleted: boolean
  taskCount?: number
  completedTaskCount?: number
  blockedTaskCount?: number
}

export interface CreateProjectInput {
  name: string
  description?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
}

// Task Types
export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "blocked" | "done"
  reminder?: boolean
  createdAt: string
  updatedAt: string
  projectId: string
  userId: string
  deleted: boolean
}

export interface CreateTaskInput {
  title: string
  description?: string
  dueDate?: Date
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "blocked" | "done"
  reminder?: boolean
  projectId: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  dueDate?: Date
  priority?: "low" | "medium" | "high"
  status?: "todo" | "in-progress" | "blocked" | "done"
  reminder?: boolean
  projectId?: string
}

// Note Types
export interface Note {
  id: string
  title: string
  content: string
  projectId?: string
  createdAt: string
  updatedAt: string
  userId: string
  deleted: boolean
}

export interface CreateNoteInput {
  title: string
  content: string
  projectId?: string
}

export interface UpdateNoteInput {
  title?: string
  content?: string
  projectId?: string
}

// Notification Types
export interface Notification {
  id: string
  title: string
  message: string
  createdAt: string
  userId: string
  read: boolean
  taskId?: string
  projectId?: string
}
