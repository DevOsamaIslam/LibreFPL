import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material"
import { memo, useCallback, useState } from "react"
import BaseDialog from "../components/BaseDialog"
import SpaceBetween from "../components/SpaceBetween"
import type { ISavedSquad } from "../lib/types"
import { useLocalStorage } from "./useLocalStorage"
import { DeleteForeverOutlined } from "@mui/icons-material"
import { useSnackbarUtils } from "../lib/snackbar"

export const useSavedSquads = () => {
  const [activeSquad, setActiveSquad] = useState<ISavedSquad>()
  const [openDialog, setOpenDialog] = useState(false)
  const { success, error } = useSnackbarUtils()

  const [savedSquads, setSavedSquads] = useLocalStorage<ISavedSquad[]>(
    "saved-squads",
    [],
    500
  )

  const addSquad = useCallback(
    (squad: ISavedSquad) => {
      setSavedSquads((prev) => [...prev, squad])
      success(`Squad "${squad.title}" saved successfully!`)
    },
    [setSavedSquads, success]
  )
  const updateSquad = useCallback(
    (squad: ISavedSquad) => {
      setSavedSquads((prev) =>
        prev.map((x) => (x.title === squad.title ? squad : x))
      )
      success(`Squad "${squad.title}" updated successfully!`)
    },
    [setSavedSquads, success]
  )
  const deleteSquad = useCallback(
    (squad: ISavedSquad) => {
      setSavedSquads((prev) => prev.filter((x) => x.title !== squad.title))
      error(`Squad "${squad.title}" deleted successfully!`)
    },
    [setSavedSquads, error]
  )

  // a memoized MUI component for writing the title, description, and submit button
  const Selector = memo(() => {
    const [formData, setFormData] = useState<
      Pick<ISavedSquad, "title" | "description">
    >({
      title: "",
      description: "",
    })

    return (
      <Card>
        <CardContent>
          <SpaceBetween spacing={1}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel id="select-saved-team">Select saved team</InputLabel>
              <Select
                labelId="select-saved-team"
                value={activeSquad?.title}
                label="Age">
                {savedSquads.map((squad) => (
                  <MenuItem
                    key={squad.title}
                    value={squad.title}
                    onClick={() => setActiveSquad(squad)}>
                    <SpaceBetween>
                      {squad.title}
                      <DeleteForeverOutlined
                        color="error"
                        onClick={() => deleteSquad(squad)}
                      />
                    </SpaceBetween>
                  </MenuItem>
                ))}

                {!savedSquads.length && (
                  <MenuItem value={undefined}>None</MenuItem>
                )}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => setOpenDialog(true)}>
              Save current squad
            </Button>
          </SpaceBetween>
        </CardContent>

        <BaseDialog
          title="Save current squad"
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSubmit={() => {
            addSquad({
              ...formData,
              playerIds: activeSquad?.playerIds || [],
              updatedAt: new Date(),
            })
            setOpenDialog(false)
          }}>
          <Stack spacing={2}>
            <FormControl>
              <TextField
                label="Title"
                value={formData?.title}
                onChange={(e) =>
                  setFormData((prev) => {
                    return { ...prev, title: e.target.value }
                  })
                }
              />
            </FormControl>
            <FormControl>
              <TextField
                minRows={3}
                multiline
                placeholder="Description"
                value={formData?.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </FormControl>
          </Stack>
        </BaseDialog>
      </Card>
    )
  })

  return {
    savedSquads,
    addSquad,
    updateSquad,
    deleteSquad,
    SavedSquadSelector: Selector,
    activeSquad,
    setActiveSquad,
  }
}
