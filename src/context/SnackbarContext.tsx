import React, { createContext, useContext, useState, useCallback } from "react"

export interface SnackbarMessage {
  id: number
  message: string
  type: "success" | "error" | "info" | "warning"
  duration?: number
}

interface SnackbarContextType {
  messages: SnackbarMessage[]
  showSnackbar: (message: Omit<SnackbarMessage, "id">) => void
  hideSnackbar: (id: number) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
)

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider")
  }
  return context
}

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<SnackbarMessage[]>([])

  const showSnackbar = useCallback((message: Omit<SnackbarMessage, "id">) => {
    const id = Date.now()
    const newMessage: SnackbarMessage = {
      id,
      ...message,
      duration: message.duration || 3000,
    }

    setMessages((prev) => [...prev, newMessage])

    // Auto-remove after duration
    setTimeout(() => {
      hideSnackbar(id)
    }, newMessage.duration)
  }, [])

  const hideSnackbar = useCallback((id: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }, [])

  return (
    <SnackbarContext.Provider value={{ messages, showSnackbar, hideSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  )
}
