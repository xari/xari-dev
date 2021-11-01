import React from "react"
import { Link } from "gatsby"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1 className="text-5xl my-3">
        <Link to={`/`}>{title}</Link>
      </h1>
    )
  } else {
    header = (
      <h3 className="text-xl my-3">
        <Link to={`/`}>{title}</Link>
      </h3>
    )
  }
  return (
    <div className="p-5">
      <header>{header}</header>
      <main className="my-3">{children}</main>
      <footer>© {new Date().getFullYear()}</footer>
    </div>
  )
}

export default Layout
