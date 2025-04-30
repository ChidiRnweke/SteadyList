"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import type { Notification } from "../lib/types"
import { formatDistanceToNow } from "date-fns"


const getNotifications = async () => {
  return []
}

const markNotificationAsRead = async (id: string) => {
  console.log("Marking notification as read", id)
}

export function NotificationIndicator() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await getNotifications()
      setNotifications(data)
    }

    loadNotifications()

    // Check for new notifications every minute
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const unreadCount = notifications.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 border-b last:border-0 hover:bg-slate-50">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                    Dismiss
                  </Button>
                </div>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
