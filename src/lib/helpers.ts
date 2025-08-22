import { CURRENCY } from "../app/settings"

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

export const convert2label = (input = ""): string => {
  // Define exceptions for words that should not be manipulated
  const exceptions = ["MFA", "C2C", "IP", "EULA", "IB"]

  /**
   * Maps a word to its capitalized form with exceptions.
   *
   * @param {string | undefined} word - The word to be mapped.
   * @returns {string} The capitalized form of the word.
   */
  const mapFn = (word: string | undefined): string => {
    if (!word) return ""
    if (exceptions.includes(word)) return word
    if (/^[A-Z]+$/.test(word)) return word
    // Capitalize the first letter and make the rest lowercase
    return word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase()
  }

  let s = input

  // Replace underscores and hyphens with spaces
  s = s.replace(/[_-]/g, " ")

  // Add a space before capital letters (for camel case and Pascal case)
  s = s.replace(/([a-z])([A-Z])/g, "$1 $2")

  // Iterate through exceptions and add spaces as needed
  // TODO improve performance
  exceptions.forEach((word) => {
    if (s.includes(word)) {
      s = s.replaceAll(word, () => {
        if (s.startsWith(word)) return `${word} `
        if (s.endsWith(word)) return ` ${word}`
        return ` ${word} `
      })
    }
  })

  // Convert to title case by mapping and joining words
  s = s.split(" ").map(mapFn).join(" ").trim()

  return s
}

export function priceFmt(n: number | undefined) {
  if (n === undefined || n === null) return "-"
  return CURRENCY + (n / 10).toFixed(1)
}
