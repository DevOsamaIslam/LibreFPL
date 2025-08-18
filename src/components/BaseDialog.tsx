import CloseIcon from "@mui/icons-material/Close"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material"
import React from "react"

export interface BaseDialogProps {
  open: boolean
  onClose: () => void
  onSubmit?: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl"
  fullWidth?: boolean
  disableEscapeKeyDown?: boolean
  hideCloseButton?: boolean
}

export const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  disableEscapeKeyDown = false,
  hideCloseButton = false,
}) => {
  const defaultActions = (
    <>
      <Button onClick={onClose} color="inherit">
        Cancel
      </Button>
      <Button onClick={onSubmit} variant="contained">
        Save
      </Button>
    </>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        },
      }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        {!hideCloseButton && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: (theme) => theme.palette.grey[500],
              "&:hover": {
                color: (theme) => theme.palette.grey[700],
                backgroundColor: (theme) => theme.palette.action.hover,
              },
            }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
      {!actions && <DialogActions>{defaultActions}</DialogActions>}
    </Dialog>
  )
}

export default BaseDialog
