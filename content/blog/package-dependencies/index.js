import React from "react"
import * as d3 from "d3"
import Tree from "./tree.js"
import ForceGraph from "./force-graph.js"
import Legend from "./legend.js"

export function TreeChart({ data }) {
  const ref = React.useRef(null)

  React.useEffect(() => {
    if (ref.current !== null) {
      ref.current.innerHTML = "" // Prevent duplication

      Tree(
        data,
        {
          label: d => d.name,
          children: d =>
            typeof d.dependencies !== "undefined" &&
            Object.values(d.dependencies),
          title: (d, n) =>
            `${n
              .ancestors()
              .reverse()
              .map(d => d.data.name)
              .join(".")}`, // hover text
          width: 1100,
        },
        ref
      )
    }
  })

  return <svg ref={ref}></svg>
}

export function ForceGraphChart({ data }) {
  const ref = React.useRef(null)

  React.useEffect(() => {
    if (ref.current !== null) {
      ref.current.innerHTML = "" // Prevent duplication

      ForceGraph(
        data,
        {
          nodeId: d => d.id,
          nodeGroup: d => d.group,
          nodeTitle: d => `${d.id}\n${d.group}`,
          height: 460,
        },
        ref
      )
    }
  })

  return <svg ref={ref}></svg>
}

export function ForceLegend({ range, title }) {
  const ref = React.useRef(null)

  React.useEffect(() => {
    if (ref.current !== null) {
      ref.current.innerHTML = "" // Prevent duplication

      Legend(
        d3.scaleOrdinal(range, d3.schemeTableau10),
        {
          title: title,
          tickSize: 0,
        },
        ref
      )
    }
  })

  return <svg ref={ref}></svg>
}
