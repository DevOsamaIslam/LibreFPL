import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import type { GWTodoStats } from "../types/gwTodos"
import GWTodosList from "./GWTodosList"
import TodoForm from "./TodoForm"

interface GWTodosDrawerProps {
  isOpen: boolean
  onClose: () => void
  todoStats: GWTodoStats[]
  onAddTodo: (gw: number, todos: string[]) => void
  onToggleTodo: (gw: number, todoId: string) => void
  onDeleteTodo: (gw: number, todoId: string) => void
  getTodosForGW: (gw: number) => any[]
}

const GWTodosDrawer: React.FC<GWTodosDrawerProps> = ({
  isOpen,
  onClose,
  todoStats,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  getTodosForGW,
}) => {
  const [showForm, setShowForm] = useState(false)

  const handleAddTodoClick = () => {
    setShowForm(true)
  }

  const handleFormSubmit = (gw: number, todos: string[]) => {
    onAddTodo(gw, todos)
    setShowForm(false)
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: 450,
          p: 2,
        },
      }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={onClose} sx={{ mr: 1 }}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Game Week Todos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTodoClick}
            size="small">
            Add Todo
          </Button>
        </Box>

        <Divider />

        {showForm ? (
          <TodoForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            availableGWs={todoStats.map((stat) => stat.gw)}
          />
        ) : (
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            {todoStats.map((stat) => {
              const todos = getTodosForGW(stat.gw)
              return (
                <Accordion key={stat.gw} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                      GW {stat.gw} - {stat.completed} / {stat.total} completed
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <GWTodosList
                      todos={todos}
                      onToggleTodo={(todoId) => onToggleTodo(stat.gw, todoId)}
                      onDeleteTodo={(todoId) => onDeleteTodo(stat.gw, todoId)}
                    />
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default GWTodosDrawer
