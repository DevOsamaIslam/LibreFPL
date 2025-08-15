export const getItem = <T>(key: string): T | null => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T
  } catch (error) {
    return null
  }
}

export const setItem = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const removeItem = (key: string) => {
  localStorage.removeItem(key)
}
