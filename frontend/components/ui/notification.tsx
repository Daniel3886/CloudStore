"use client"

//Debugging purposes
import type React from "react"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

type NotificationType = "success" | "error" | "warning" | "info"

interface Notification {
  id: string
  type: NotificationType
  title: string
  description?: string
  duration?: number
}

interface NotificationProps {
  notification: Notification
  onRemove: (id: string) => void
}

const NotificationComponent = ({ notification, onRemove }: NotificationProps) => {
  useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id)
      }, notification.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, onRemove])

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (notification.type) {
      case "success":
        return "border-l-green-500"
      case "error":
        return "border-l-red-500"
      case "warning":
        return "border-l-yellow-500"
      case "info":
        return "border-l-blue-500"
    }
  }

  return (
    <div
      className={`
        relative flex w-full max-w-sm items-start gap-3 rounded-lg border border-l-4 bg-background p-4 shadow-lg
        ${getBorderColor()}
      `}
    >
      {getIcon()}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{notification.title}</p>
        {notification.description && <p className="text-sm text-muted-foreground">{notification.description}</p>}
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onRemove(notification.id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

const notificationQueue: Notification[] = []
let setNotifications: (React.Dispatch<React.SetStateAction<Notification[]>>) | null = null

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotificationsState] = useState<Notification[]>([])

  useEffect(() => {
    setNotifications = setNotificationsState
    return () => {
      setNotifications = null
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotificationsState((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification) => (
          <NotificationComponent key={notification.id} notification={notification} onRemove={removeNotification} />
        ))}
      </div>
    </>
  )
}

export const showNotification = (notification: Omit<Notification, "id">) => {
  const id = Math.random().toString(36).substr(2, 9)
  const newNotification = { ...notification, id }

  if (setNotifications) {
    setNotifications((prev: Notification[]) => [...prev, newNotification])
  } else {
    alert(`${notification.title}${notification.description ? `\n${notification.description}` : ""}`)
  }
}

export const showSuccess = (title: string, description?: string) => {
  showNotification({ type: "success", title, description })
}

export const showError = (title: string, description?: string) => {
  showNotification({ type: "error", title, description })
}

export const showWarning = (title: string, description?: string) => {
  showNotification({ type: "warning", title, description })
}

export const showInfo = (title: string, description?: string) => {
  showNotification({ type: "info", title, description })
}
