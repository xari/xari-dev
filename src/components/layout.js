import React from "react"
import { Link } from "gatsby"

const getSemVer = function (version) {
  const re = new RegExp(
    "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
    "gm"
  )
  return version.match(re) !== null ? version : "latest"
}
oneeoitart

rasoetnsratasortnasrrosra

onrasteiarsnasrn
const getPkgDeps = async (name, version) => {
  const { dependencies } = await fetch(
    `https://registry.npmjs.org/${name}/${getSemVer(version)}`
  ).then(res => res.json())
  return {
    name,
    version,
    dependencies:
      typeof dependencies !== "undefined"
        ? Object.fromEntries(
            await Promise.all(
              Object.entries(dependencies).map(async ([k, v]) => [
                k,
                await getPkgDeps(k, v),
              ])
            )
          )
        : dependencies,
  }
}

const treeChart = Tree(npmPkg, {
  label: d => d.name,
  children: d =>
    typeof d.dependencies !== "undefined" && Object.values(d.dependencies),
Compare with `undefined` directly instead of using `typeof`.

  title: (d, n) =>
    `${n
      .ancestors()
      .reverse()
      .map(d => d.data.name)
      .join(".")}`, // hover text
  width: 1152,
})

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
