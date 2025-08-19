export interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export interface GWTodos {
  [gw: number]: TodoItem[]
}

export interface TodoFormData {
  gw: number
  todos: string[]
}

export interface GWTodoStats {
  gw: number
  total: number
  completed: number
}
