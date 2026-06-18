import type { Module } from "../../types/lesson";

// Data Structures & Algorithms — a "deep" interview-prep track. Every lesson pairs an
// animated visualizer with a CodeSignal-style challenge.
export const dsa: Module = {
  id: "dsa",
  title: "DSA — Algorithms",
  blurb: "Two pointers, recursion, sorting, search, trees & graphs — visualized.",
  level: "Intermediate",
  icon: "🧠",
  status: "deep",
  lessons: [
    {
      id: "two-pointers",
      title: "Arrays & Two Pointers",
      summary: "A pattern that turns many O(n²) scans into O(n).",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# Two Pointers

Keep two indices that move toward each other (or in the same direction). It's a
go-to pattern for sorted arrays, reversals, and pair-sum problems.

\`\`\`python
lo, hi = 0, len(arr) - 1
while lo < hi:
    ...
    lo += 1; hi -= 1
\`\`\``,
        },
        {
          kind: "dsa-viz",
          viz: "array",
          title: "Two pointers converging",
          data: { values: [1, 2, 3, 4, 5, 6, 7, 8], mode: "two-pointer" },
          caption: "Left and right pointers move inward until they cross.",
        },
        {
          kind: "challenge",
          title: "Two-sum (sorted)",
          prompt:
            "Given a **sorted** list `nums` and a `target`, return the 0-based indices `[i, j]` of two numbers that add to `target` (i < j). Use two pointers for O(n).",
          starterCode: `def two_sum_sorted(nums, target):
    pass`,
          tests: [
            { name: "basic", assertion: "assert two_sum_sorted([1,2,4,7], 6) == [1,2]" },
            { name: "ends", assertion: "assert two_sum_sorted([1,3,5,9], 10) == [0,3]" },
            { name: "mid", assertion: "assert two_sum_sorted([2,3,4], 6) == [0,2]", hidden: true },
          ],
          hints: [
            "Put one pointer at the start (`lo`) and one at the end (`hi`).",
            "If the sum is too small, move `lo` right; if too big, move `hi` left.",
            "When `nums[lo] + nums[hi] == target`, return `[lo, hi]`.",
          ],
          solution: `def two_sum_sorted(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        s = nums[lo] + nums[hi]
        if s == target:
            return [lo, hi]
        if s < target:
            lo += 1
        else:
            hi -= 1
    return []`,
          xp: 70,
        },
      ],
    },
    {
      id: "hashing",
      title: "Hashing & Frequency Maps",
      summary: "Trade space for O(1) lookups.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `# Hashing

Dicts/sets give average **O(1)** membership and counting. Many "find a pair / find
a duplicate / group by" problems become linear with a hash map.`,
        },
        {
          kind: "challenge",
          title: "Two-sum (unsorted)",
          prompt:
            "Return indices `[i, j]` of two numbers in `nums` adding to `target`. One pass with a dict: O(n).",
          starterCode: `def two_sum(nums, target):
    pass`,
          tests: [
            { name: "basic", assertion: "assert sorted(two_sum([2,7,11,15], 9)) == [0,1]" },
            { name: "mid", assertion: "assert sorted(two_sum([3,2,4], 6)) == [1,2]" },
            { name: "dupes", assertion: "assert sorted(two_sum([3,3], 6)) == [0,1]", hidden: true },
          ],
          solution: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []`,
          xp: 70,
        },
      ],
    },
    {
      id: "recursion",
      title: "Recursion",
      summary: "Functions that call themselves — and the call stack.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# Recursion

A recursive function solves a problem by calling itself on a **smaller** input,
stopping at a **base case**. Each call adds a frame to the **call stack**.

\`\`\`python
def factorial(n):
    if n <= 1:        # base case
        return 1
    return n * factorial(n - 1)
\`\`\`

Watch the stack grow on the way down and unwind on the way back up 👇`,
        },
        {
          kind: "dsa-viz",
          viz: "recursion",
          title: "factorial(4) call stack",
          data: { func: "factorial", n: 4 },
          caption: "Yellow = currently executing frame; green = returning a value.",
        },
        {
          kind: "dsa-viz",
          viz: "recursion",
          title: "fib(5) — exponential branching",
          data: { func: "fibonacci", n: 5 },
          caption: "Naive Fibonacci recomputes the same calls — motivation for DP.",
        },
        {
          kind: "challenge",
          title: "Recursive sum",
          prompt: "Return the sum of `nums` using recursion (no loops, no `sum`).",
          starterCode: `def rsum(nums):
    pass`,
          tests: [
            { name: "[1,2,3]", assertion: "assert rsum([1,2,3]) == 6" },
            { name: "empty", assertion: "assert rsum([]) == 0" },
            { name: "one", assertion: "assert rsum([42]) == 42", hidden: true },
          ],
          solution: `def rsum(nums):
    if not nums:
        return 0
    return nums[0] + rsum(nums[1:])`,
        },
      ],
    },
    {
      id: "sorting",
      title: "Sorting Algorithms",
      summary: "Bubble, insertion, selection, merge, quick — animated.",
      minutes: 16,
      blocks: [
        {
          kind: "prose",
          markdown: `# Sorting

Comparison sorts rearrange elements into order. Watch each algorithm work, then
compare their behavior.

| Algorithm | Average time | Stable | In-place |
|---|---|---|---|
| Bubble | O(n²) | yes | yes |
| Insertion | O(n²) | yes | yes |
| Selection | O(n²) | no | yes |
| Merge | O(n log n) | yes | no |
| Quick | O(n log n) | no | yes |`,
        },
        {
          kind: "dsa-viz",
          viz: "sorting",
          algorithm: "bubble",
          title: "Bubble Sort",
          data: { values: [5, 2, 8, 1, 9, 3] },
          caption: "Adjacent compares bubble the largest value to the end each pass.",
        },
        {
          kind: "dsa-viz",
          viz: "sorting",
          algorithm: "insertion",
          title: "Insertion Sort",
          data: { values: [5, 2, 8, 1, 9, 3] },
        },
        {
          kind: "dsa-viz",
          viz: "sorting",
          algorithm: "merge",
          title: "Merge Sort",
          data: { values: [5, 2, 8, 1, 9, 3, 7] },
          caption: "Divide into halves, then merge sorted runs back together.",
        },
        {
          kind: "dsa-viz",
          viz: "sorting",
          algorithm: "quick",
          title: "Quick Sort",
          data: { values: [5, 2, 8, 1, 9, 3, 7] },
          caption: "Partition around a pivot, then recurse on each side.",
        },
        {
          kind: "challenge",
          title: "Implement insertion sort",
          prompt:
            "Return a new sorted (ascending) list. Implement insertion sort yourself (don't call `sorted`/`.sort`).",
          starterCode: `def insertion_sort(nums):
    pass`,
          tests: [
            { name: "basic", assertion: "assert insertion_sort([3,1,2]) == [1,2,3]" },
            { name: "empty", assertion: "assert insertion_sort([]) == []" },
            { name: "dupes", assertion: "assert insertion_sort([2,2,1]) == [1,2,2]", hidden: true },
          ],
          solution: `def insertion_sort(nums):
    a = list(nums)
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`,
          xp: 80,
        },
      ],
    },
    {
      id: "binary-search",
      title: "Binary Search",
      summary: "O(log n) search on sorted data.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `# Binary Search

On **sorted** data, halve the search space each step: O(log n).

\`\`\`python
lo, hi = 0, len(a) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] == target: return mid
    if a[mid] < target: lo = mid + 1
    else: hi = mid - 1
\`\`\``,
        },
        {
          kind: "visualized",
          title: "Trace binary search",
          code: `a = [1, 3, 5, 7, 9, 11, 13]
target = 11
lo, hi = 0, len(a) - 1
found = -1
while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] == target:
        found = mid
        break
    elif a[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
print("index:", found)`,
        },
        {
          kind: "challenge",
          title: "Binary search",
          prompt:
            "Return the index of `target` in the sorted list `a`, or `-1` if absent. Must be O(log n).",
          starterCode: `def bsearch(a, target):
    pass`,
          tests: [
            { name: "found", assertion: "assert bsearch([1,3,5,7], 5) == 2" },
            { name: "missing", assertion: "assert bsearch([1,3,5,7], 4) == -1" },
            { name: "first", assertion: "assert bsearch([1,3,5,7], 1) == 0", hidden: true },
          ],
          solution: `def bsearch(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
          xp: 70,
        },
      ],
    },
    {
      id: "linked-lists",
      title: "Linked Lists",
      summary: "Nodes linked by pointers; insertion and deletion.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# Linked Lists

Each **node** holds a value and a reference to the \`next\` node. Insertion/deletion
at a known position is O(1) (just relink pointers), but random access is O(n).`,
        },
        {
          kind: "dsa-viz",
          viz: "linked-list",
          title: "Append, prepend, delete",
          data: {
            initial: [10, 20],
            ops: [
              { op: "append", value: 30 },
              { op: "prepend", value: 5 },
              { op: "delete", value: 20 },
            ],
          },
          caption: "Deleting relinks the previous node's `next` past the removed node.",
        },
        {
          kind: "challenge",
          title: "Reverse a linked list",
          prompt:
            "A node is `{'val': x, 'next': node_or_None}`. Return the head of the reversed list.",
          starterCode: `def reverse(head):
    pass`,
          tests: [
            {
              name: "3 nodes",
              assertion:
                "n3={'val':3,'next':None}; n2={'val':2,'next':n3}; n1={'val':1,'next':n2}; r=reverse(n1); assert [r['val'], r['next']['val'], r['next']['next']['val']] == [3,2,1]",
            },
            { name: "empty", assertion: "assert reverse(None) is None", hidden: true },
          ],
          solution: `def reverse(head):
    prev = None
    cur = head
    while cur is not None:
        nxt = cur['next']
        cur['next'] = prev
        prev = cur
        cur = nxt
    return prev`,
          xp: 80,
        },
      ],
    },
    {
      id: "trees",
      title: "Trees & BST Traversals",
      summary: "Binary search trees and in/pre/post/level-order traversal.",
      minutes: 14,
      blocks: [
        {
          kind: "prose",
          markdown: `# Trees

A **binary search tree** keeps smaller values left, larger right — so search is
O(log n) when balanced. Traversals visit nodes in different orders:

- **In-order** (L, node, R) → sorted order for a BST
- **Pre-order** (node, L, R) → copy/serialize
- **Post-order** (L, R, node) → delete/evaluate
- **Level-order** (BFS) → breadth first`,
        },
        {
          kind: "dsa-viz",
          viz: "tree",
          title: "In-order traversal",
          data: { values: [50, 30, 70, 20, 40, 60, 80], traversal: "inorder" },
          caption: "In-order on a BST yields values in ascending order.",
        },
        {
          kind: "dsa-viz",
          viz: "tree",
          title: "Level-order (BFS)",
          data: { values: [50, 30, 70, 20, 40, 60, 80], traversal: "bfs" },
        },
        {
          kind: "challenge",
          title: "In-order traversal",
          prompt:
            "A node is `{'val': v, 'left': L, 'right': R}` (children may be None). Return the list of values in **in-order**.",
          starterCode: `def inorder(root):
    pass`,
          tests: [
            {
              name: "bst",
              assertion:
                "t={'val':2,'left':{'val':1,'left':None,'right':None},'right':{'val':3,'left':None,'right':None}}; assert inorder(t) == [1,2,3]",
            },
            { name: "empty", assertion: "assert inorder(None) == []", hidden: true },
          ],
          solution: `def inorder(root):
    if root is None:
        return []
    return inorder(root['left']) + [root['val']] + inorder(root['right'])`,
          xp: 80,
        },
      ],
    },
    {
      id: "graphs",
      title: "Graphs — BFS & DFS",
      summary: "Traverse networks breadth-first and depth-first.",
      minutes: 14,
      blocks: [
        {
          kind: "prose",
          markdown: `# Graph Traversal

A **graph** is nodes + edges, often stored as an adjacency list \`{node: [neighbors]}\`.

- **BFS** uses a **queue** (FIFO) → explores level by level (shortest path in
  unweighted graphs).
- **DFS** uses a **stack**/recursion (LIFO) → dives deep before backtracking.`,
        },
        {
          kind: "dsa-viz",
          viz: "graph",
          traversal: "bfs",
          title: "Breadth-First Search",
          data: { start: "A" },
          caption: "The queue holds the frontier; visited nodes turn green.",
        },
        {
          kind: "dsa-viz",
          viz: "graph",
          traversal: "dfs",
          title: "Depth-First Search",
          data: { start: "A" },
          caption: "DFS uses a stack — it dives as deep as possible first.",
        },
        {
          kind: "challenge",
          title: "Reachable nodes (BFS)",
          prompt:
            "Given an adjacency dict `graph` and a `start` node, return the **set** of all nodes reachable from `start` (including `start`).",
          starterCode: `def reachable(graph, start):
    pass`,
          tests: [
            {
              name: "connected",
              assertion:
                "g={'A':['B'],'B':['C'],'C':[]}; assert reachable(g,'A') == {'A','B','C'}",
            },
            {
              name: "isolated",
              assertion: "g={'A':[],'B':['A']}; assert reachable(g,'A') == {'A'}",
              hidden: true,
            },
          ],
          solution: `def reachable(graph, start):
    seen = set([start])
    stack = [start]
    while stack:
        node = stack.pop()
        for nb in graph.get(node, []):
            if nb not in seen:
                seen.add(nb)
                stack.append(nb)
    return seen`,
          xp: 90,
        },
      ],
    },
    {
      id: "dynamic-programming",
      title: "Intro to Dynamic Programming",
      summary: "Memoization and bottom-up tables.",
      minutes: 13,
      blocks: [
        {
          kind: "prose",
          markdown: `# Dynamic Programming

DP solves problems with **overlapping subproblems** by storing results.

- **Memoization** (top-down): cache recursive results.
- **Tabulation** (bottom-up): fill a table iteratively.

Recall the \`fib\` recursion tree recomputed the same calls — DP fixes that, turning
O(2ⁿ) into O(n).`,
        },
        {
          kind: "visualized",
          title: "Bottom-up Fibonacci",
          code: `n = 8
dp = [0, 1]
for i in range(2, n + 1):
    dp.append(dp[i-1] + dp[i-2])
print(dp)
print("fib(8) =", dp[n])`,
        },
        {
          kind: "challenge",
          title: "Climbing stairs",
          prompt:
            "You can climb 1 or 2 steps at a time. Return the number of distinct ways to reach step `n` (n ≥ 0). This is Fibonacci in disguise.",
          starterCode: `def climb(n):
    pass`,
          tests: [
            { name: "n=2", assertion: "assert climb(2) == 2" },
            { name: "n=3", assertion: "assert climb(3) == 3" },
            { name: "n=5", assertion: "assert climb(5) == 8" },
            { name: "n=0", assertion: "assert climb(0) == 1", hidden: true },
          ],
          hints: [
            "The ways to reach step n = ways(n-1) + ways(n-2) — it's Fibonacci.",
            "Track the last two values and roll them forward in a loop.",
            "Base: there is 1 way to stand at step 0.",
          ],
          solution: `def climb(n):
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
          xp: 90,
        },
      ],
    },
  ],
};
