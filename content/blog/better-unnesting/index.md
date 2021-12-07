---
title: Better array unnesting in JavaScript
date: 2021-12-06
description: Supercharging reduce for unnesting data from complex objects.
---

> TLDR: scroll to the bottom see how closure, currying, and a double-reduce can be used to radically improve performance when unnesting arrays.

Data wrangling can be one of the most rewarding tasks in programming.
I'm constantly searching for ways to make my data pipelines cleaner and faster, and in this post I outline a technique that I'm developing for simultaniously unnesting and reducing data.
In short; I'll be reducing an array of 325 objects into an array of 166 _unique_ strings.

This is a long post.
I'm going to first show the step-by-step process of surfacing and unnesting the data, and afterward I'll dig into some techniques I'm using to refining those transformations.

## A dataset of 325 beers!

Have a look at the data.
I requested this data from the [Punk API](https://punkapi.com/), stored it in a variable called `beers` because each object represents a beer brewed by the Brewdog Brewery in Scotland.

```js
beers // Array(325) [{…}, {…}, {…}, {…}, {…}, …]
```

As you can see; this array contains 325 beers.
I want to compile an array of all hops used by Brewdog.
To do that, I'll need to surface the hops data from each beer object.
We can see the first beer below.
There's a lot to it, but what I'm looking for is nested deep-down under `.ingredients.hops`.

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

Surfacing the hops from their nested arrays can be simply achieved by a couple of `map` calls.
I'm only interested in the `name` of each hop, so I won't be keeping the other three properties.

```js
const hops = beers.map(x => x.ingredients.hops) // Surface the hops object
```

A single `map` call can bring the `ingredients.hops` data to the surface.

```js
hops // Array(325) [Array(5), Array(4), Array(1), Array(6), Array(3), …]
```

This leaves us with an array of nested arrays.
The length is still `325`, meaning I've surfaced a single array from each of the beer objects.
Notice in the preview above that the nested arrays contain one or more objects.  
We can expect from this that when we unnest those arrays, the `length` of `hops` will be far greater than `325`.

The simplist way to unnest the nested arrays is to use `flatMap` instead of `map`.
`flatMap` works like `map`, except that it flattens the result by one level.
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

I'm only interested in the `name` property, so I'm going to tack-on a second `map` call to bring those to the surface.

```js
const hops = beers.flatMap(x => x.ingredients.hops).map(x => x.name)
```

The combined `flatMap` and `map` calls returns an array of all hop strings.

```js
hops // Array(1817) ["Fuggles", "First Gold", "Cascade", "Amarillo", "Simcoe", …]
```

The data is now in the right shape, but there are duplicate records in it that need to be removed.

## Removing the duplicates

`filter` is the perfect method for removing items that we don't want in our array.

```js
const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter((x, i, arr) => arr.indexOf(x) == i) // Remove the duplicates.
```

The filter predicate above uses `Array.prototype.indexOf()` to check whether a hop name already exists in the array.

```js
hops // Array(166) ["Fuggles", "First Gold", "Cascade", "Amarillo", "Simcoe", …]
```

Success!
The array now contains 166 _unique_ hop names.

## Checking the performance

Let's check the time complexity of this pipeline.
It uses `flatMap`, then `map`, followed by `filter`.
This would be **O(3)**, were it not using `Array.prototype.indexOf()` for the filter predicate.
Because `indexOf()` is also iterating through the array, it brings the time complexity of the pipeline up to **O(3<sup>2</sup>)**.

Let's see if there are some low-hanging fruit that I can quickly pick.

## Optimizing the performance

A StackOverflow search for more efficient ways to remove duplicate items turned-up [this gem of an answer](https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array).
Following it's advice, I'm going to switch-out `indexOf()` for a hash-table-based solution.

`hopsHash` is initalized as an empty object, and each iteration of `filter` adds a new property to it, unless that property already exists.
I also removed the third argument to `filter`, since we're no longer using it.

```js
const hopsHash = {}

const hops = beers
  .flatMap(x => x.ingredients.hops)
  .map(x => x.name)
  .filter((x, i) =>
    hopsHash.hasOwnProperty(x) ? false : (hopsHash[item] = true)
  )
```

The result here is the same, but it brings our time complexity down to **O(3)** because the filter predicate no longer iterates through the array.

![South Park](https://i.imgur.com/6K1tEDW.jpg)

But is there a way it can be even better?
Of course there is!
Enter, `reduce()`.

<div class="call-out-indigo">

## Supercharged optimization using `reduce()`

A few months ago, I started nesting `reduce()` calls inside of `reduce()` calls.
When you need to reduce _multiple arrays into one_, you can nest a reducer inside of another reducer.
Have a look at the reducers below, and pay attention to the relationship between the accumulators `outerAcc` and `innerAcc`.

```js
const hopsHash = {}

const hops = beers.reduce((outerAcc, cur) => {
  return cur.ingredients.hops.reduce((innerAcc, { name }) => {
    return hopsHash.hasOwnProperty(name)
      ? innerAcc
      : (hopsHash[name] = true) && innerAcc.concat(name)
  }, outerAcc)
}, [])
```

**The `initialValue` of the outer reducer is an empty array (`[]`).
This same empty array is also the `initialValue` of the inner reducer.
This means that both reducers are sharing a common accumulator.**
This replaces the `flatMap`, `map` and `filter` steps with a array iteration, bringing the time complexity of the transformation down to **O(1)**.

![Friday](https://memegenerator.net/img/instances/58297502.jpg)

</div>

## Closure and the higher-order reducer

When I finally figured out the solution above, I didn't think this data transformation could get any wilder.
Boy, did I not see what was coming next.

To begin with, I'm going to break-out the inner reducer into it's own function.

```js
const keepUniqueHops = (acc, { name }) => {
  const hopsHash = {}

  return hopsHash.hasOwnProperty(name)
    ? acc
    : (hopsHash[name] = true) && acc.concat(name)
}
```

Nothing radical there, but it at least improves the overall readability of the pipeline because it gives me a simple function reference (`keepUniqueHops`) that I can pass to the outer reducer.
Since `hopsHash` is only used by the inner reducer, I also took it out of the outer context and nested it inside of `keepUniqueHops`.

```js
const hops = beers.reduce((acc, cur) => {
  return cur.ingredients.hops.reduce(keepUniqueHops, acc)
}, [])
```

This is already pretty clean, but `keepUniqueHops` is a specific function, rather than a generic one that I could use over and over again in my codebase.
It accepts an `ingredients.hops` object, and it extracts and returns the `name` property from it.
But a generic function would be able to extract and return any property from any object....

I've been learning a lot about functional programming lately, and one common practice is to use currying to turn multi-argument functions into single argument functions.
For example, we can write a higher-order function that returns the inner reducer.

The `keepUnique()` function below will generate a reducer using whatever property name is passed to it.

```js
const keepUnique = property => {
  const uniqueHash = {}

  return (acc, cur) => {
    const value = cur[property]

    return uniqueHash.hasOwnProperty(value)
      ? acc
      : (uniqueHash[value] = true) && acc.concat(value)
  }
}
```

How does this work?
Calling `keepUnique("name")` will return the inner reducer that we'll feed to the outer reducer.

```js
const hops = beers.reduce((acc, cur) => {
  const keepUniqueHops = keepUnique("name")

  return cur.ingredients.hops.reduce(keepUniqueHops, acc)
}, [])
```

Not only does this pattern keep the pipeline **O(1)**, but it also creates a `keepUnique()` function that can be used over and over again throughout the codebase.
