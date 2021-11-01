---
title: Transducers
date: 2021-10-27
description: I heard you like reducers... How about we write some transducers for your reducers, so you can reduce while you reduce.
---

> Search for JavaScript transducer</br>
> And be blown away

This was the message that I received from my friend Xavier that kicked-off several days of brain-racking and mental gymnastics that finally allowed me to transform the core of my home-grown test runner from a [previous post](https://xari.dev/reduce/).

Learning how to implement transducers helped me to increase the overall performance of my test-runner by reducing the number of links in my array method chain.
I'll explore the test-runner refactor toward the end of this post, but to show you quickly what we're working toward...
Using a transducer allowed me to reduce the overall performance complexity of my test runner by removing one stage in the method chain below.

```js
// Old way
const results = testCases.flatMap(test).reduce(resultsReducer, []),
)

// New way
const results = testCases.reduce(
  getResultsTransducer(condenseResultsReducer),
  []
)
```

Sure; it may look on the surface that what I've achieved here is actually more complex, but in this post I'll break down why I believe this to be a superior pattern, and why it might be worthwhile for you to also invest the time to learn how to use _transducers_ in your code.

What's a transducer?
In short, a transducer is a function that takes a reducer, and returns a reducer.
We can think of it like a higher-order reducer, for those of us familiar with higher-order functions.
These functions allow us to write complex reductions using multiple functions, rather than cramming everything into a single reducer function, and they also give us the benefits of currying.
More on that in a bit.

How do we make a transducer?
That's simple; just wrap a reducer in a bit of extra scaffolding, and any reducer can be a transducer.
Have a look below:

```js
// This reducer
const getMaxReducer = (a, b) => Math.max(a, b)

// becomes a transducer...
const getMaxTransducer = nextReducer => (a, b) => nextReducer(a, Math.max(a, b))
```

Notice that the only thing that changed above (apart from the variable name) is that the function now returns a function, which calls the function that was given as the argument to `getMaxTransducer`.
In this case, `nextReducer` —whatever it may be, will receive the same accumulator value as `getMaxTransducer`, but it's current value (the second argument of any reducer) will be the max of `a` and `b`.

Method chaining with JavaScript arrays offers a nice interface for developers to transform arrays in easy to follow steps.
For example, using the `getMaxReducer` function above, we could create a method chain to reduce an array into its max value.

```js
const max = [127, 33, 1, 2, 3, 4, 8, 9, -22, "hmmm."].reduce(getMaxReducer) // NaN
```

> `NaN`? Whoops....

That's right; as soon as there's something in our array that doesn't compute with `Math.max`, our reducer breaks down.
Thanks to ES6 though, we can take care of this problem by adding a quick `filter` call to our method chain.

```js
const max = [127, 33, 1, 2, 3, 4, 8, 9, -22, "hmmm."]
  .filter(Number.isFinite)
  .reduce(getMaxReducer) // 127
```

> Much better.

Still; we're now traversing our array twice —once to `filter`, and then a second time to `reduce`.
This doesn't matter much for such a small array, but it's important to consider this problem at scale —particularly if we work in a data-heavy domain.

We could optimize this by modifying our `getMaxReducer` function to check that the current value is always a number before performing the calculation...

```js
const getMaxOfNumReducer = (a, b) => (Number.isFinite(b) ? Math.max(a, b) : a)
```

This reducer will check that `b` is a finite number, either use it to calculate the max if it is, or simply return the accumulator if it isn't.

```js
const max = [127, 33, 1, 2, 3, 4, 8, 9, -22, "hmmm."].reduce(getMaxOfNumReducer) // 127
```

This solves the problem of traversing the array twice, but it creates a new one; we've now created a reducer that is less generic than our original one.
Since finding the max value of an array is a common problem, we'll still probably need to keep the original reducer in our codebase, along with the new one that we made for the specific case of reducing an array with numeric and non-numeric values.

This may not seem like a problem to some, but as developers I'd argue that a critical part of our job is to keep our codebase something that we enjoy maintaining.
Something that managers would do well to appreciate the importance of, if they hope to retain their best developers in the long-run.

Let's examine this problem in light of the all-mighty transducer.
We're going to write a transducer that can do the finite number check, and be composed with our `getMaxReducer`, allowing us to get what we want in a programmatically generic way, out of a single `reduce()` call.

```js
const getMaxReducer = (a, b) => Math.max(a, b)

const isNumTransducer = nextReducer => (a, b) =>
  Number.isFinite(b) ? nextReducer(a, b) : a
```

Remember that a transducer is a function that takes a reducer, and returns a reducer.
isNumTransducer can receive `getMaxTransducer` as an argument, and will pass along the accumulator and the current value to it, as long as the current value is a finite number.

```js
const max = [127, 33, 1, 2, 3, 4, 8, 9, -22, "hmmm."].reduce(
  isNumTransducer(getMaxReducer)
) // 127
```

> How do you like them apples?

Without modifying our original `getMaxReducer` function, we've been able to filter out any non-number values without any added method chains at all!
We simply composed our reducer with a transducer to get what we needed out of the array in a single call to `reduce`.

We could even write a composer function that could make this a little easier to follow:

```js
const compose = (a, b) => a(b)

const getMaxNumReducer = compose(isNumTransducer, getMaxReducer)

const max = [127, 33, 1, 2, 3, 4, 8, 9, -22, "hmmm."].reduce(getMaxNumReducer) // 127
```

And if you're already using a more optimized `compose` function from Ramda or another library, you can compose transducers to your heart's content!
This can really come in handy when performing more complex reductions as imagined in the example below:

```js
const getMaxOfEvenNumsReducer = compose(
  isNumTransducer,
  isPositiveTransducer,
  isEvenTransducer,
  getMaxReducer
)
```

Of course; we're trading some of the saved complexity for a new complexity of higher-order functions in our codebase, but at the very least it allows us to keep our functions simple and easily testable and maintainable.

---

At the beginning of this post I mentioned that I refactored my test-runner to use this pattern, and I'd like to briefly examine it here because I think that it always helps to see a more applied example when learning a new pattern.

```js
const results = testCases.reduce(
  getResultsTransducer(condenseResultsReducer),
  []
)
```

In the code above, I reduce a [series of test cases](https://github.com/xari/perf-eval/blob/1a1ec10b832de90efbb2dd7032da69c327703b0a/solutions.test.js#L76) into an array that contains an object that represents each tested function, and the cases in which it passed or failed a test.

In other words, it reduces an array of test cases, previewed below,

```js
const testCases = [
  {
    fn: find_missing_int, // [find_missing_int_reduce, find_missing_int_reduce, ...]
    assert: 5,
    input: [1, 3, 6, 4, 1, 2],
  },
  {
    fn: find_missing_int,
    assert: 4,
    input: [1, 2, 3],
  },
  // ...
]
```

—to a smaller array that represents the results of each tested function.

```json
[
  {
    "name": "find_missing_int_reduce",
    "pass": true,
    "results": [[Object], [Object]]
  },
  {
    "name": "find_missing_int_reduce_with_eject",
    "pass": true,
    "results": [[Object], [Object]]
  }
  // ...
]
```

This test runner has to test each `input` against each `assert`, for every function in the `find_missing_int` array of functions, or whatever functions are provided (`fn` above).
It then needs to take these results and reduce them into an object for each tested function, that will tell us whether it is a `pass` or `fail`, and the input and result of each assertion.

To achieve this, I created a `getResultsTransducer`, which will run each test, and pass along the results to `condenseResultsReducer`, which will reduce the results into the format described above.

```js
const getResultsTransducer = nextReducer => (acc, cur) => {
  const { fn, assert, input } = cur

  const results = fn.map(x => {
    const result = x(input) === assert ? true : x(input)
    const pass = result === true ? true : false

    return {
      name: x.name,
      pass,
      results: [
        {
          assert,
          input,
          result,
        },
      ],
    }
  })

  // Always consider what the next reducer should exepct as a current value.
  // Very important! Remember to pass-on the accumulator as well!
  return nextReducer(acc, results)
}
```

`condenseResultsReducer` will take each result provided by `getResultsTransducer`, and `splice` them into the accumulated, condensed results, as shown below.

```js
const condenseResultsReducer = (acc, cur) => {
  // set intialValue to the accumulator
  const condencedResults = cur.reduce((x, y) => {
    const { name, pass, results } = y
    const existing = acc.findIndex(x => x.name === name)

    return existing !== -1
      ? [
          ...x.slice(0, existing),
          Object.assign(x[existing], {
            results: x[existing].results.concat(results),
          }),
          ...x.slice(existing + 1),
        ]
      : x.concat({ name, pass, results })
  }, acc)

  return condencedResults
}
```

Already we're beginning to see the performance benefit of composing transducers and reducers as we apply this pattern to real-world problems like the one above.

---

Finally; each of the functions that we've looked at in this post uses one of two function signatures.
For reducers, it's just the standard reducer signature, and for transducers, it's a function that takes a reducer and return a reducer.
This kind of standardisation keeps our functions composable and easy to test and maintain.

Transducers can keep our codebases nimble, and our test-coverage simple.
All of that on top of the potentially huge performance gains when transforming large amounts of data.
