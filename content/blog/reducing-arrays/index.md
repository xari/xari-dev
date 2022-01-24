---
title: Reducing Arrays
date: 2021-12-12
description: Replacing flatmap(), map(), and filter() with a single reduce().
---

<div class="call-out-indigo">

This post is part of a series on data wrangling and visualisation with JavaScript.
The content in this post is rather advanced, so it will help if you're already familliar with JavaScript's `reduce()` method.

You can find the other posts in the series at the links below.

- [Intro — Data Visualisation with Functional JavaScript](../data-wrangling-with-js)
- [Intro to D3](../intro-to-d3)
- [Binding Data with D3](../binding-data-d3)
- [D3 Scales](../d3-scales)
- [Horizontal Bar Plot with D3](../horizontal-bar-plot)
- [Higher Order Functions](../higher-order-functions)
- [Reducers and Transducers](../reducing-arrays)

</div>

In the previous post in this series, we unnested and filtered an array of hop names from an array of beers that use these hops.
The code below uses a higher-order function to return a filter predicate with a _closure_, which is just a fancy way to describe the way that the filter call has access to the `uniqueSet` state.

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

This pipeline uses standard array methods, and the `filter()` predicate is already very generic.
The time complexity is a linear **O(n)**.
This is already more than good enough to handle the relatively small `beers` array.
The only real drawback that I can see is that some developers might not appreciate the overhead of the higher-order function.

So why might we consider improving on what we already have?

In reality, the true time complexity is **O(3n)**, because the method chain traverses the array three times.
Big-O notation doesn't make this nuanced distinction, and just considers **O(3n)** to be **O(n)**.  
But if we found a way to combine the `flatMap()`, `map()`, and `filter()`, we could reduce the real time complexity by a factor of three.

Better still; there might be a way to make that higher-order function a little more readable and maintainable.

Here's a tip:

> When you're working with nested data, a nested reducer can surface that data with a true time complexity of **0(n)** —no matter how deeply nested that data may be!

To illustrate what I mean, take a look at the mess of code below.
In it, you'll see an inner-reducer nested inside of an outer-reducer.
Pay attention to the `defaultValue` argument that is given to each reducer (that's the _second_ argument).

```js
const hopsSet = new Set()

const hops = beers.reduce((outerAcc, cur) => {
  return cur.ingredients.hops.reduce((innerAcc, { name }) => {
    return hopsSet.has(name)
      ? innerAcc
      : hopsSet.add(name) && innerAcc.concat(name) // Add name to hopsSet AND concat it to the accumulator
  }, outerAcc)
}, [])
```

The outer-reducer receives `[]` as it's `defaultValue`.
It then passes-on this `[]` (`outerAcc`) to the inner-reducer as it's `defaultValue`.
`outerAcc` and `innerAcc` are thus the same; meaning that the outer-reducer and the inner-reducer are shaing a common accumulator.

The outer-reducer is iterating every beer in `beers`, while the inner-reducer is iterating every hop in each beer.
This code looks terrible though, so let's clean it up before we judge it. We'll start by breaking-out the inner-reducer into it's own function.

The inner-reducer is doing the work that `filter()` was doing in the earlier `flatMap()`/`map()`/`filter()` version of our pipeline.
This new function is similar to `keepUnique()` from earlier.
But where it differs is that it returns a reducer, instead of a filter predicate.

```js
const keepUnique = property => {
  const uniqueSet = new Set()

  return (acc, cur) => {
    const value = cur[property]

    return uniqueSet.has(value)
      ? acc
      : uniqueSet.add(value) && acc.concat(value)
  }
}
```

Calling `keepUnique("name")` will return the inner-reducer that we'll feed to the outer-reducer.

```js
const keepUniqueName = keepUnique("name")

const hops = beers.reduce((acc, cur) => {
  return cur.ingredients.hops.reduce(keepUniqueName, acc)
}, [])
```

This single run-through of the `beers` array replaces the chained calls to `flatMap()`, `map()` and `filter()` —each of which was iterating the entire array.

![Cartman](https://memegenerator.net/img/instances/75685855.jpg)

Not only does this pattern reduce the true time complexity from **0(3n)** to **O(n)**, but arguably it simplifies the code by relying on a single array method, instead of three different ones.

We also get a generic `keepUnique()` function out of it, which we can use anywhere we need to reduce non-unique items out of an array.
For example, if we needed a reducer that targets any of the other hop properties, we would simply call `keepUnique()` with the name of the property that we want to target.

```js
const keepUniqueAmount = keepUnique("amount")
```

While obviously this pattern isn't without the mental overhead of understanding higher-order functions, and having a solid grasp of `reduce()`, the upside is reduced time complexity, and potentially a radical reduction in the size of our codebase.

---

Now that we're familliar with the Punk API data, the [next post](../intro-to-d3) in this series will introduce D3.js which we'll later use to make some insightful plots using this data.
