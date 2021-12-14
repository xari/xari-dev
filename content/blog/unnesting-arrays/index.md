---
title: JS Data Recipies Pt. I — Unnesting Arrays
date: 2021-12-10
description: Patterns for surfacing nested arrays.
---

Data wrangling can be one of the most rewarding tasks in programming.
I'm constantly searching for ways to make my data pipelines cleaner and faster, and in this post I outline a technique that I'm developing for simultaniously unnesting and reducing data.
In short; I'll be reducing an array of 325 objects into an array of 166 _unique_ strings.

This is a long post.
We'll first examine the step-by-step process of surfacing and unnesting the names of the hops that Brewdog uses in its beer, and as we progress we'll develop a pattern that can combine multiple array permutations into a single step.

## A dataset of 325 beers!

Brewdog is a highly successful brewery in Scotland.
They maintain a public REST API that can be used to query a database of their entire beer catalogue.

![Punk API](./punk_api.png)

Let's have a look at the data.
I requested this data from the [Punk API](https://punkapi.com/), and stored it in a variable called `beers`, shown below.

## Querying a paginated REST API

```js
const beers = JSON.parse(fs.readFileSync("./beers.json"))
```

## Exploring the data

As you can see; this array contains 325 beers.
I want to compile an array of all hops used by Brewdog.

```js
beers // Array(325) [{…}, {…}, {…}, {…}, {…}, …]
```

```js
Object.getOwnPropertyNames(beers[1])
```

To do that, I'll need to surface the hops data from each beer object.
We can see the first beer below.
There's a lot to it, but what I'm looking for is nested deep-down under `ingredients.hops`.

<div class="sm-text">

```json
{
    "id": 192,
    "name": "Punk IPA 2007 - 2010",
    "tagline": "Post Modern Classic. Spiky. Tropical. Hoppy.",
    "first_brewed": "04/2007",
    "description": "Our flagship beer that kick started the craft beer revolution. This is James and Martin's original take on an American IPA, subverted with punchy New Zealand hops. Layered with new world hops to create an all-out riot of grapefruit, pineapple and lychee before a spiky, mouth-puckering bitter finish.",
    "image_url": "https://images.punkapi.com/v2/192.png",
    "abv": 6.0,
    "ibu": 60.0,
    "target_fg": 1010.0,
    "target_og": 1056.0,
    "ebc": 17.0,
    "srm": 8.5,
    "ph": 4.4,
    "attenuation_level": 82.14,
    "volume": {
      "value": 20,
      "unit": "liters"
    },
    "boil_volume": {
      "value": 25,
      "unit": "liters"
    },
    "method": {
      "mash_temp": [
        {
          "temp": {
            "value": 65,
            "unit": "celsius"
          },
          "duration": 75
        }
      ],
      "fermentation": {
        "temp": {
          "value": 19.0,
          "unit": "celsius"
        }
      },
      "twist": null
    },
    "ingredients": {
      "malt": [
        {
          "name": "Extra Pale",
          "amount": {
            "value": 5.3,
            "unit": "kilograms"
          }
        }
      ],
      "hops": [
        {
          "name": "Ahtanum",
          "amount": {
            "value": 17.5,
            "unit": "grams"
           },
           "add": "start",
           "attribute": "bitter"
         },
         {
           "name": "Chinook",
           "amount": {
             "value": 15,
             "unit": "grams"
           },
           "add": "start",
           "attribute": "bitter"
         },
         ...
      ],
      "yeast": "Wyeast 1056 - American Ale™"
    },
    "food_pairing": [
      "Spicy carne asada with a pico de gallo sauce",
      "Shredded chicken tacos with a mango chilli lime salsa",
      "Cheesecake with a passion fruit swirl sauce"
    ],
    "brewers_tips": "While it may surprise you, this version of Punk IPA isn't dry hopped but still packs a punch! To make the best of the aroma hops make sure they are fully submerged and add them just before knock out for an intense hop hit.",
    "contributed_by": "Sam Mason <samjbmason>"
  }
```

</div>

`ingredients.hops` is an array of hops objects that outline the which hops are used in the brew, and at which point in the process they're added, along with what their effect on the recipe is.
The original Punk IPA uses only two hops, Ahtanum and Chinook, shown below.

<div class="sm-text">

```json
[
  {
    "name": "Ahtanum",
    "amount": {
      "value": 17.5,
      "unit": "grams"
    },
    "add": "start",
    "attribute": "bitter"
  },
  {
    "name": "Chinook",
    "amount": {
      "value": 15,
      "unit": "grams"
    },
    "add": "start",
    "attribute": "bitter"
  }
]
```

</div>

Each of the beers in the dataset contains at least one hop.
Considering that these beers all come from the same brewery, we can expect many of the beers to have hops in common.  
More on that in a moment.

## Unnesting the data

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
