import { useMemo } from "react"
import { useLocalStorage } from "./useLocalStorage"
import type { GWTodos, GWTodoStats, TodoItem } from "../types/gwTodos"
import fixtures from "../data/fixtures.json"

export const useGWTodos = () => {
  const [gwTodos, setGwTodos] = useLocalStorage<GWTodos>("gwTodos", {})

  // Get all upcoming game weeks (that haven't started)
  const upcomingGWs = useMemo(() => {
    const now = new Date()
    const gwEvents = new Set<number>()

    fixtures.forEach((fixture) => {
      const kickoffTime = new Date(fixture.kickoff_time)
      if (kickoffTime > now && !fixture.started) {
        gwEvents.add(fixture.event)
      }
    })

    return Array.from(gwEvents).sort((a, b) => a - b)
  }, [])

  // Calculate todo statistics for each game week
  const todoStats: GWTodoStats[] = useMemo(() => {
    return upcomingGWs.map((gw) => {
      const todos = gwTodos[gw] || []
      const completed = todos.filter((todo) => todo.completed).length
      const total = todos.length

      return {
        gw,
        total,
        completed,
      }
    })
  }, [gwTodos, upcomingGWs])

  // Add todos for a specific game week
  const addTodos = (gw: number, todos: string[]) => {
    const updatedTodos = { ...gwTodos }
    updatedTodos[gw] = todos.map((todo) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: todo,
      completed: false,
    }))
    setGwTodos(updatedTodos)
  }

  // Toggle todo completion
  const toggleTodo = (gw: number, todoId: string) => {
    const updatedTodos = { ...gwTodos }
    const todos = updatedTodos[gw] || []
    const todoIndex = todos.findIndex((todo) => todo.id === todoId)

    if (todoIndex !== -1) {
      todos[todoIndex] = {
        ...todos[todoIndex],
        completed: !todos[todoIndex].completed,
      }
      updatedTodos[gw] = todos
      setGwTodos(updatedTodos)
    }
  }

  // Delete a todo
  const deleteTodo = (gw: number, todoId: string) => {
    const updatedTodos = { ...gwTodos }
    const todos = updatedTodos[gw] || []
    const filteredTodos = todos.filter((todo) => todo.id !== todoId)

    if (filteredTodos.length > 0) {
      updatedTodos[gw] = filteredTodos
    } else {
      delete updatedTodos[gw]
    }

    setGwTodos(updatedTodos)
  }

  // Get todos for a specific game week
  const getTodosForGW = (gw: number): TodoItem[] => {
    return gwTodos[gw] || []
  }

  return {
    gwTodos,
    todoStats,
    upcomingGWs,
    addTodos,
    toggleTodo,
    deleteTodo,
    getTodosForGW,
  }
}
