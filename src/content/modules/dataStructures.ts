import type { Module } from "../../types/lesson";

// Built-in Python data structures — a "deep" module. Pairs hands-on code with the
// DSA visualizers so learners *see* how lists/stacks/queues behave.
export const dataStructures: Module = {
  id: "data-structures",
  title: "Data Structures",
  blurb: "Lists, tuples, dicts, sets, and stacks/queues — with visuals.",
  level: "Beginner",
  icon: "🧱",
  status: "deep",
  lessons: [
    {
      id: "lists",
      title: "Lists",
      summary: "Ordered, mutable sequences — the workhorse of Python.",
      minutes: 11,
      blocks: [
        {
          kind: "prose",
          markdown: `# Lists

A **list** is an ordered, mutable collection. Index from \`0\`; negative indices
count from the end.

\`\`\`python
nums = [10, 20, 30]
nums.append(40)     # add to end
nums.insert(0, 5)   # insert at index
nums.pop()          # remove & return last
nums[1] = 99        # mutate in place
\`\`\``,
        },
        {
          kind: "dsa-viz",
          viz: "array",
          title: "Indexing a list",
          data: { values: [10, 20, 30, 40, 50], mode: "scan" },
          caption: "Each box is an element; the number underneath is its index.",
        },
        {
          kind: "runnable",
          title: "List operations",
          code: `nums = [10, 20, 30]
nums.append(40)
nums.insert(0, 5)
print(nums)
print("len:", len(nums))
print("slice:", nums[1:3])
nums.sort(reverse=True)
print("sorted desc:", nums)`,
        },
        {
          kind: "visualized",
          title: "Aliasing — switch to the Objects view!",
          code: `a = [1, 2, 3]
b = a            # b points to the SAME list as a
b.append(4)      # this also changes a!
c = a[:]         # c is a separate copy
c.append(99)
print("a:", a)
print("b:", b)
print("c:", c)`,
        },
        {
          kind: "challenge",
          title: "Second largest",
          prompt:
            "Return the second largest **distinct** value in `nums` (assume at least two distinct values).",
          starterCode: `def second_largest(nums):
    pass`,
          tests: [
            { name: "[3,1,2]", assertion: "assert second_largest([3,1,2]) == 2" },
            { name: "dupes", assertion: "assert second_largest([5,5,4]) == 4" },
            { name: "neg", assertion: "assert second_largest([-1,-2,-3]) == -2", hidden: true },
          ],
          solution: `def second_largest(nums):
    distinct = sorted(set(nums))
    return distinct[-2]`,
          xp: 60,
        },
      ],
    },
    {
      id: "tuples",
      title: "Tuples",
      summary: "Immutable sequences; unpacking and as dict keys.",
      minutes: 6,
      blocks: [
        {
          kind: "prose",
          markdown: `# Tuples

A **tuple** is like a list but **immutable**. Great for fixed records and as dict
keys.

\`\`\`python
point = (3, 4)
x, y = point          # unpacking
coords = {(0,0): "origin"}  # tuples can be keys
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Unpacking",
          code: `person = ("Ada", 36, "London")
name, age, city = person
print(name, age, city)

# swap without a temp
a, b = 1, 2
a, b = b, a
print(a, b)`,
        },
        {
          kind: "quiz",
          question: "Which operation raises an error on a tuple `t = (1, 2, 3)`?",
          options: [
            { text: "t[0]" },
            { text: "len(t)" },
            { text: "t[0] = 9", correct: true },
            { text: "t + (4,)" },
          ],
          explanation: "Tuples are immutable — item assignment is not allowed.",
        },
      ],
    },
    {
      id: "dicts",
      title: "Dictionaries",
      summary: "Key→value maps with O(1) lookup.",
      minutes: 11,
      blocks: [
        {
          kind: "prose",
          markdown: `# Dictionaries

A **dict** maps keys to values with average **O(1)** lookup (it's a hash table).

\`\`\`python
prices = {"apple": 3, "pear": 2}
prices["apple"]            # 3
prices.get("banana", 0)    # 0 (default, no KeyError)
for k, v in prices.items():
    ...
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Counting with a dict",
          code: `text = "mississippi"
counts = {}
for ch in text:
    counts[ch] = counts.get(ch, 0) + 1
print(counts)`,
        },
        {
          kind: "challenge",
          title: "Word frequency",
          prompt:
            "Return a dict mapping each word in the list `words` to how many times it appears.",
          starterCode: `def word_count(words):
    pass`,
          tests: [
            {
              name: "basic",
              assertion: "assert word_count(['a','b','a']) == {'a': 2, 'b': 1}",
            },
            { name: "empty", assertion: "assert word_count([]) == {}" },
            {
              name: "single",
              assertion: "assert word_count(['x']) == {'x': 1}",
              hidden: true,
            },
          ],
          solution: `def word_count(words):
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1
    return counts`,
          xp: 60,
        },
      ],
    },
    {
      id: "sets",
      title: "Sets",
      summary: "Unordered unique collections; fast membership & set algebra.",
      minutes: 8,
      blocks: [
        {
          kind: "prose",
          markdown: `# Sets

A **set** holds unique elements with fast membership tests and supports set
algebra:

\`\`\`python
a = {1, 2, 3}
b = {2, 3, 4}
a | b   # union      {1,2,3,4}
a & b   # intersect  {2,3}
a - b   # difference {1}
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Deduplicate & set algebra",
          code: `nums = [1, 1, 2, 3, 3, 3, 4]
print("unique:", set(nums))

a = {1, 2, 3}
b = {2, 3, 4}
print("union:", a | b)
print("intersection:", a & b)
print("difference:", a - b)`,
        },
        {
          kind: "challenge",
          title: "Common elements",
          prompt: "Return a **sorted list** of values that appear in both `a` and `b`.",
          starterCode: `def common(a, b):
    pass`,
          tests: [
            { name: "overlap", assertion: "assert common([1,2,3],[2,3,4]) == [2,3]" },
            { name: "none", assertion: "assert common([1],[2]) == []" },
            { name: "dupes", assertion: "assert common([1,1,2],[2,2,1]) == [1,2]", hidden: true },
          ],
          solution: `def common(a, b):
    return sorted(set(a) & set(b))`,
        },
      ],
    },
    {
      id: "stacks-queues",
      title: "Stacks & Queues",
      summary: "LIFO and FIFO patterns built on lists / deque.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `# Stacks & Queues

A **stack** is Last-In-First-Out (LIFO): you push and pop from the same end.
A **queue** is First-In-First-Out (FIFO): you enqueue at the back, dequeue at the
front.

\`\`\`python
stack = []
stack.append(1); stack.append(2)
stack.pop()          # 2  (LIFO)

from collections import deque
q = deque()
q.append(1); q.append(2)
q.popleft()          # 1  (FIFO)
\`\`\``,
        },
        {
          kind: "dsa-viz",
          viz: "stack-queue",
          title: "Stack (LIFO)",
          data: { structure: "stack" },
          caption: "Watch values pushed and popped from the same (top) end.",
        },
        {
          kind: "dsa-viz",
          viz: "stack-queue",
          title: "Queue (FIFO)",
          data: { structure: "queue" },
          caption: "Items leave from the front in the order they arrived.",
        },
        {
          kind: "challenge",
          title: "Balanced brackets",
          prompt:
            "Return `True` if the string `s` of `()[]{}` is balanced and correctly nested.",
          starterCode: `def is_balanced(s):
    pass`,
          tests: [
            { name: "()[]", assertion: "assert is_balanced('()[]{}') is True" },
            { name: "([)]", assertion: "assert is_balanced('([)]') is False" },
            { name: "empty", assertion: "assert is_balanced('') is True", hidden: true },
          ],
          hints: [
            "Use a stack (a list): push every opening bracket.",
            "On a closing bracket, the top of the stack must be its matching opener.",
            "At the end the stack must be empty — otherwise some opener was never closed.",
          ],
          solution: `def is_balanced(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack`,
          xp: 70,
        },
      ],
    },
  ],
};
