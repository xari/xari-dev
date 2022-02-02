import * as d3 from "d3"

// Inspired by https://observablehq.com/@d3/chord-dependency-diagram
export default function Chord(
  { data, names, matrix },
  {
    color = d3.scaleOrdinal(
      names,
      d3.quantize(d3.interpolateRainbow, names.length)
    ),
    width = 954,
    height = 954,
    innerRadius = 387,
    outerRadius = 397,
    fontSize = 10,
  },
  ref
) {
  console.log("STRARSATSRA")
  console.log(ref)

  const svg = d3
    .select(ref.current)
    .attr("viewBox", [-width / 2, -height / 2, width, height])

  const chord = d3
    .chordDirected()
    .padAngle(10 / innerRadius)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)

  const chords = chord(matrix)

  const group = svg
    .append("g")
    .attr("font-size", fontSize)
    .attr("font-family", "sans-serif")
    .selectAll("g")
    .data(chords.groups)
    .join("g")

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)

  group
    .append("path")
    .attr("fill", d => color(names[d.index]))
    .attr("d", arc)

  group
    .append("text")
    .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
    .attr("dy", "0.35em")
    .attr(
      "transform",
      d => `
        rotate(${(d.angle * 180) / Math.PI - 90})
        translate(${outerRadius + 5})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `
    )
    .attr("text-anchor", d => (d.angle > Math.PI ? "end" : null))
    .text(d => names[d.index])

  group.append("title").text(
    d => `${names[d.index]}
${d3.sum(chords, c => (c.source.index === d.index) * c.source.value)} outgoing →
${d3.sum(
  chords,
  c => (c.target.index === d.index) * c.source.value
)} incoming ←`
  )

  const ribbon = d3
    .ribbonArrow()
    .radius(innerRadius - 1)
    .padAngle(1 / innerRadius)

  svg
    .append("g")
    .attr("fill-opacity", 0.75)
    .selectAll("path")
    .data(chords)
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("fill", d => color(names[d.target.index]))
    .attr("d", ribbon)
    .append("title")
    .text(
      d =>
        `${names[d.source.index]} → ${names[d.target.index]} ${d.source.value}`
    )

  return svg.node()
}
