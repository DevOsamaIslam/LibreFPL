import React from "react"
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Checkbox,
} from "@mui/material"
import { Delete as DeleteIcon } from "@mui/icons-material"
import type { TodoItem } from "../types/gwTodos"

interface GWTodosListProps {
  todos: TodoItem[]
  onToggleTodo: (todoId: string) => void
  onDeleteTodo: (todoId: string) => void
}

const GWTodosList: React.FC<GWTodosListProps> = ({
  todos,
  onToggleTodo,
  onDeleteTodo,
}) => {
  if (todos.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No todos for this game week
        </Typography>
      </Box>
    )
  }

  return (
    <List>
      {todos.map((todo) => (
        <ListItem
          key={todo.id}
          secondaryAction={
            <IconButton edge="end" onClick={() => onDeleteTodo(todo.id)}>
              <DeleteIcon />
            </IconButton>
          }
          sx={{
            backgroundColor: todo.completed ? "action.hover" : "transparent",
            borderRadius: 1,
            mb: 0.5,
          }}>
          <Checkbox
            edge="start"
            checked={todo.completed}
            tabIndex={-1}
            disableRipple
            onChange={() => onToggleTodo(todo.id)}
          />
          <ListItemText
            primary={todo.text}
            sx={{
              textDecoration: todo.completed ? "line-through" : "none",
              color: todo.completed ? "text.secondary" : "text.primary",
            }}
          />
        </ListItem>
      ))}
    </List>
  )
}

export default GWTodosList
