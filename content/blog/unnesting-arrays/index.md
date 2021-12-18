---
title: Unnesting Arrays
date: 2021-12-10
description: Patterns for surfacing nested arrays.
---

<div class="call-out-indigo">

This post is part of a series on data wrangling and visualisation with JavaScript.
You can find the other posts in the series at the links below.

- [Intro — Data Wrangling and Visualisation with JavaScript](../data-wrangling-with-js)
- [Pt. I — Unnesting Arrays](../unnesting-arrays)
- [Pt. II — Reducing Arrays](../reducing-arrays)
- [Pt. III — Intro to D3](../intro-to-d3)
- [Pt. IV — Binding data with D3](../binding-data-d3)
- [Pt. V — Horizontal Bar Plot With D3](../horizontal-bar-plot)

</div>

This post explores how to unnest a collection of strings that are nested deep inside of an array of objects.

Picking-up from where we left off in the previous post, we're now going to unnest the `ingredients.hops` array from each beer object.
Well then use this new array to compile an array of the hops that Brewdog uses in its beers.

```js
beers // Array(325) [{…}, {…}, {…}, {…}, {…}, …]
```

Each beer object has the following properties:

<div class="sm-text">

```json
[
  "id",
  "name",
  "tagline",
  "first_brewed",
  "description",
  "image_url",
  "abv",
  "ibu",
  "target_fg",
  "target_og",
  "ebc",
  "srm",
  "ph",
  "attenuation_level",
  "volume",
  "boil_volume",
  "method",
  "ingredients",
  "food_pairing",
  "brewers_tips",
  "contributed_by"
]
```

</div>

`ingredients` is an object that has a `hops` array property.
We're going to create a new array containing only data from these hop objects.
Since each `ingredients.hops` array contains one or more hops, we can expect the `hops` array that we create to be longer than the original `beers` array.

A single `map()` call can bring the `ingredients.hops` property to the surface.

```js
const hops = beers.map(x => x.ingredients.hops)
```

This leaves us with an array of nested arrays.

```js
hops // Array(325) [Array(5), Array(4), Array(1), Array(6), Array(3), …]
```

The length is still `325`, and we've surfaced a single array from each of the beer objects.
Notice above that the nested arrays contain one or more objects.  
We can expect from this that when we unnest those arrays, the `length` of `hops` will be far greater than `325`.

The most simple way to unnest the nested arrays is to use `flatMap()` instead of `map()`.
`flatMap()` works like `map()`, except that it flattens the result by one level.
This means that the contents of any nested arrays will all get unnested, and their contents dumped into the array.

```js
const hops = beers.flatMap(x => x.ingredients.hops)
```

Using `flatMap` instead of `map` results in an array of 1817 hop objects.

```js
hops // Array(1817) [{…}, {…}, {…}, {…}, {…}, …]
```

This array contains hop objects that look like the one below:

<div class="sm-text">

```json
{
  "name": "Chinook",
  "amount": {
    "value": 15,
    "unit": "grams"
  },
  "add": "start",
  "attribute": "bitter"
}
```

</div>

In fact; we're only interested in the `name` of each hop, so we're going to discard the other three properties.
In order to get just the `name` property, let's tack-on a second call to our method chain to surface those names.

```js
const hops = beers.flatMap(x => x.ingredients.hops).map(x => x.name)
```

The combined `flatMap()` and `map()` calls return an array of hop name strings.

```js
hops // Array(1817) ["Fuggles", "First Gold", "Cascade", "Amarillo", "Simcoe", …]
```

The data is now in the right shape, but there are duplicate records in it that need to be removed.

## Removing the duplicates

`filter()` is an excellent choice for removing items that we don't want in our array.

```js
const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter((x, i, arr) => arr.indexOf(x) == i) // Remove the duplicates.
```

The anonymous function that is given to `filter()` above is called a "predicate".
This filter predicate uses `indexOf()` to check whether a hop name already exists in the array, if it already exists then it isn't counted a subsequent time.

```js
hops // Array(166) ["Fuggles", "First Gold", "Cascade", "Amarillo", "Simcoe", …]
```

Success!
We removed the duplicates, and the array contains 166 _unique_ hop names.

## Performance optimizations

Let's take a moment to check the time complexity of this pipeline.
It uses `flatMap()`, then `map()`, followed by `filter()`.
This would be **O(n)**, were the filter predicate not using `indexOf()`.
Because `indexOf()` is also iterating through the array, it brings the time complexity of the pipeline up to **O(n<sup>2</sup>)**.

Whether the algorithm to transform such a small array is **0(n)** or **O(n<sup>2</sup>)** is almost irrelevant.
Still; it's worth exploring whether there are any low-hanging fruit that can improve the time complexity of the pipeline while keeping just as easy to understand and maintain.

A StackOverflow search for more efficient ways to remove duplicate items turned-up [this gem of an answer](https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array).
Following it's advice, let's switch-out `indexOf()` for a hash-table-based solution, which won't iterate the array on every iteration of the filter predicate.

```js
const hopsHash = {}
```

`hopsHash` is initalized as an empty object, and each iteration of `filter()` adds a new property to it, **unless that property already exists**.

```js
const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter((x, i) => (hopsHash.hasOwnProperty(x) ? false : (hopsHash[i] = true)))
```

The result here is the same, but it brings our time complexity down to **O(n)** because `indexOf()` is no longer iterating the array.

![South Park](https://i.imgur.com/6K1tEDW.jpg)

This obviously introduces some new overhead, with the creation of `hopsHash`.
To clean this up a little, let's start by moving the predicate into its own function (`keepUniqueHops()`).

```js
const hopsHash = {}

const keepUniqueHops = (x, i) =>
  hopsHash.hasOwnProperty(x) ? false : (hopsHash[i] = true)

const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter(keepUniqueHops)
```

Going one step further, we can switch-out our pseudo-hash-table and the use of `hasOwnProperty()` for a predicate that uses ES6's `Set` object.

```js
const hopsSet = new Set()

const keepUniqueHops = x => (hopsSet.has(x) ? false : hopsSet.add(x))
```

`Set` objects let us store unique values of any type, and they offer a simple way to check check whether a set already contains a value.

Instead of leaving `hopsSet` in the global scope, I'll also wrap it up into a _higher-order function_ that returns the predicate used by `filter()`.

```js
const keepUnique = () => {
  const uniqueSet = new Set()

  return x => (uniqueSet.has(x) ? false : uniqueSet.add(x))
}

const keepUniqueHops = keepUnique()

const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter(keepUniqueHops)
```

Higher-order functions are functions that return functions.
In this case, `keepUnique()` returns an anonymous function that can be used as a predicate in `filter()` calls.

Changing the specific `keepUniqueHops()` function to the generic `keepUnique()` function means that this new function can be used throughout the codebase anytime that duplicate items need to be removed from an array.

But is there a way it can be even better?
Well, that depends on what we mean by better; but that's exactly the question we'll explore in the [next post](../reducing-arrays) which attempts to one-up this pipeline using `reduce()`.
