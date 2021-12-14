---
title: JS Data Recipies Pt II — Reducing Arrays
date: 2021-12-12
description: Replacing flatmap(), map(), and filter() with a single reduce().
---

## Further optimization with `reduce()`

The real question is _why_ we might want to further improve on what's already there.
The current pipeline already uses standard array methods, and the `filter()` predicate is already very generic.
The time complexity is a linear **O(n)**.
This is already more than good enough to handle the relatively small `beers` array.

In reality though, the real time complexity is **O(3n)**, because the method chain traverses the array three times.
Big-O notation doesn't make this kind of nuanced distinction, and just considers **O(3n)** to be **O(n)**.  
But if we found a way to combine the `flatMap()`, `map()`, and `filter()`, we could reduce the real time complexity by a factor of three.
Better yet; it might even make our codebase _more_ readable and maintainable.

A few months ago, I started nesting `reduce()` calls inside of `reduce()` calls.
When you need to reduce _multiple arrays into one_, you can nest a reducer inside of another reducer.
Have a look at the reducers below, and pay attention to the relationship between the accumulators `outerAcc` and `innerAcc`.

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

What you're looking at is an inner-reducer nested inside of an outer-reducer.
The outer-reducer is running on the `beers` array, while the inner-reducer is running on the `ingredients.hops` array of each beer object.

Let's break out the inner-reducer into it's own function.
This inner-reducer is doing the work that `filter()` was previously doing.
This function is similar to the earlier `keepUnique()` function, but it returns a reducer, instead of a filter predicate.

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

Calling `keepUnique("name")` will return the inner reducer that we'll feed to the outer reducer.

**Notice that both of these reducers share a common accumulator.**
The outer reducer is given the `initialValue` of `[]`, and it passes this value along to the inner reducer.

```js
const keepUniqueHops = keepUnique("name")

const hops = beers.reduce((acc, cur) => {
  return cur.ingredients.hops.reduce(keepUniqueHops, acc)
}, [])
```

This single iteration of the `beers` array replaces the calls to `flatMap()`, `map()` and `filter()` because the outer-reducer just returns whatever the inner-reducer returns, and the inner reducer is only concatenating new hop names to the accumulator if they don't already exist in `uniqueHash`.

![Cartman](https://memegenerator.net/img/instances/75685855.jpg)

Not only does this pattern keep the pipeline **O(n)**, it reduces the space complexity and number of times the array is iterated by a factor of three, because it only runs a single array method on `beers` (`reduce()`), instead of three (`flatMap()`, `map()`, `filter()`).

#### Transducers

Time complexity is only one way to measure good code, and some developers might judge the kind of marginal time complexity that we just saved as not worth the added _transducer_ function (`keepUnique()`).
But, if you can wrap your head around `reduce()` and higher-order functions, that's really all you need to know to unlock this powerful pattern.

"Transducer" is just a fancy name for a function that returns a reducer.
The benefit of transducers is that they can be used to dynamically generate reducers, as we've just seen.
In the example above, we created the `keepUniqueHops()` reducer using the `keepUnique()` transducer because we wanted a reducer that could pull the `"name"` property out of many objects and remove any duplicate values.
But we could also use `keepUnique()` to create a reducer for any other property as well.

Here's that hop object from earlier.

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

If we needed a reducer that targets any of the other properties, we would simply call `keepUnique()` with the name of the property that we want to target.

```js
const keepUniqueAmount = keepUnique("amount")
const keepUniqueAdd = keepUnique("add")
const keepUniqueAttribute = keepUnique("attribute")
```
