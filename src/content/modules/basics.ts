import type { Module } from "../../types/lesson";

// Python Basics — a "deep" module. Each lesson mixes prose, runnable code, the
// step-through ExecutionVisualizer, a quiz, and a CodeSignal-style challenge.
export const basics: Module = {
  id: "basics",
  title: "Python Basics",
  blurb: "Variables, types, control flow, functions — the foundations.",
  level: "Beginner",
  icon: "🐍",
  status: "deep",
  lessons: [
    {
      id: "variables-and-types",
      title: "Variables & Types",
      summary: "How Python stores data: ints, floats, strings, booleans, None.",
      minutes: 8,
      blocks: [
        {
          kind: "prose",
          markdown: `# Variables & Types

A **variable** is a name that points to a value. Python is *dynamically typed*: you
don't declare a type, you just assign.

\`\`\`python
age = 30          # int
price = 19.99     # float
name = "Ada"      # str
is_member = True  # bool
nothing = None    # NoneType
\`\`\`

Use \`type(x)\` to inspect a value's type. Run the code below 👇`,
        },
        {
          kind: "runnable",
          title: "Inspect types",
          code: `age = 30
price = 19.99
name = "Ada"
is_member = True

print(type(age), type(price))
print(type(name), type(is_member))
print(f"{name} is {age} years old")`,
        },
        {
          kind: "prose",
          markdown: `### Watch assignment happen, step by step

Press **Visualize** and step through. Notice how each variable appears in the
**Variables** panel the moment its line runs.`,
        },
        {
          kind: "visualized",
          title: "Variables come to life",
          code: `a = 5
b = 3
total = a + b
label = "sum"
print(label, "=", total)`,
        },
        {
          kind: "quiz",
          question: "What is the type of `3 / 2` in Python 3?",
          options: [
            { text: "int" },
            { text: "float", correct: true },
            { text: "str" },
            { text: "It raises an error" },
          ],
          explanation: "True division `/` always returns a float; use `//` for integer division.",
        },
        {
          kind: "challenge",
          title: "Rectangle area",
          prompt:
            "Write a function `area(width, height)` that returns the area of a rectangle.",
          starterCode: `def area(width, height):
    # your code here
    pass`,
          tests: [
            { name: "3 x 4 = 12", assertion: "assert area(3, 4) == 12" },
            { name: "0 width", assertion: "assert area(0, 5) == 0" },
            { name: "floats", assertion: "assert area(2.5, 2) == 5.0", hidden: true },
          ],
          solution: `def area(width, height):
    return width * height`,
          xp: 50,
        },
      ],
    },
    {
      id: "operators",
      title: "Operators & Expressions",
      summary: "Arithmetic, comparison, and boolean operators.",
      minutes: 7,
      blocks: [
        {
          kind: "prose",
          markdown: `# Operators

| Category | Operators |
|---|---|
| Arithmetic | \`+  -  *  /  //  %  **\` |
| Comparison | \`==  !=  <  <=  >  >=\` |
| Boolean | \`and  or  not\` |

\`//\` is floor division, \`%\` is modulo (remainder), \`**\` is power.`,
        },
        {
          kind: "runnable",
          title: "Try the operators",
          code: `print(17 // 5)   # floor division
print(17 % 5)    # remainder
print(2 ** 10)   # power
print(3 < 5 and 5 < 10)
print(not (1 == 1))`,
        },
        {
          kind: "challenge",
          title: "Even or odd",
          prompt: "Return the string `\"even\"` or `\"odd\"` for an integer `n`.",
          starterCode: `def parity(n):
    pass`,
          tests: [
            { name: "4 -> even", assertion: 'assert parity(4) == "even"' },
            { name: "7 -> odd", assertion: 'assert parity(7) == "odd"' },
            { name: "0 -> even", assertion: 'assert parity(0) == "even"', hidden: true },
          ],
          solution: `def parity(n):
    return "even" if n % 2 == 0 else "odd"`,
        },
      ],
    },
    {
      id: "strings",
      title: "Strings",
      summary: "Slicing, methods, and f-strings.",
      minutes: 9,
      blocks: [
        {
          kind: "prose",
          markdown: `# Strings

Strings are *immutable* sequences of characters. Index with \`[]\`, slice with
\`[start:stop:step]\`, and format with **f-strings**.

\`\`\`python
s = "python"
s[0]      # 'p'
s[-1]     # 'n'
s[1:4]    # 'yth'
s[::-1]   # 'nohtyp'  (reversed)
\`\`\`

Common methods: \`.upper() .lower() .strip() .split() .replace() .join()\`.`,
        },
        {
          kind: "runnable",
          title: "Slice and dice",
          code: `s = "Data Science"
print(s.upper())
print(s.lower().replace(" ", "_"))
print(s.split())
print(s[::-1])
print("-".join(["a", "b", "c"]))`,
        },
        {
          kind: "challenge",
          title: "Palindrome check",
          prompt:
            "Return `True` if `text` reads the same forwards and backwards (ignore case).",
          starterCode: `def is_palindrome(text):
    pass`,
          tests: [
            { name: "'racecar'", assertion: "assert is_palindrome('racecar') is True" },
            { name: "'Level'", assertion: "assert is_palindrome('Level') is True" },
            { name: "'hello'", assertion: "assert is_palindrome('hello') is False", hidden: true },
          ],
          solution: `def is_palindrome(text):
    t = text.lower()
    return t == t[::-1]`,
        },
      ],
    },
    {
      id: "conditionals",
      title: "Conditionals",
      summary: "if / elif / else and truthiness.",
      minutes: 7,
      blocks: [
        {
          kind: "prose",
          markdown: `# Conditionals

\`\`\`python
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"
\`\`\`

**Truthiness:** empty things (\`0\`, \`""\`, \`[]\`, \`{}\`, \`None\`) are *falsy*; most
everything else is *truthy*.`,
        },
        {
          kind: "visualized",
          title: "Follow the branch",
          code: `score = 84
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"
print("Grade:", grade)`,
        },
        {
          kind: "challenge",
          title: "FizzBuzz (single value)",
          prompt:
            "Return `\"FizzBuzz\"` if divisible by 15, `\"Fizz\"` by 3, `\"Buzz\"` by 5, else the number as a string.",
          starterCode: `def fizzbuzz(n):
    pass`,
          tests: [
            { name: "15", assertion: "assert fizzbuzz(15) == 'FizzBuzz'" },
            { name: "9", assertion: "assert fizzbuzz(9) == 'Fizz'" },
            { name: "10", assertion: "assert fizzbuzz(10) == 'Buzz'" },
            { name: "7", assertion: "assert fizzbuzz(7) == '7'", hidden: true },
          ],
          hints: [
            "Check divisibility by 15 FIRST — otherwise 15 matches the 3 case too early.",
            "Use the modulo operator: `n % 3 == 0` means divisible by 3.",
            "If none match, return the number as a string with `str(n)`.",
          ],
          solution: `def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)`,
        },
      ],
    },
    {
      id: "loops",
      title: "Loops — see them flow",
      summary: "for and while loops, range, break/continue — visualized.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# Loops

Loops repeat work. A \`for\` loop iterates over a sequence; a \`while\` loop runs
while a condition holds.

\`\`\`python
for i in range(5):     # 0,1,2,3,4
    print(i)

while n > 0:
    n -= 1
\`\`\`

The best way to *understand* a loop is to **watch it run**. Step through the
examples below and watch the counter and accumulator change on every iteration.`,
        },
        {
          kind: "visualized",
          title: "for loop: summing numbers",
          code: `total = 0
for i in range(1, 6):
    total = total + i
    print(f"i={i}, total={total}")
print("final:", total)`,
        },
        {
          kind: "visualized",
          title: "while loop: countdown with break",
          code: `n = 10
steps = 0
while n > 0:
    n = n - 3
    steps += 1
    if n < 0:
        break
print("steps:", steps, "n:", n)`,
        },
        {
          kind: "prose",
          markdown: `### Nested loops

Loops inside loops multiply iterations. Watch the two counters move together.`,
        },
        {
          kind: "visualized",
          title: "nested loop: multiplication grid",
          code: `for r in range(1, 4):
    row = ""
    for c in range(1, 4):
        row += f"{r*c:3}"
    print(row)`,
        },
        {
          kind: "quiz",
          question: "How many times does the body of `for i in range(2, 10, 2)` run?",
          options: [
            { text: "8" },
            { text: "4", correct: true },
            { text: "5" },
            { text: "10" },
          ],
          explanation: "range(2,10,2) → 2,4,6,8 → 4 values.",
        },
        {
          kind: "challenge",
          title: "Sum of a list",
          prompt: "Without using `sum()`, return the total of all numbers in `nums`.",
          starterCode: `def total(nums):
    pass`,
          tests: [
            { name: "[1,2,3]", assertion: "assert total([1,2,3]) == 6" },
            { name: "empty", assertion: "assert total([]) == 0" },
            { name: "negatives", assertion: "assert total([-1, 1, -2]) == -2", hidden: true },
          ],
          hints: [
            "Start with an accumulator set to 0 before the loop.",
            "Loop over each value with `for x in nums:` and add it to the accumulator.",
            "Return the accumulator after the loop ends (not inside it).",
          ],
          solution: `def total(nums):
    acc = 0
    for x in nums:
        acc += x
    return acc`,
          xp: 60,
        },
      ],
    },
    {
      id: "functions",
      title: "Functions",
      summary: "Parameters, return values, defaults, *args/**kwargs.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `# Functions

Functions package reusable logic. They take **parameters** and \`return\` a value.

\`\`\`python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Ada")                 # 'Hello, Ada!'
greet("Ada", greeting="Hi")  # 'Hi, Ada!'
\`\`\`

\`*args\` collects extra positional args into a tuple; \`**kwargs\` collects extra
keyword args into a dict.`,
        },
        {
          kind: "visualized",
          title: "Calling a function (watch the call stack depth)",
          code: `def square(x):
    return x * x

def sum_of_squares(a, b):
    return square(a) + square(b)

result = sum_of_squares(3, 4)
print(result)`,
        },
        {
          kind: "challenge",
          title: "Max of three",
          prompt: "Return the largest of three numbers `a, b, c` (don't use `max`).",
          starterCode: `def largest(a, b, c):
    pass`,
          tests: [
            { name: "1,2,3", assertion: "assert largest(1,2,3) == 3" },
            { name: "9,1,4", assertion: "assert largest(9,1,4) == 9" },
            { name: "equal", assertion: "assert largest(5,5,5) == 5", hidden: true },
          ],
          solution: `def largest(a, b, c):
    m = a
    if b > m: m = b
    if c > m: m = c
    return m`,
        },
      ],
    },
    {
      id: "comprehensions",
      title: "Comprehensions",
      summary: "List, dict, and set comprehensions — concise data building.",
      minutes: 9,
      blocks: [
        {
          kind: "prose",
          markdown: `# Comprehensions

A compact way to build collections.

\`\`\`python
[x*x for x in range(5)]              # [0, 1, 4, 9, 16]
[x for x in range(10) if x % 2 == 0] # evens
{c: ord(c) for c in "abc"}           # dict comp
{x % 3 for x in range(10)}           # set comp -> {0,1,2}
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Build collections",
          code: `squares = [x*x for x in range(6)]
evens = [x for x in range(10) if x % 2 == 0]
lengths = {w: len(w) for w in ["hi", "world", "ok"]}
print(squares)
print(evens)
print(lengths)`,
        },
        {
          kind: "challenge",
          title: "Squares of evens",
          prompt:
            "Using a comprehension, return a list of squares of the even numbers in `nums`.",
          starterCode: `def even_squares(nums):
    pass`,
          tests: [
            { name: "1..5", assertion: "assert even_squares([1,2,3,4,5]) == [4, 16]" },
            { name: "empty", assertion: "assert even_squares([]) == []" },
            { name: "all odd", assertion: "assert even_squares([1,3,5]) == []", hidden: true },
          ],
          solution: `def even_squares(nums):
    return [x*x for x in nums if x % 2 == 0]`,
        },
      ],
    },
    {
      id: "errors",
      title: "Errors & Exceptions",
      summary: "try/except/finally and raising errors.",
      minutes: 8,
      blocks: [
        {
          kind: "prose",
          markdown: `# Errors & Exceptions

Handle errors gracefully with \`try\`/\`except\`:

\`\`\`python
try:
    value = int(user_input)
except ValueError:
    value = 0
finally:
    print("done")   # always runs
\`\`\`

Raise your own with \`raise ValueError("message")\`.`,
        },
        {
          kind: "runnable",
          title: "Catch an error",
          code: `def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

print(safe_div(10, 2))
print(safe_div(10, 0))`,
        },
        {
          kind: "challenge",
          title: "Safe integer parse",
          prompt: "Return the integer value of `s`, or `default` if it can't be parsed.",
          starterCode: `def parse_int(s, default=0):
    pass`,
          tests: [
            { name: "'42'", assertion: "assert parse_int('42') == 42" },
            { name: "'oops'", assertion: "assert parse_int('oops', -1) == -1" },
            { name: "'3.5'", assertion: "assert parse_int('3.5', 0) == 0", hidden: true },
          ],
          solution: `def parse_int(s, default=0):
    try:
        return int(s)
    except (ValueError, TypeError):
        return default`,
        },
      ],
    },
  ],
};
