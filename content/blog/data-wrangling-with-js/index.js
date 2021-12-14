// Step one: get data

const fs = require("fs")

const beers = JSON.parse(
  fs.readFileSync("./content/blog/data-wrangling-with-js/beers.json")
)

// Step one: get hops from beers

const keepUnique = property => {
  const uniqueSet = new Set()

  return (acc, cur) => {
    const value = cur[property]

    return uniqueSet.has(value)
      ? acc
      : uniqueSet.add(value) && acc.concat(value)
  }
}

const keepUniqueHops = keepUnique("name")

const hops = beers.reduce((acc, cur) => {
  return cur.ingredients.hops.reduce(keepUniqueHops, acc)
}, [])

// Step three: Plot the 30 most bitter beers

const path = require("path")
const jsdom = require("jsdom")
const { JSDOM } = jsdom

// Load D3 and create a canvas + context
let d3 = import("d3").then(d3 => {
  const body = d3.select(new JSDOM().window.document).select("body")

  const ibu = beers
    .map(beer => ({
      name: beer.name,
      value: beer.ibu,
    }))
    .filter(x => Number(x.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, 20)

  // Dimensions
  const width = 680
  const height = 480

  const svg = body
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", width)
    .attr("height", height)

  // White background
  svg
    .append("rect")
    .attr("height", height)
    .attr("width", width)
    .attr("x", 0)
    .attr("y", 0)
    .style("fill", "#fff")

  // Draw the outline
  const documentOutline = svg
    .append("rect")
    .attr("height", height)
    .attr("width", width)
    .attr("x", 0)
    .attr("y", 0)
    .style("stroke", "#000")
    .style("fill", "none")

  // Write to file
  const __dirname = path.resolve(path.dirname(""))

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/outline.svg",
    body.html()
  )

  // Draw the inner box to show where the plot will be

  // Margins
  const margin = { top: 80, right: 50, bottom: 60, left: 200 }

  const plotHeight = height - margin.top - margin.bottom
  const plotWidth = width - margin.left - margin.right

  // 0, 0 is top left
  const plotOutline = svg
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("height", plotHeight)
    .attr("width", plotWidth)
    .style("fill", "#00AFDB")

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/plot-outline.svg",
    body.html()
  )

  // Create the scales

  const x = d3
    .scaleLinear()
    .domain([0, ibu.at(0).value])
    .range([0, plotWidth])

  // X Axis
  const axisX = svg
    .append("g") // new "group"
    .attr("transform", `translate(0, ${plotHeight})`)
    .call(d3.axisBottom(x))

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/x_axis.svg",
    body.html()
  )

  axisX
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/rotated.svg",
    body.html()
  )

  axisX.attr(
    "transform",
    `translate(${margin.left}, ${plotHeight + margin.top})`
  )

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/aligned.svg",
    body.html()
  )

  // Title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", (margin.top / 3) * 2) // 2 thirds of the way
    .attr("text-anchor", "middle")
    .text("Brewdog's Most Bitter Beers")
    .style("font-size", "18px")
    .style("font-weight", "bold")

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/title.svg",
    body.html()
  )

  // Label X Axis
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", margin.left + plotWidth + 25)
    .attr("y", margin.top + plotHeight + 25)
    .text("IBU")
    .style("font-size", "14px")
    .style("font-weight", "bold")

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/label.svg",
    body.html()
  )

  const y = d3
    .scaleBand()
    .range([0, plotHeight])
    .domain(ibu.map(x => x.name))
    .padding(0.1) // Adds space between the bars

  // Y Axis
  const yNoTicks = d3.axisLeft(y).tickSize(0)

  const axisY = svg
    .append("g")
    .call(yNoTicks)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .style("font-size", "12px")
    .style("font-weight", "light")
    .style("fill", "#000")
    .style("stroke", "none")

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/y_axis.svg",
    body.html()
  )

  // Remove the two existing rects
  documentOutline.remove()
  plotOutline.remove()

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/axes.svg",
    body.html()
  )

  // Remove domain line from Y axis
  axisY.call(g => g.select(".domain").remove())

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/remove_domain.svg",
    body.html()
  )

  // Bars
  svg
    .append("g") // new "group"
    .selectAll("rect")
    .data(ibu)
    .join("rect")
    .attr("x", 0.5) // Half pixel?
    .attr("y", data => y(data.name))
    .attr("width", data => x(data.value))
    .attr("height", y.bandwidth())
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("fill", "#00AFDB")
    .style("stroke", "#000")

  fs.writeFileSync(
    __dirname + "/content/blog/data-wrangling-with-js/bars.svg",
    body.html()
  )
})
