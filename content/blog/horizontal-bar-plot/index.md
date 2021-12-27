---
title: JS Data Recipies Pt. V — Horizontal Bar Plot With D3
date: 2021-12-16
description: Everything you need to know to head down the road of D3 mastery.
---

<div class="call-out-indigo">

This post is part of a series on data wrangling and visualisation with JavaScript.
You can find the other posts in the series at the links below.

- [Intro — Data Wrangling and Visualisation with JavaScript](../data-wrangling-with-js)
- [Pt. I — Unnesting Arrays](../unnesting-arrays)
- [Pt. II — Reducing Arrays](../reducing-arrays)
- [Pt. III — Intro to D3](../intro-to-d3)
- [Pt. IV — Binding data with D3](../binding-data-d3)
- [Pt. V — D3 Scales](../d3-scales)
- [Pt. VI — Horizontal Bar Plot With D3](../horizontal-bar-plot)

</div>

For this part of the series, we're going to make a horizontal bar plot using D3.js.
I've broken the steps into an easy-to follow sequence, so if you're new to D3, this is a great place to get oriented with how to use it.

IBU stands for International Bitterness Units.
It's a metric that represents the bitterness of a drink.
The higher the IBU, the more bitter the beer.

---

```js
const margin = { top: 80, right: 50, bottom: 60, left: 200 }
const width = 680
const height = 480

const svg = body
  .append("svg")
  .attr("xmlns", "http://www.w3.org/2000/svg")
  .attr("width", width)
  .attr("height", height)
```

// Drawing a box around the whole thing

```js
const documentOutline = svg
  .append("rect")
  .attr("height", height)
  .attr("width", width)
  .attr("x", 0)
  .attr("y", 0)
  .style("stroke", "#000")
  .style("fill", "none")
```

![Outline](./outline.svg)

```js
outline // Selection { _groups: [ [ [SVGElement] ] ], _parents: [ null ] }
```

```js
const plotHeight = height - margin.top - margin.bottom
const plotWidth = width - margin.left - margin.right
```

```js
const plotOutline = svg
  .append("rect")
  .attr("x", margin.left)
  .attr("y", margin.top)
  .attr("height", plotHeight)
  .attr("width", plotWidth)
  .style("fill", "#00AFDB")
```

![Plot outline](./plot-outline.svg)

## Using scales

```js
const yScale = d3
  .scaleBand()
  .range([0, plotHeight])
  .domain(ibu.map(x => x.name))
```

```js
const axisY = outlineSVG
  .append("g")
  .call(d3.axisLeft(yScale))
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .style("font-size", "12px")
```

![Scale axis](./scale-axis.svg)

What does `.call()` do?

`.call(d3.axisLeft(yScale))`

```js
d3.axisLeft(scaleY)
```

Returns a function...

```js
[Function: axis] {
  scale: [Function (anonymous)],
  ticks: [Function (anonymous)],
  tickArguments: [Function (anonymous)],
  tickValues: [Function (anonymous)],
  tickFormat: [Function (anonymous)],
  tickSize: [Function (anonymous)],
  tickSizeInner: [Function (anonymous)],
  tickSizeOuter: [Function (anonymous)],
  tickPadding: [Function (anonymous)],
  offset: [Function (anonymous)]
}
```

```js
outlineSVG
  .append("g")
  .call(d3.axisLeft(yScale).tickSize(0)) // This is the part that changed
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .style("font-size", "12px")
```

![Y Axis, no ticks](./scale-y-no-ticks.svg)

## What is this here for?

```js
svg
  .append("g")
  .selectAll("rect")
  .data(ibu)
  .join("rect")
  .attr("x", 0.5) // Half pixel?
  .attr("y", data => y(data.name))
  .attr("width", data => x(data.value))
  .attr("height", y.bandwidth())
  .attr("fill", "#00AFDB")
  .style("stroke", "#000")
```

```js
.attr("y", data => {
  console.log(y(data.name))

  return y(data.name)
})
```

```js
1.990049751243788
21.8905472636816
41.79104477611941
61.69154228855723
81.59203980099504
101.49253731343285
121.39303482587067
141.29353233830847
161.1940298507463
181.0945273631841
200.9950248756219
220.89552238805973
240.79601990049755
260.69651741293535
280.5970149253732
300.497512437811
320.3980099502488
340.29850746268664
360.19900497512447
380.0995024875622
```

```js
const scaleX = d3
  .scaleLinear()
  .domain([0, ibu.at(0).value])
  .range([0, plotWidth])
```

What is `scaleX`?

```js
[Function: scale] {
  invert: [Function (anonymous)],
  domain: [Function (anonymous)],
  range: [Function (anonymous)],
  rangeRound: [Function (anonymous)],
  clamp: [Function (anonymous)],
  interpolate: [Function (anonymous)],
  unknown: [Function (anonymous)],
  copy: [Function (anonymous)],
  ticks: [Function (anonymous)],
  tickFormat: [Function (anonymous)],
  nice: [Function (anonymous)]
}
```

We're about to use the `d3.axisBottom()` function.
This function returns a fucntion...

```js
[Function: axis] {
  scale: [Function (anonymous)],
  ticks: [Function (anonymous)],
  tickArguments: [Function (anonymous)],
  tickValues: [Function (anonymous)],
  tickFormat: [Function (anonymous)],
  tickSize: [Function (anonymous)],
  tickSizeInner: [Function (anonymous)],
  tickSizeOuter: [Function (anonymous)],
  tickPadding: [Function (anonymous)],
  offset: [Function (anonymous)]
}
```

## Transform

```js
const axisX = svg
  .append("g") // new "group"
  .attr("transform", `translate(0, ${plotHeight})`)
  .call(d3.axisBottom(scaleX))
```

`axisX` ? What is it?

```js
Selection { _groups: [ [ [SVGElement] ] ], _parents: [ null ] }
```

![X Axis](./x_axis.svg)

Then rotate the text

```js
axisX
  .selectAll("text")
  .attr("transform", "translate(-10,0)rotate(-45)")
  .style("text-anchor", "end")
```

![X Axis](./rotated.svg)

And fix the alignment...

```js
axisX.attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
```

![Axis alignment](./aligned.svg)

Add a title...

## Text

```js
svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .text("Brewdog's Most Bitter Beers")
  .style("font-size", "18px")
  .style("font-weight", "bold")
```

![Title](./title.svg)

Add an X axis label

```js
svg
  .append("text")
  .attr("text-anchor", "end")
  .attr("x", margin.left + plotWidth + 25)
  .attr("y", margin.top + plotHeight + 25)
  .text("IBU")
  .style("font-size", "14px")
  .style("font-weight", "bold")
```

![Label](./label.svg)

## Y Axis

```js
const scaleY = d3
  .scaleBand()
  .range([0, plotHeight])
  .domain(ibu.map(x => x.name))
  .padding(0.1) // Adds space between the bars
```

```js
svg
  .append("g")
  .call(d3.axisLeft(scaleY).tickSize(0))
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .style("font-size", "12px")
  .style("font-weight", "light")
  .style("fill", "#000")
  .style("stroke", "none")
```

![Y Axis](./y_axis.svg)

## Removing elements from the document

Remove the outlines

```js
// Remove the two existing rects
documentOutline.remove()
plotOutline.remove()
```

![Just axes](./axes.svg)

And finally, remove the Y axis domain line

```js
axisY.call(g => g.select(".domain").remove())
```

![Removed domain from Y axis](./remove_domain.svg)

## Recap

```js
svg
```

```js
Selection { _groups: [ [ SVGSVGElement {} ] ], _parents: [ null ] }
```

```js
svg
```

```js
Selection { _groups: [ [ SVGSVGElement {} ] ], _parents: [ null ] }
```

```js
svg.append("g") // new "group"
```

```js
Selection { _groups: [ [ SVGElement {} ] ], _parents: [ null ] }
```

```js
svg.append("g").selectAll("rect")
```

```js
Selection { _groups: [ NodeList {} ], _parents: [ SVGElement {} ] }
```

```js
svg.append("g").selectAll("rect").data(ibu)
```

```js
Selection {
  _groups: [ [ <20 empty items> ] ],
  _parents: [ SVGElement {} ],
  _enter: [
    [
      [EnterNode], [EnterNode],
      [EnterNode], [EnterNode],
      [EnterNode], [EnterNode],
      [EnterNode], [EnterNode],
      [EnterNode], [EnterNode],
      [EnterNode], [EnterNode],
      [EnterNode], [EnterNode],
      [EnterNode], [EnterNode],
      [EnterNode], [EnterNode],
      [EnterNode], [EnterNode]
    ]
  ],
  _exit: [ [] ]
}
```

```js
svg.append("g").selectAll("rect").data(ibu).join("rect")
```

```js
Selection {
  _groups: [
    [
      [SVGElement], [SVGElement],
      [SVGElement], [SVGElement],
      [SVGElement], [SVGElement],
      [SVGElement], [SVGElement],
      [SVGElement], [SVGElement],
      [SVGElement], [SVGElement],
      [SVGElement], [SVGElement],
      [SVGElement], [SVGElement],
      [SVGElement], [SVGElement],
      [SVGElement], [SVGElement]
    ]
  ],
  _parents: [ SVGElement {} ]
}
```

```js
svg
  .append("g")
  .selectAll("rect")
  .data(ibu)
  .join("rect")
  .attr("x", 0.5) // Half pixel?
  .attr("y", data => scaleY(data.name))
  .attr("width", data => scaleX(data.value))
  .attr("height", scaleY.bandwidth())
  .attr("fill", "#00AFDB")
  .style("stroke", "#000")
```

```js
.attr("y", data => {
  console.log(scaleY(data.name))

  return y(data.name)
})
```

```js
1.990049751243788
21.8905472636816
41.79104477611941
61.69154228855723
81.59203980099504
101.49253731343285
121.39303482587067
141.29353233830847
161.1940298507463
181.0945273631841
200.9950248756219
220.89552238805973
240.79601990049755
260.69651741293535
280.5970149253732
300.497512437811
320.3980099502488
340.29850746268664
360.19900497512447
380.0995024875622
```

```js
y.bandwidth()
```

```js
17.910447761194032
```

![Bars](./bars.svg)

<div class="call-out-indigo">

## 32% ABV!?

<iframe title="vimeo-player" src="https://player.vimeo.com/video/7812379?h=1c9cd7ede5" width="640" height="360" frameborder="0" allowfullscreen></iframe>

</div>
