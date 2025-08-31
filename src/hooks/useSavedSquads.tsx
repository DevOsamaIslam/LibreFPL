import { DeleteForeverOutlined, RefreshOutlined } from "@mui/icons-material"
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
  Tooltip,
} from "@mui/material"
import { memo, useCallback, useState } from "react"
import BaseDialog from "../components/BaseDialog"
import SpaceBetween from "../components/SpaceBetween"
import { useSnackbarUtils } from "../lib/snackbar"
import type { ISavedSquad } from "../lib/types"
import { useLocalStorage } from "./useLocalStorage"
import { useSettingsStore } from "../app/settings"

export const useSavedSquads = () => {
  const [activeSquad, setActiveSquad] = useState<ISavedSquad>()
  const [openDialog, setOpenDialog] = useState(false)
  const { success, error } = useSnackbarUtils()

  const { myTeam } = useSettingsStore()

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
                {myTeam && (
                  <MenuItem
                    value="my-team"
                    onClick={() =>
                      setActiveSquad({
                        title: "My Team",
                        playerIds: myTeam.picks.map((p) => p.element),
                        updatedAt: new Date().toString(),
                      })
                    }>
                    - My Team -
                  </MenuItem>
                )}
                {savedSquads.map((squad) => (
                  <MenuItem
                    key={squad.title}
                    value={squad.title}
                    onClick={() => setActiveSquad(squad)}>
                    <SpaceBetween>
                      {squad.title}
                      <Stack direction={"row"} spacing={1}>
                        <Tooltip title="Update to current squad" arrow>
                          <RefreshOutlined
                            onClick={(event) => {
                              updateSquad({
                                ...squad,
                                playerIds: activeSquad?.playerIds || [],
                                updatedAt: new Date().toString(),
                              })
                              event.stopPropagation()
                            }}
                          />
                        </Tooltip>
                        <DeleteForeverOutlined
                          color="error"
                          onClick={(event) => {
                            deleteSquad(squad)
                            event.stopPropagation()
                          }}
                        />
                      </Stack>
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
              updatedAt: new Date().toString(),
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
