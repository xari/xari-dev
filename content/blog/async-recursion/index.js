import fetch from "node-fetch"
import fs from "fs"
import Tree from "./tree.js"
import { fileURLToPath } from "url"
import { dirname } from "path"

const getSemVer = function (version) {
  const re = new RegExp(
    String.raw`^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$`,
    "gm"
  )

  return version.match(re) === null ? "latest" : version
}

const getPkgDeps = async (name, version) => {
  const { dependencies } = await fetch(
    `https://registry.npmjs.org/${name}/${getSemVer(version)}`
  ).then(res => res.json())

  return {
    name,
    version,
    dependencies:
      typeof dependencies === "undefined"
        ? dependencies
        : Object.fromEntries(
            await Promise.all(
              Object.entries(dependencies).map(async ([k, v]) => [
                k,
                await getPkgDeps(k, v),
              ])
            )
          ),
  }
}

const npmPkg = await getPkgDeps("d3", "latest")

const treeChart = Tree(npmPkg, {
  label: d => d.name,
  children: d =>
    typeof d.dependencies !== "undefined" && Object.values(d.dependencies),
  title: (d, n) =>
    `${n
      .ancestors()
      .reverse()
      .map(d => d.data.name)
      .join(".")}`, // hover text
  width: 1152,
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

treeChart.setAttribute("xmlns", "http://www.w3.org/2000/svg")
fs.writeFileSync(__dirname + "/tree.svg", treeChart.outerHTML)
