import { Close as CloseIcon } from "@mui/icons-material"
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { useLocalStorage } from "../hooks/useLocalStorage"
import type { GWTodos } from "../types/gwTodos"

interface TodoFormProps {
  onSubmit: (gw: number, todos: string[]) => void
  onCancel: () => void
  availableGWs: number[]
}

const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  onCancel,
  availableGWs,
}) => {
  const [selectedGW, setSelectedGW] = useState<number>(availableGWs[0] || 1)
  const [newTodo, setNewTodo] = useState("")
  const [todos, setTodos] = useState<string[]>([])
  const [gwTodos, setGwTodos] = useLocalStorage<GWTodos>("gwTodos", {})

  // Load existing todos for the selected GW when it changes
  useEffect(() => {
    const existingTodos = gwTodos[selectedGW] || []
    const existingTodoTexts = existingTodos.map((todo) => todo.text)
    setTodos(existingTodoTexts)
  }, [selectedGW, gwTodos])

  // Load existing todos for the selected GW when it changes
  useEffect(() => {
    const existingTodos = gwTodos[selectedGW] || []
    const existingTodoTexts = existingTodos.map((todo) => todo.text)
    setTodos(existingTodoTexts)
  }, [selectedGW, gwTodos])

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, newTodo.trim()])
      setNewTodo("")
    }
  }

  const handleRemoveTodo = (index: number) => {
    const newTodos = [...todos]
    newTodos.splice(index, 1)
    setTodos(newTodos)
  }

  const handleSubmit = () => {
    if (todos.length > 0) {
      onSubmit(selectedGW, todos)
      // Update local storage
      const updatedTodos = { ...gwTodos }
      updatedTodos[selectedGW] = todos.map((todo) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: todo,
        completed: false,
      }))
      setGwTodos(updatedTodos)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTodo()
    }
  }

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="gw-select-label">Game Week</InputLabel>
        <Select
          labelId="gw-select-label"
          value={selectedGW}
          label="Game Week"
          onChange={(e) => setSelectedGW(Number(e.target.value))}>
          {availableGWs.map((gw) => (
            <MenuItem key={gw} value={gw}>
              GW {gw}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Add a todo"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{ mb: 2 }}
      />

      <Button
        variant="outlined"
        onClick={handleAddTodo}
        disabled={!newTodo.trim()}
        sx={{ mb: 2 }}
        fullWidth>
        Add Todo
      </Button>

      {todos.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Todos to add:
          </Typography>
          <List>
            {todos.map((todo, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveTodo(index)}>
                    <CloseIcon />
                  </IconButton>
                }>
                <Checkbox
                  edge="start"
                  checked={false}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={todo} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={todos.length === 0}
          fullWidth>
          Save Todos
        </Button>
        <Button variant="outlined" onClick={onCancel} fullWidth>
          Cancel
        </Button>
      </Box>
    </Box>
  )
}

export default TodoForm
