import { v4 as uuidv4 } from "uuid"
import type { Notification } from "./types"

// Local storage key
const NOTIFICATIONS_KEY = "mock_notifications"

// Helper function to get notifications from localStorage
function getNotificationsFromStorage(): Notification[] {
  if (typeof window === "undefined") {
    return []
  }

  const notificationsData = localStorage.getItem(NOTIFICATIONS_KEY)

  if (!notificationsData) {
    return []
  }

  try {
    return JSON.parse(notificationsData)
  } catch (error) {
    console.error("Failed to parse notifications data:", error)
    return []
  }
}

// Helper function to save notifications to localStorage
function saveNotificationsToStorage(notifications: Notification[]): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

// Get all notifications
export async function getNotifications(): Promise<Notification[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const notifications = getNotificationsFromStorage()
  return notifications.filter((notification) => !notification.read)
}

// Create a new notification
export async function createNotification(data: {
  title: string
  message: string
  taskId?: string
  projectId?: string
}): Promise<Notification> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const notifications = getNotificationsFromStorage()

  const newNotification: Notification = {
    id: uuidv4(),
    title: data.title,
    message: data.message,
    createdAt: new Date().toISOString(),
    userId: "user-1", // Mock user ID
    read: false,
    taskId: data.taskId,
    projectId: data.projectId,
  }

  saveNotificationsToStorage([...notifications, newNotification])

  return newNotification
}

// Mark a notification as read
export async function markNotificationAsRead(id: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const notifications = getNotificationsFromStorage()
  const notificationIndex = notifications.findIndex((n) => n.id === id)

  if (notificationIndex === -1) {
    return false
  }

  notifications[notificationIndex] = {
    ...notifications[notificationIndex],
    read: true,
  }

  saveNotificationsToStorage(notifications)

  return true
}
