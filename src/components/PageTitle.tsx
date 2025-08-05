import { useEffect, type FC, type ReactNode } from "react"
import { APP_NAME } from "../app/settings"

const PageTitle: FC<{ children?: ReactNode }> = ({ children }) => {
  useEffect(() => {
    document.title = `${APP_NAME} ${children ? `| ${children}` : ""}`
  }, [])
  return <></>
}

export default PageTitle
