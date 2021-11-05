---
title: Reducers and Transducers
date: 2021-11-03
description: Expanding on reducers and transducers.
---

Reducers are functions that take an accumulator and a value, and return a value.
They are often used to _reduce_ an array of multiple items to a single value, but they don't _have_ to be used that way.
In fact; a reducer can be used as a more verbose alternative to other array methods like `map` or `filter`.

For example; below I'm using `Array.reduce` for something that could be accomplished using `Array.map` using less code.

```js
const integers = ["8", "7", "6", "5", "4"].reduce(
  (acc, cur) => acc.concat(parseInt(cur)),
  []
)

integers // [8, 7, 6, 5, 4]
```

Anyone who knows ES6 will know that `Array.map` is better suited for such a task, as shown below.

```js
const integers = ["8", "7", "6", "5", "4"].map(parseInt)

integers // [8, 7, 6, 5, 4]
```

The examples above can begin to show us the difference between `map` and `reduce`.
Map provides us with a simple interface for the situations in which we need to apply a function to each element in an array, while `reduce` gives us full control over each iteration of the array traversal.

Here's another example.
Imagine that you have an array of integer and string values that you want to convert into an array of only integers.
You want to keep all of the actual numbers from the original array, but you want to remove any irrelevant non-numeric characters.
We can accomplish this simply by chaining two array methods together: `map` and `filter`.

```js
const original = [8, "7", 6, "5", 4, "", "postal_code"]

const parsed = original.map(x => parseInt(x))

parsed // [8, 7, 6, 5, 4, NaN, NaN]

const filtered = parsed.filter(Number.isFinite)

filtered // [8, 7, 6, 5, 4]
```

The approach above traverses the array twice.
First, to convert the strings to integers where possible, and then once more to filter out the `NaN` items.

Using `reduce`, however, we could do it in a single step; traversing the array only once.

```js
const parsedAndFiltered = original.reduce((acc, cur) => {
  const parsed = parseInt(cur)
  return Number.isFinite(parsed) ? acc.concat(parsed) : acc
}, [])

parsedAndFiltered // [8, 7, 6, 5, 4]
```

We're able to do this because `Array.reduce` gives us control over the data that gets sent from one iteration to the next.

```js
const ascending = [8, 7, 6, 5, 4].reduceRight((acc, cur) => acc.concat(cur), [])

ascending // [4, 5, 6, 7, 8]
```

#### How `Array.reduce` works

Imagine that the `Array.reduce` method didn't exist.
If we wanted to be able to use the `getMax` reducer, we'd need to write our own reducer function that could take an array and a reducer, and then run the reducer using the array.

```js
// Pay attention; don't confuse arr for acc
function customReduce(arr, reducer, initialValue) {
  let acc
  let i = 0

  if (initialValue === undefined) {
    acc = arr[0]
    i = 1
  }

  while (i < arr.length) {
    acc = reducer(acc, arr[i])

    i++
  }

  return acc
}
```

Below is a reducer that can be used to surface the greatest number from an array of numbers.

```js
const getMax = (acc, val) => Math.max(acc, val)
```

This is how we would use `getMax` with our `customReduce` function.

```js
// Our home-grown reduce function
const max = customReduce([1, 2, 3, 4, 5], getMax)

max // 5
```

And this is what it would look like using the standard `Array.reduce` method.

```js
// The out-of-the-box JS Array.reduce method
const max = [-8, -7, -6, -4, -5].reduce(getMax)

max // -5
```

If we wanted to make our home-grown reduce function an array method, we'd could do that by trading `arr` for `this`, shown below, and by naming it something other than `reduce`, which is already taken.

```js
Array.prototype.newReduce = function (reducer, initialValue) {
  let acc = initialValue
  let i = 0

  if (initialValue === undefined) {
    acc = this[0]
    i = 1
  }

  while (i < this.length) {
    acc = reducer(acc, this[i])

    i++
  }

  return acc
}

const max = [6, 7, 8, 9, 10].newReduce(getMax)

max // 5
```

#### Review

Now that we understand what the `Array.reduce` method is, let's look at a common method chain and see whether there's a way that we can improve upon it.

Below is a new array method chain that uses both `filter` and `reduce` to return the greatest odd number from the provided array.

```js
const isOdd = val => val % 2 == 1

const max = [12, 13, 14, 15, 16].filter(isOdd).reduce(getMax)

max // 15
```

In this case, the array is being traversed twice; once to `filter` it, and a second time to `reduce` it.
This hardly matters for such a simple example, but if we were working on a seriously large array, we might be interested in reducing the performance complexity of our array transformation.
The obvious way to do this is to combine both of these steps into one.

```js
getMaxOfOdds = function (acc, val) {
  return val % 2 == 1 ? Math.max(acc, val) : acc
}

const max = [25, 26, 22, 23, 24].reduce(getMaxOfOdds)

max // 25
```

Reduce is versatile enough to be able to combine those two steps easily.
But we now have a _less generalized_ function instead of the two generic functions that we started with.
Better would be to keep our functions as generic as possible, but be able to compose them together as needed.

<div class="call-out-indigo">

#### A quick note about function composition

Function composition is the practice of combining two or more functions into one.
Below I've created two simple functions that will either return a value, or `false`.

```js
const isEven = val => (val % 2 == 0 ? val : false)
const isPositive = val => (val >= 0 ? val : false)

isEven(-12) // -12
isPositive(-12) // false
```

Given the input `-12`, one of these functions will return `-12` while the other returns `false`.

Below, I've written a simple `compose` function that can compose these two functions together.
This is a _higher order function_ because it's a function that returns another function.

```js
function compose(f, g) {
  return x => f(g(x))
}
```

Composing these two functions together, we can determine with a single function call whether a number is both even _and_ positive.

```js
const isEvenAndPositive = compose(isEven, isPositive)

isEvenAndPositive(-12) // false
```

</div>

#### Transducers

We can apply what we know about higher-order functions and function composition to reducers.
The goal is to find a way to keep our reducers as generic as possible, while still being able to compose them together to reduce the number of times that we need to traverse the array in a given array transformation.

Consider the two reducers below, `isOdd` and `getMax`.
Both are generic, and we can chain them together, one after the other.

```js
const getOdds = (acc, val) => (val % 2 == 1 ? [...acc, val] : acc)
const getMax = (acc, val) => Math.max(acc, val)

const max = [22, 23, 24, 25, 66].reduce(getOdds, []).reduce(getMax)

max // 25
```

I'd like to be able to compose these two together, as shown below, so that I can get the greatest odd number from the array in a single traversal, as shown below.

```js
const max = [32, 33, 34, 35, 36].reduce(getOdds(getMax), [])

max // 35
```

In their current form, however, there's no way that I can perform the reduction above.
The reason is two-fold:

- `getOdds` is set-up to take an array and return an array, while `getMax` is set-up to take two values and return a single value,
- and `getOdds` isn't set-up to be composable.

Instead, I need a reducer that can take the same argument types as `getMax`, and that can also be composed wish `getMax` (or any other reducer).

```js
function isOddTransducer(fn) {
  return function (acc, val) {
    return val % 2 == 1 ? fn(acc, val) : acc
  }
}
```

The above function can also be written as shown below:

```js
const isOddTransducer = fn => (acc, val) => val % 2 == 1 ? fn(acc, val) : acc
```

> What on earth is a _transducer_?!

A transducer is just a higher-order function that is set-up to take a reducer as a parameter (`fn` above), and return another reducer that invokes the provided reducer (`fn`).

In the case of `isOddTransducer`, it's a function that can receive `getMax`, and either pass-along `val` to it, if `val` is an odd number, or not, if `val` is even.
This means that we can compose the two functions together to create a single reducer.

```js
const getMaxOfOdds = isOddTransducer(getMax)

const max = [32, 33, 34, 35, 36].reduce(getMaxOfOdds)

max // 35
```

This may seem insignificant in such a small example, but think about if you were working with an array of `length` `123456789`, and you were transforming it in several steps, as shown below.

```js
largeArray.filter().map().sort().reduce()
```

In this case, being able to perform your complex transformation in a single traversal, instead of four, would be a game-changer.

But remember; performance gains are only half of the argument in favor of learning function composition.
Being able to compose transducers and reducers together means that you can write functions that are more generic, and thus more stable and easier to test, ultimately keeping your projects lighter and more robust.
