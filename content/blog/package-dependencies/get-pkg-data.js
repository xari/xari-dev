import fetch from "node-fetch"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname } from "path"

const getSemVer = function (version) {
  const re = new RegExp(
    "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
    "gm"
  )

  return version.match(re) !== null ? version : "latest"
}

const nodes = []
const links = []

const getPkgDeps = async (name, version, group = 0, source) => {
  const { dependencies } = await fetch(
    `https://registry.npmjs.org/${name}/${getSemVer(version)}`
  ).then(res => res.json())

  // Push node to nodes, unless it's already there.
  nodes.findIndex(x => x.id === name) === -1 && nodes.push({ id: name, group })
  // Push link, unless except for the first-order package.
  source && links.push({ source, target: name })

  return {
    name,
    version,
    dependencies:
      typeof dependencies !== "undefined"
        ? Object.fromEntries(
            await Promise.all(
              Object.entries(dependencies).map(async ([k, v]) => [
                k,
                await getPkgDeps(k, v, group + 1, name),
              ])
            )
          )
        : dependencies,
  }
}

const pkg = await getPkgDeps("react", "latest")

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Export data to use in force-directed chart post
fs.writeFileSync(
  __dirname + "/pkg-react-latest.json",
  JSON.stringify({ tree: pkg, nodes, links }, null, 2),
  "utf-8"
)
