import { useSnackbar } from "../context/SnackbarContext"

export const useSnackbarUtils = () => {
  const { showSnackbar } = useSnackbar()

  const success = (message: string, duration?: number) => {
    showSnackbar({ message, type: "success", duration })
  }

  const error = (message: string, duration?: number) => {
    showSnackbar({ message, type: "error", duration })
  }

  const info = (message: string, duration?: number) => {
    showSnackbar({ message, type: "info", duration })
  }

  const warning = (message: string, duration?: number) => {
    showSnackbar({ message, type: "warning", duration })
  }

  return {
    success,
    error,
    info,
    warning,
  }
}

// Create a global snackbar object that can be used without React context
let globalSnackbarUtils: ReturnType<typeof useSnackbarUtils> | null = null

export const getGlobalSnackbar = () => {
  if (!globalSnackbarUtils) {
    // This is a fallback for non-React contexts
    // In a real implementation, you might want to use a different approach
    console.warn("Global snackbar accessed before initialization")
    globalSnackbarUtils = {
      success: (message: string) => console.log(`Success: ${message}`),
      error: (message: string) => console.error(`Error: ${message}`),
      info: (message: string) => console.info(`Info: ${message}`),
      warning: (message: string) => console.warn(`Warning: ${message}`),
    }
  }
  return globalSnackbarUtils
}

// Initialize global snackbar when the app starts
export const initializeGlobalSnackbar = (
  utils: ReturnType<typeof useSnackbarUtils>
) => {
  globalSnackbarUtils = utils
}
