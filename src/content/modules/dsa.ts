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
a duplicate / group by" problems become linear with a hash map.

Under the hood, a hash table maps each key to a **bucket** via \`hash(key) % n\`. When
two keys land in the same bucket (a **collision**), they're kept in a small chain.`,
        },
        {
          kind: "dsa-viz",
          viz: "hash-table",
          title: "Hashing with chaining",
          data: { values: [12, 5, 19, 26, 7, 33], buckets: 7 },
          caption: "Each key goes to bucket key % 7; collisions append to the bucket's chain.",
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
      id: "sliding-window",
      title: "Sliding Window",
      summary: "A moving window turns repeated sub-array work into O(n).",
      minutes: 11,
      blocks: [
        {
          kind: "prose",
          markdown: `# Sliding Window

When a problem asks about **contiguous** sub-arrays/substrings of a fixed (or growing)
size, slide a window across the data and update an aggregate incrementally instead of
recomputing it each time — O(n) instead of O(n·k).`,
        },
        {
          kind: "dsa-viz",
          viz: "sliding-window",
          title: "Max window sum",
          data: { values: [2, 1, 5, 1, 3, 2, 4], k: 3, metric: "sum" },
          caption: "The window of size k slides one step at a time; track the best sum seen.",
        },
        {
          kind: "challenge",
          title: "Max sum of size-k window",
          prompt:
            "Return the **maximum sum** of any contiguous window of size `k` in `nums` (assume 1 ≤ k ≤ len).",
          starterCode: `def max_window_sum(nums, k):
    pass`,
          tests: [
            { name: "basic", assertion: "assert max_window_sum([2,1,5,1,3,2], 3) == 9" },
            { name: "k=1", assertion: "assert max_window_sum([4,2,7], 1) == 7" },
            { name: "whole", assertion: "assert max_window_sum([1,2,3], 3) == 6", hidden: true },
          ],
          hints: [
            "Compute the sum of the first window (first k items).",
            "To slide: add the new right element and subtract the one leaving on the left.",
            "Keep a running max of the window sums.",
          ],
          solution: `def max_window_sum(nums, k):
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best`,
          xp: 80,
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
      id: "backtracking",
      title: "Backtracking",
      summary: "Explore choices with DFS, undoing each one to try the next.",
      minutes: 13,
      blocks: [
        {
          kind: "prose",
          markdown: `# Backtracking

Backtracking builds a solution incrementally: **choose**, recurse, then **undo** the
choice and try the next. It explores a tree of decisions — great for subsets,
permutations, combinations, and puzzles like N-Queens.

\`\`\`python
def backtrack(i, path):
    if i == len(items):
        record(path); return
    backtrack(i + 1, path)          # skip items[i]
    path.append(items[i])
    backtrack(i + 1, path)          # choose items[i]
    path.pop()                       # undo
\`\`\``,
        },
        {
          kind: "dsa-viz",
          viz: "backtracking",
          title: "All subsets of {1, 2, 3}",
          data: { values: [1, 2, 3] },
          caption: "At each element, branch into skip vs choose; collect a subset at each leaf.",
        },
        {
          kind: "challenge",
          title: "All subsets",
          prompt:
            "Return **all subsets** of `nums` (the power set) as a list of lists. Order doesn't matter.",
          starterCode: `def subsets(nums):
    pass`,
          tests: [
            {
              name: "[1,2]",
              assertion:
                "assert sorted([sorted(s) for s in subsets([1,2])]) == [[], [1], [1,2], [2]]",
            },
            { name: "count", assertion: "assert len(subsets([1,2,3])) == 8" },
            { name: "empty", assertion: "assert subsets([]) == [[]]", hidden: true },
          ],
          hints: [
            "There are 2^n subsets — each element is either in or out.",
            "Recurse with an index and a current path; at the end, append a copy of the path.",
            "After the 'choose' branch, pop the element to restore state (backtrack).",
          ],
          solution: `def subsets(nums):
    out = []
    def bt(i, path):
        if i == len(nums):
            out.append(path[:])
            return
        bt(i + 1, path)
        path.append(nums[i])
        bt(i + 1, path)
        path.pop()
    bt(0, [])
    return out`,
          xp: 90,
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
          kind: "user-viz",
          title: "Animate your own sort",
          starterCode: `def bubble_sort(nums):
    a = list(nums)
    record(a, note="start")
    n = len(a)
    for i in range(n - 1):
        for j in range(n - 1 - i):
            record(a, [j, j + 1], f"compare {a[j]} & {a[j + 1]}")
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                record(a, [j, j + 1], "swap")
    record(a, note="sorted")
    return a

bubble_sort([5, 2, 8, 1, 9, 3])`,
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
      id: "heaps",
      title: "Heaps & Priority Queues",
      summary: "A tree that keeps the min (or max) at the root in O(log n).",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# Heaps

A **binary heap** is a complete tree where every parent is ≤ its children (min-heap).
The minimum is always at the root, and insert/pop are **O(log n)** via *sift-up* /
*sift-down*. It's stored compactly in an array: children of \`i\` live at \`2i+1\` and
\`2i+2\`.

Python's \`heapq\` module turns any list into a min-heap:

\`\`\`python
import heapq
h = []
heapq.heappush(h, 5)
heapq.heappop(h)       # smallest
heapq.nsmallest(3, xs) # k smallest
\`\`\``,
        },
        {
          kind: "dsa-viz",
          viz: "heap",
          title: "Building a min-heap",
          data: { values: [9, 4, 7, 1, 5, 8, 2] },
          caption: "Each insert appends at the end, then sifts up while smaller than its parent.",
        },
        {
          kind: "challenge",
          title: "k smallest",
          prompt:
            "Return the `k` smallest values of `nums`, sorted ascending. Use `heapq`.",
          starterCode: `import heapq

def k_smallest(nums, k):
    pass`,
          tests: [
            { name: "basic", assertion: "assert k_smallest([5,1,3,2,4], 3) == [1,2,3]" },
            { name: "k=1", assertion: "assert k_smallest([10, 2, 8], 1) == [2]" },
            { name: "k=0", assertion: "assert k_smallest([3,1], 0) == []", hidden: true },
          ],
          hints: [
            "`heapq.nsmallest(k, nums)` returns the k smallest (unordered-ish).",
            "Wrap it in `sorted(...)` to return them ascending.",
          ],
          solution: `import heapq

def k_smallest(nums, k):
    return sorted(heapq.nsmallest(k, nums))`,
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
      id: "dijkstra",
      title: "Weighted Graphs & Dijkstra",
      summary: "Shortest paths when edges have costs.",
      minutes: 14,
      blocks: [
        {
          kind: "prose",
          markdown: `# Dijkstra's algorithm

When edges have **weights** (costs), BFS no longer finds the shortest path. **Dijkstra**
greedily settles the closest unvisited node, then **relaxes** its edges (improves a
neighbor's tentative distance if going through this node is cheaper). A min-heap keeps
the next-closest node handy → O((V+E) log V).

\`\`\`python
import heapq
dist = {n: float("inf") for n in graph}
dist[start] = 0
pq = [(0, start)]
while pq:
    d, u = heapq.heappop(pq)
    for v, w in graph[u]:
        if d + w < dist[v]:
            dist[v] = d + w
            heapq.heappush(pq, (dist[v], v))
\`\`\``,
        },
        {
          kind: "dsa-viz",
          viz: "dijkstra",
          title: "Shortest paths from A",
          data: {
            start: "A",
            adjacency: {
              A: [["B", 4], ["C", 1]],
              B: [["A", 4], ["D", 1]],
              C: [["A", 1], ["B", 2], ["D", 5]],
              D: [["B", 1], ["C", 5]],
            },
          },
          caption: "Yellow = node being settled; the label above each node is its best distance.",
        },
        {
          kind: "challenge",
          title: "Shortest distances",
          prompt:
            "`graph` maps each node to a list of `[neighbor, weight]` edges. Return a dict of the **shortest distance** from `start` to every node (use `float('inf')` for unreachable). Use Dijkstra with `heapq`.",
          starterCode: `import heapq

def shortest(graph, start):
    pass`,
          tests: [
            {
              name: "basic",
              assertion:
                "assert shortest({'A':[['B',1],['C',4]],'B':[['C',2]],'C':[]}, 'A') == {'A':0,'B':1,'C':3}",
            },
            {
              name: "unreachable",
              assertion:
                "assert shortest({'A':[],'B':[['A',1]]}, 'A') == {'A':0,'B':float('inf')}",
              hidden: true,
            },
          ],
          hints: [
            "Init every distance to infinity except `dist[start] = 0`.",
            "Pop the closest node from a heap; skip it if you've already found something better.",
            "Relax each edge: if `d + w < dist[v]`, update and push `(dist[v], v)`.",
          ],
          solution: `import heapq

def shortest(graph, start):
    dist = {n: float("inf") for n in graph}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(pq, (dist[v], v))
    return dist`,
          xp: 100,
        },
      ],
    },
    {
      id: "tries",
      title: "Tries (Prefix Trees)",
      summary: "A tree of characters for fast prefix lookups.",
      minutes: 11,
      blocks: [
        {
          kind: "prose",
          markdown: `# Tries

A **trie** stores strings by character along tree edges, so shared prefixes share
nodes. Lookups and prefix checks run in O(length of the word), independent of how many
words are stored. A simple Python trie is just nested dicts:

\`\`\`python
trie = {}
for ch in "cat":
    trie = trie.setdefault(ch, {})
trie["$"] = True   # mark end of a word
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Build & query a trie",
          code: `def build(words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = True
    return root

def has_prefix(root, prefix):
    node = root
    for ch in prefix:
        if ch not in node:
            return False
        node = node[ch]
    return True

t = build(["cat", "car", "dog"])
print(has_prefix(t, "ca"))   # True
print(has_prefix(t, "do"))   # True
print(has_prefix(t, "x"))    # False`,
        },
        {
          kind: "challenge",
          title: "Prefix search",
          prompt:
            "Implement `build(words)` (a nested-dict trie) and `has_prefix(trie, prefix)` returning `True` if any stored word starts with `prefix`.",
          starterCode: `def build(words):
    pass

def has_prefix(trie, prefix):
    pass`,
          tests: [
            {
              name: "prefixes",
              assertion:
                "t = build(['cat','car','dog']); assert has_prefix(t,'ca') is True and has_prefix(t,'do') is True",
            },
            {
              name: "absent",
              assertion: "t = build(['cat']); assert has_prefix(t,'do') is False",
            },
            {
              name: "empty prefix",
              assertion: "t = build(['a']); assert has_prefix(t,'') is True",
              hidden: true,
            },
          ],
          hints: [
            "In `build`, walk/create a nested dict node per character with `setdefault`.",
            "In `has_prefix`, follow each character; if one is missing, return False.",
            "Reaching the end of the prefix without a miss means True.",
          ],
          solution: `def build(words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
    return root

def has_prefix(trie, prefix):
    node = trie
    for ch in prefix:
        if ch not in node:
            return False
        node = node[ch]
    return True`,
          xp: 80,
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
    {
      id: "dp-coin-change",
      title: "DP — Coin Change",
      summary: "Bottom-up table for the classic min-coins problem.",
      minutes: 13,
      blocks: [
        {
          kind: "prose",
          markdown: `# Coin Change (bottom-up DP)

Given coin denominations and a target \`amount\`, find the **fewest coins** that sum to
it. Build a table where \`dp[a]\` = min coins to make amount \`a\`:

- \`dp[0] = 0\`; everything else starts at "infinity".
- For each amount \`a\`, try every coin \`c ≤ a\`: \`dp[a] = min(dp[a], dp[a-c] + 1)\`.
- If \`dp[amount]\` is still infinity, it's impossible → return -1.`,
        },
        {
          kind: "visualized",
          title: "Filling the dp table",
          code: `coins = [1, 2, 5]
amount = 6
INF = amount + 1
dp = [0] + [INF] * amount
for a in range(1, amount + 1):
    for c in coins:
        if c <= a:
            dp[a] = min(dp[a], dp[a - c] + 1)
print(dp)
print("min coins:", dp[amount])`,
        },
        {
          kind: "challenge",
          title: "Coin change",
          prompt:
            "Return the **minimum number of coins** that sum to `amount`, or `-1` if impossible. `coins` are positive denominations.",
          starterCode: `def coin_change(coins, amount):
    pass`,
          tests: [
            { name: "11 with [1,2,5]", assertion: "assert coin_change([1,2,5], 11) == 3" },
            { name: "impossible", assertion: "assert coin_change([2], 3) == -1" },
            { name: "zero", assertion: "assert coin_change([1], 0) == 0", hidden: true },
          ],
          hints: [
            "Make a dp array of size amount+1, dp[0]=0, the rest a large 'infinity'.",
            "For each amount a, relax with every coin: dp[a] = min(dp[a], dp[a-c]+1).",
            "If dp[amount] is still 'infinity' at the end, return -1.",
          ],
          solution: `def coin_change(coins, amount):
    INF = amount + 1
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != INF else -1`,
          xp: 90,
        },
      ],
    },
  ],
};
