import React from "react"
import * as d3 from "d3"
import { useD3 } from "../compare-dependencies/index.js"
import Chord from "./chord.js"

export const ChordDiagram = ({ data }) => {
  data = data.map(x => {
    x["value"] = 1

    return x
  })

  const names = Array.from(
    new Set(data.flatMap(d => [d.source, d.target]))
  ).sort(d3.ascending)

  const index = new Map(names.map((name, i) => [name, i]))

  const matrix = Array.from(index, () => new Array(names.length).fill(0))

  for (const { source, target, value } of data) {
    matrix[index.get(target)][index.get(source)] += value
  }

  return useD3(
    Chord,
    { data, names, matrix },
    {
      color: d3.scaleOrdinal(
        names,
        d3.quantize(d3.interpolateSinebow, names.length)
      ),
    }
  )
}
