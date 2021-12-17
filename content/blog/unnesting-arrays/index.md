---
title: Unnesting Arrays
date: 2021-12-10
description: Patterns for surfacing nested arrays.
---

<div class="call-out-indigo">

This post is part of a series on data wrangling and visualisation with JavaScript.
You can find the other posts in the series at the link below.

- [Intro — Data Wrangling and Visualisation with JavaScript](../data-wrangling-with-js)
- [Pt. I — Unnesting Arrays](../unnesting-arrays)
- [Pt. II — Reducing Arrays](../reducing-arrays)
- [Pt. III — Intro to D3](../intro-to-d3)
- [Pt. IV — Binding data with D3](../binding-data-d3)
- [Pt. V — Horizontal Bar Plot With D3](../horizontal-bar-plot)

</div>

We'll begin by surfacing the nested hop names from the beer objects by chaining a few array methods together.
I'm only interested in the `name` of each hop, so I won't be keeping the other three properties.

```js
const hops = beers.map(x => x.ingredients.hops) // Surface the hops object
```

A single `map()` call can bring the `ingredients.hops` data to the surface.

```js
hops // Array(325) [Array(5), Array(4), Array(1), Array(6), Array(3), …]
```

This leaves us with an array of nested arrays.
The length is still `325`, meaning I've surfaced a single array from each of the beer objects.
Notice in the preview above that the nested arrays contain one or more objects.  
We can expect from this that when we unnest those arrays, the `length` of `hops` will be far greater than `325`.

The simplist way to unnest the nested arrays is to use `flatMap()` instead of `map()`.
`flatMap()` works like `map()`, except that it flattens the result by one level.
This means that the contents of any nested arrays will all get dumped into the top-level.

```js
const hops = beers.flatMap(x => x.ingredients.hops) // Surface the hops object
```

Using `flatMap` instead of `map` results in an array of 1817 `ingredients.hops` objects.

```js
hops // Array(1817) [{…}, {…}, {…}, {…}, {…}, …]
```

Each of these objects has the following structure.

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

As I mentioned though, we're only interested in the `name` of each hop, so let's tack-on a second call to our method chain (`map`) to surface those names.

```js
const hops = beers.flatMap(x => x.ingredients.hops).map(x => x.name)
```

The combined `flatMap()` and `map()` calls return an array of all hop strings.

```js
hops // Array(1817) ["Fuggles", "First Gold", "Cascade", "Amarillo", "Simcoe", …]
```

The data is now in the right shape, but there are duplicate records in it that need to be removed.

## Removing the duplicates

`filter()` is a great method for removing items that we don't want in our array.

```js
const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter((x, i, arr) => arr.indexOf(x) == i) // Remove the duplicates.
```

The filter predicate above uses `indexOf()` to check whether a hop name already exists in the array.

```js
hops // Array(166) ["Fuggles", "First Gold", "Cascade", "Amarillo", "Simcoe", …]
```

Success!
The array now contains 166 _unique_ hop names.

## Checking the performance

Let's check the time complexity of this pipeline.
It uses `flatMap()`, then `map()`, followed by `filter()`.
This would be **O(n)**, were it not using `indexOf()` for the filter predicate.
Because `indexOf()` is also iterating through the array, it brings the time complexity of the pipeline up to **O(n<sup>2</sup>)**.

Let's see if there are some low-hanging fruit that we can quickly pick.

## Optimizing the performance

A StackOverflow search for more efficient ways to remove duplicate items turned-up [this gem of an answer](https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array).
Following it's advice, let's switch-out `indexOf()` for a hash-table-based solution.

`hopsHash` is initalized as an empty object, and each iteration of `filter()` adds a new property to it, unless that property already exists.
I also removed the third argument to `filter()`, since we're no longer using it.

```js
const hopsHash = {}

const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter((x, i) => (hopsHash.hasOwnProperty(x) ? false : (hopsHash[i] = true)))
```

The result here is the same, but it brings our time complexity down to **O(n)** because `indexOf()` is no longer iterating the array.

![South Park](https://i.imgur.com/6K1tEDW.jpg)

To clean this up slightly, we can move the predicate into its own function (`keepUniqueHops()`).

```js
const hopsHash = {}

const keepUniqueHops = (x, i) =>
  hopsHash.hasOwnProperty(x) ? false : (hopsHash[i] = true)

const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter(keepUniqueHops)
```

Going one step further, we can switch-out our pseudo-hash-table for ES6's `Set` object.

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
Well; that depends on what we mean by better.
