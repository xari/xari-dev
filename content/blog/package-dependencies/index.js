import React from "react"
import * as d3 from "d3"
import Tree from "./tree.js"
import ForceGraph from "./force-graph.js"
import Legend from "./legend.js"

function useD3(callback, ...args) {
  const ref = React.useRef(null)

  React.useEffect(() => {
    if (ref.current !== null) {
      ref.current.innerHTML = "" // Prevent duplication

      callback(...args, ref)
    }
  })

  return <svg ref={ref}></svg>
}

export const TreeChart = ({ data }) =>
  useD3(Tree, data, {
    label: d => d.name,
    children: d =>
      typeof d.dependencies !== "undefined" && Object.values(d.dependencies),
    title: (d, n) =>
      `${n
        .ancestors()
        .reverse()
        .map(d => d.data.name)
        .join(".")}`, // hover text
    width: 1100,
  })

export const ForceGraphChart = ({ data }) =>
  useD3(ForceGraph, data, {
    nodeId: d => d.id,
    nodeGroup: d => d.group,
    nodeTitle: d => `${d.id}\n${d.group}`,
    height: 460,
  })

export const ForceLegend = ({ range, title }) =>
  useD3(Legend, d3.scaleOrdinal(range, d3.schemeTableau10), {
    title: title,
    tickSize: 0,
  })
