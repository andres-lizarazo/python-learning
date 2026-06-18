import type { Module } from "../../types/lesson";

// Core standard-library modules — now a "deep" module.
export const libraries: Module = {
  id: "libraries",
  title: "Core Libraries",
  blurb: "collections, itertools, datetime, math/statistics, functools — batteries included.",
  level: "Beginner",
  icon: "📦",
  status: "deep",
  lessons: [
    {
      id: "collections-itertools",
      title: "collections & itertools",
      summary: "Counter, defaultdict, deque, and lazy iterators.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `# collections & itertools

The standard library has powerful tools that save you from reinventing wheels.

- \`Counter\` — count hashable items instantly
- \`defaultdict\` — dicts with default values
- \`deque\` — O(1) appends/pops at both ends
- \`itertools\` — \`chain, groupby, combinations, accumulate\`, …`,
        },
        {
          kind: "runnable",
          title: "Counter & defaultdict",
          code: `from collections import Counter, defaultdict

words = "the cat the dog the bird".split()
print(Counter(words))
print(Counter(words).most_common(1))

groups = defaultdict(list)
for w in words:
    groups[len(w)].append(w)
print(dict(groups))`,
        },
        {
          kind: "runnable",
          title: "itertools",
          code: `from itertools import accumulate, combinations, chain

print(list(accumulate([1, 2, 3, 4])))        # running totals
print(list(combinations([1, 2, 3], 2)))      # pairs
print(list(chain([1, 2], [3, 4])))           # flatten`,
        },
        {
          kind: "challenge",
          title: "Most common element",
          prompt:
            "Return the single most common element in `items` (any winner is fine on ties). Hint: `collections.Counter`.",
          starterCode: `from collections import Counter

def most_common(items):
    pass`,
          tests: [
            { name: "basic", assertion: "assert most_common([1,1,2,3]) == 1" },
            { name: "strings", assertion: "assert most_common(['a','b','b']) == 'b'" },
            { name: "single", assertion: "assert most_common([7]) == 7", hidden: true },
          ],
          solution: `from collections import Counter

def most_common(items):
    return Counter(items).most_common(1)[0][0]`,
          xp: 50,
        },
      ],
    },
    {
      id: "datetime-random-json",
      title: "datetime, random & json",
      summary: "Dates, randomness, and (de)serialization.",
      minutes: 8,
      blocks: [
        {
          kind: "runnable",
          title: "datetime",
          code: `from datetime import datetime, timedelta

now = datetime(2026, 6, 17, 9, 30)
print(now.strftime("%Y-%m-%d %H:%M"))
print((now + timedelta(days=30)).date())`,
        },
        {
          kind: "runnable",
          title: "random & json",
          code: `import random, json
random.seed(42)
print(random.randint(1, 100))
print(random.sample(range(10), 3))

data = {"name": "Ada", "skills": ["python", "ml"]}
text = json.dumps(data)
print(text)
print(json.loads(text)["skills"])`,
        },
      ],
    },
    {
      id: "math-statistics",
      title: "math & statistics",
      summary: "Common math functions and descriptive statistics.",
      minutes: 9,
      blocks: [
        {
          kind: "prose",
          markdown: `# math & statistics

The \`math\` module has constants and functions; \`statistics\` covers descriptive stats
without needing NumPy.

\`\`\`python
import math
math.sqrt(16)     # 4.0
math.gcd(12, 18)  # 6
math.factorial(5) # 120
math.pi, math.e

import statistics as st
st.mean([1, 2, 3, 4])    # 2.5
st.median([1, 2, 3, 4])  # 2.5
st.stdev([1, 2, 3, 4])   # sample std dev
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Try them",
          code: `import math, statistics as st

print("sqrt(16)  =", math.sqrt(16))
print("gcd(12,18)=", math.gcd(12, 18))
print("hypot 3,4 =", math.hypot(3, 4))

data = [4, 8, 15, 16, 23, 42]
print("mean   =", st.mean(data))
print("median =", st.median(data))
print("pstdev =", round(st.pstdev(data), 2))`,
        },
        {
          kind: "challenge",
          title: "Mean & median",
          prompt:
            "Return a tuple `(mean, median)` of the numbers in `nums` using the `statistics` module.",
          starterCode: `import statistics as st

def summary(nums):
    pass`,
          tests: [
            { name: "even count", assertion: "assert summary([1,2,3,4]) == (2.5, 2.5)" },
            { name: "odd count", assertion: "assert summary([1,2,3,4,10]) == (4, 3)" },
            { name: "single", assertion: "assert summary([7]) == (7, 7)", hidden: true },
          ],
          solution: `import statistics as st

def summary(nums):
    return (st.mean(nums), st.median(nums))`,
          xp: 50,
        },
      ],
    },
    {
      id: "functools",
      title: "functools",
      summary: "reduce, lru_cache, and partial.",
      minutes: 9,
      blocks: [
        {
          kind: "prose",
          markdown: `# functools

- \`reduce(fn, iterable, initial)\` — fold a sequence into one value.
- \`@lru_cache\` — memoize a function automatically (great for recursion/DP).
- \`partial(fn, *args)\` — pre-fill some arguments.

\`\`\`python
from functools import reduce, lru_cache, partial

reduce(lambda a, b: a * b, [1, 2, 3, 4], 1)   # 24

@lru_cache
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)

add = lambda a, b: a + b
inc = partial(add, 1)   # inc(5) -> 6
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Memoized Fibonacci",
          code: `from functools import lru_cache

@lru_cache
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)

print([fib(i) for i in range(10)])
print("cache:", fib.cache_info())`,
        },
        {
          kind: "challenge",
          title: "Product via reduce",
          prompt:
            "Return the product of all numbers in `nums` using `functools.reduce`. The product of an empty list is `1`.",
          starterCode: `from functools import reduce

def product(nums):
    pass`,
          tests: [
            { name: "basic", assertion: "assert product([1,2,3,4]) == 24" },
            { name: "empty", assertion: "assert product([]) == 1" },
            { name: "with zero", assertion: "assert product([5,0,9]) == 0", hidden: true },
          ],
          solution: `from functools import reduce

def product(nums):
    return reduce(lambda a, b: a * b, nums, 1)`,
          xp: 60,
        },
      ],
    },
  ],
};
