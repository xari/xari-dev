---
title: Mastering reduce()
date: 2021-10-12
description: Grokking the most versitile Array method.
---

I recently created my own unit test runner from scratch.
I had been working on my algorhithm skills for an interview, and I wanted to create a simple test suite where I could test different approaches to the same problem, using several different input values.

The problem was to find the first positive integer that doesn't occur in an array of values (`A`).
Below you can see one of the functions that I wrote to solve this problem.

```js
export function find_missing_int_forEach(A) {
  let x = 1

  A.filter(n => n > 0)
    .sort((a, b) => a - b)
    .forEach(n => {
      if (x < n) {
        return x
      }
      x = n + 1
    })

  return x
}
```

There are four other solutions that I wrote,`find_missing_int_reduce`, `find_missing_int_reduce_with_eject`, `find_missing_int_for`, and `find_missing_int_for_of`, and all five of these solutions I stored in an array called `find_missing_int`.
Each of these functions must be able to accept an array of `[-100000, ..., 100000]`, and return an integer.

Here's what my test input values look like.
Notice that `find_missing_int` is given as a property; this is done to keep this testing suite as generic as possible, so that I can continue to use it in my continued algorhithm practice.

```js
const testCases = [
  {
    input: [1, 3, 6, 4, 1, 2],
    assert: 5,
    run: find_missing_int,
  },
  {
    input: [1, 2, 3],
    assert: 4,
    run: find_missing_int,
  },
  {
    input: [0, 3, 5],
    assert: 1,
    run: find_missing_int,
  },
  {
    input: [-1, -3],
    assert: 1,
    run: find_missing_int,
  },
  {
    input: [8, -1, 7],
    assert: 1,
    run: find_missing_int,
  },
  {
    // A bigger array, starting at 20.
    input: Array.from({ length: 1000 }, (_, i) => i + 20),
    assert: 1,
    run: find_missing_int,
  },
]
```

An `expect()` function can run a provided function, and check it's return against a provided assertion.
`expect()` will return either `true`, if the assertion matches, or the returned value, if it doesn't.

```js
const expect = (fn, assert, ...inputs) => {
  const result = fn(...inputs)

  return result === assert ? true : result
}
```

To re-cap, there are 6 test cases in the `testCases` array.
Each of these is being used to test the 5 functions in the `find_missing_int` array.
That's a total of 30 unique test cases that will be run.

Like any good test suite, I wanted mine to tell me which tests passed, which failed, and the circumstances in which the failing ones failed.

Before we get into the business of reducing the test outcomes to an easy-to read output, we'll first need to run the tests.
Remember that the `find_missing_int` array of functions to test is nested inside of each `testCase`.
I've written a function, `test()`, which will accept each test case, and map each to a call to `expect()`.

```js
const test = ({ fn, assert, input }) =>
  fn.map(x => ({
    name: x.name,
    input: input,
    expected: assert,
    result: expect(x, assert, input),
  }))
```

```js
let results = testCases.map(test)
```

```json
[
  [
    {
      "name": "find_missing_int_reduce",
      "input": [Array],
      "expected": 5,
      "result": true
    },
    {
      "name": "find_missing_int_reduce_with_eject",
      "input": [Array],
      "expected": 5,
      "result": true
    },
    {
      "name": "find_missing_int_forEach",
      "input": [Array],
      "expected": 5,
      "result": true
    }
    // ...
  ]
  // ...
]
```

> Hold-on!
> An array of arrays?
> That's not what we want.

Given this nested structure, a better approach would be to use the `flatMap()` array method which will flatten the nested response.
This way, we'll be left with a single array of `length` 30, rather than 6 arrays, each of `length` 5.

```js
let results = unitTestCases.flatMap(test)
```

```json
[
  {
    "name": "find_missing_int_reduce",
    "input": [1, 3, 6, 4, 1, 2],
    "expected": 5,
    "result": true
  },
  {
    "name": "find_missing_int_reduce_with_eject",
    "input": [1, 3, 6, 4, 1, 2],
    "expected": 5,
    "result": true
  },
  {
    "name": "find_missing_int_forEach",
    "input": [1, 3, 6, 4, 1, 2],
    "expected": 5,
    "result": true
  }
  // ...
]
```

> Nice... Much better.

So far we have the data that we need, and now the time has come to output it in the console in a presentable way.
Obviously, this could be done by simply using a `for()` loop to go through the list of all 30 tested cases.

```
All clear for find_missing_int_reduce 		 [1, 3, 6, 4, 1, 2]
All clear for find_missing_int_reduce_with_eject [1, 3, 6, 4, 1, 2]
All clear for find_missing_int_forEach 		 [1, 3, 6, 4, 1, 2]
All clear for find_missing_int_for 		 [1, 3, 6, 4, 1, 2]
All clear for find_missing_int_for_of 		 [1, 3, 6, 4, 1, 2]
All clear for find_missing_int_reduce		 [1, 2, 3]
All clear for find_missing_int_reduce_with_eject [1, 2, 3]
All clear for find_missing_int_forEach		 [1, 2, 3]
All clear for find_missing_int_for 		 [1, 2, 3]
All clear for find_missing_int_for_of		 [1, 2, 3]
...
```

But in reality, a test suite could contain far more test cases than this example, and over-communicating the results isn't very useful when what we're actually interested in is the specific cases in which a test failed.
I'd rather see a final output like the one below, which shows first the functions that passed every test case, followed by a list of the specific cases in which a test failed for a given function.

```
All clear for find_missing_int_reduce
All clear for find_missing_int_reduce_with_eject
All clear for find_missing_int_for
All clear for find_missing_int_for_of
Something isn't right with find_missing_int_forEach.
 It failed under the following conditions:
 When testing with 0,3,5, expected 1, but returned 4,
 When testing with -1,-3, expected 1, but returned 8,
 When testing with 8,-1,7, expected 1, but returned 9
```

Looking at the output above, we know instantly that all functions work as intended, except for one, `find_missing_int_forEach`, which failed under 3 circumstances.

The first step in this direction is transforming our array of 30 test results into an object containing those that `pass` and those that `fail`.

```json
{
  "pass": [
    { "name": "find_missing_int_reduce" },
    { "name": "find_missing_int_reduce_with_eject" },
    { "name": "find_missing_int_for" },
    { "name": "find_missing_int_for_of" }
  ],
  "fail": [{ "name": "find_missing_int_forEach", "details": [Array] }]
}
```

There are two main things that are happening in this transformation.
The first is that the structure of the data is changing from an array to an object.
The second is that the array had `length` of 30, while the new object contains only 2 properties.
To achieve this in a functional and efficient manner, we'll turn to `reduce()`.

The function below is a reducer that will return the object above by iteratively checking each object in the array that we're reducing, and putting it into either a `pass` array or a `fail` array, depending on the value of `result`.
We're using this function to _reduce_ each of the 6 test cases for each function into a single object.
This means that that the `length` of the resulting object's `pass` and `fail` arrays will _always_ add up to the number of functions that are being tested by the suite (5, in this case).

```js
const reduceResults = (acc, { name, result, ...rest }) => {
  const existingPass = acc.pass.findIndex(testCase => testCase.name === name)
  const existingFail = acc.fail.findIndex(testCase => testCase.name === name)

  // true == the test passed
  if (result === true && existingFail === -1) {
    existingPass !== -1
      ? acc.pass.splice(existingPass, 1, { name })
      : acc.pass.push({ name })
  } else {
    if (existingPass !== -1) acc.pass.splice(existingPass, 1)

    existingFail !== -1
      ? acc.fail.splice(existingFail, 1, {
          name,
          details: [...acc.fail[existingFail].details, { result, ...rest }],
        })
      : acc.fail.push({ name, details: [{ result, ...rest }] })
  }

  return acc
}
```

> Note: If you have any suggestions about how I can clean this function up and make it more functional, let me know.

There's also a bit of additional logic which is used to modify the accumulator (`acc`) based on new information.
What I mean by this is that a function may already be in the `pass` array because it passed the first few tests.
But if fails under a subsequent test case, then any reference to it should be removed from the `pass` array, because it is no longer considered a pass.

Reducing the results array to the new structure is now as easy as the call below.
Notice that with the second argument, we're actually specifying the structure that we want the reducer to return.
This argument is the `initialValue` of our accumulator.

```js
results = results.reduce(reduceResults, {
  pass: [],
  fail: [],
})
```

We can use this data however we want, but in my case, I've decided to chain-up a `forEach()` to the `pass` and the `fail`.

```js
results.pass.forEach(({ name }) =>
  console.log(chalk.green(`All clear for ${name}`))
)
```

I've also implemented some functions from the `chalk` library for adding some style to the output.

```js
results.fail.forEach(({ name, details }) => {
  console.error(
    `Something isn't right with ${chalk.blue.bgWhite.bold(name)}.`,
    `\n It failed under the following conditions:`,
    chalk.red(
      details.map(
        ({ input, expected, result }) =>
          `\n When testing with ${chalk.cyan.bgWhite(
            input
          )}, expected ${chalk.green.bgWhite(
            expected
          )}, but returned ${chalk.red.bgWhite(result)}`
      )
    )
  )
})
```

---

`reduce()` can help us to transform the structure and the length of our data in a single customizable and fast step.
It can be used as more customizable alternative to `filter()` or `map()`, but it's real power is in the way that it enables us to modify the structure of our data.
_Reducing_ many inputs into a single, new output.
