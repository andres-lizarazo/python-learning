import type { Module } from "../../types/lesson";

// NumPy — now a "deep" module. Runs real numpy in the browser via Pyodide.
export const numpy: Module = {
  id: "numpy",
  title: "NumPy",
  blurb: "Fast n-dimensional arrays, indexing, reshaping and vectorized math.",
  level: "Intermediate",
  icon: "🔢",
  status: "deep",
  lessons: [
    {
      id: "ndarrays",
      title: "Arrays & Vectorization",
      summary: "Create arrays, broadcast, and compute without Python loops.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# NumPy arrays

\`ndarray\` is a homogeneous, fixed-type array. Operations are **vectorized** — they
run on the whole array at C speed, no Python loop needed.

> The first run installs NumPy into Pyodide (a few seconds). Subsequent runs are instant.`,
        },
        {
          kind: "runnable",
          title: "Vectorized math",
          packages: ["numpy"],
          code: `import numpy as np

a = np.array([1, 2, 3, 4])
print("a * 2     =", a * 2)
print("a ** 2    =", a ** 2)
print("mean/std  =", a.mean(), round(a.std(), 3))

m = np.arange(1, 7).reshape(2, 3)
print(m)
print("sum axis0 =", m.sum(axis=0))
print("transpose =\\n", m.T)`,
        },
        {
          kind: "runnable",
          title: "Boolean masking",
          packages: ["numpy"],
          code: `import numpy as np
data = np.array([3, 8, 1, 9, 4, 7])
mask = data > 5
print("mask:", mask)
print("filtered:", data[mask])
data[data < 5] = 0
print("clamped:", data)`,
        },
        {
          kind: "challenge",
          title: "Scale to 0–10",
          prompt:
            "Use NumPy. `scale(nums)` returns a **list** where each value is multiplied by 10 (vectorized, no Python loop).",
          packages: ["numpy"],
          starterCode: `import numpy as np

def scale(nums):
    pass`,
          tests: [
            { name: "basic", assertion: "assert scale([1, 2, 3]) == [10, 20, 30]" },
            { name: "empty", assertion: "assert scale([]) == []" },
            { name: "floats", assertion: "assert scale([0.5, 1.5]) == [5.0, 15.0]", hidden: true },
          ],
          solution: `import numpy as np

def scale(nums):
    return (np.array(nums) * 10).tolist()`,
          xp: 60,
        },
      ],
    },
    {
      id: "indexing-reshaping",
      title: "Indexing & Reshaping",
      summary: "Slicing, fancy/boolean indexing, reshape and axes.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# Indexing & Reshaping

NumPy indexing goes beyond Python lists:

\`\`\`python
a[2]          # single element
a[1:4]        # slice (a view, not a copy!)
a[[0, 2, 4]]  # fancy indexing -> new array
a[a > 5]      # boolean indexing
m[1, 2]       # row 1, col 2 (2-D)
m[:, 0]       # whole first column
\`\`\`

\`reshape(rows, cols)\` changes the shape without copying data; use \`-1\` to let NumPy
infer one dimension.`,
        },
        {
          kind: "runnable",
          title: "Reshape & 2-D indexing",
          packages: ["numpy"],
          code: `import numpy as np

a = np.arange(12)
m = a.reshape(3, 4)         # 3 rows, 4 cols
print(m)
print("row 1     :", m[1])
print("col 2     :", m[:, 2])
print("submatrix :\\n", m[0:2, 1:3])
print("flatten   :", m.reshape(-1))`,
        },
        {
          kind: "runnable",
          title: "Fancy & boolean indexing",
          packages: ["numpy"],
          code: `import numpy as np
a = np.array([10, 20, 30, 40, 50])
print("pick 0,2,4 :", a[[0, 2, 4]])
print("> 25       :", a[a > 25])
a[a > 25] = 0
print("zeroed     :", a)`,
        },
        {
          kind: "challenge",
          title: "Reshape into rows",
          prompt:
            "Use NumPy. `to_rows(nums, r)` reshapes the flat list `nums` into `r` rows and returns a **nested list** (let NumPy infer the column count).",
          packages: ["numpy"],
          starterCode: `import numpy as np

def to_rows(nums, r):
    pass`,
          tests: [
            { name: "2x2", assertion: "assert to_rows([1,2,3,4], 2) == [[1,2],[3,4]]" },
            { name: "1 row", assertion: "assert to_rows([1,2,3], 1) == [[1,2,3]]" },
            { name: "3x2", assertion: "assert to_rows([1,2,3,4,5,6], 3) == [[1,2],[3,4],[5,6]]", hidden: true },
          ],
          solution: `import numpy as np

def to_rows(nums, r):
    return np.array(nums).reshape(r, -1).tolist()`,
          xp: 70,
        },
      ],
    },
    {
      id: "aggregations-broadcasting",
      title: "Aggregations & Broadcasting",
      summary: "Reduce along axes; broadcast shapes together.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# Aggregations & Broadcasting

**Aggregations** reduce an array; \`axis\` controls the direction:

\`\`\`python
m.sum()          # everything -> scalar
m.sum(axis=0)    # down the columns -> one value per column
m.sum(axis=1)    # across the rows  -> one value per row
\`\`\`

**Broadcasting** lets NumPy combine arrays of different (compatible) shapes without
copying — e.g. subtract a per-column mean from every row:

\`\`\`python
m - m.mean(axis=0)   # (3,4) - (4,) works by broadcasting
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Axis-wise reductions",
          packages: ["numpy"],
          code: `import numpy as np
m = np.array([[1, 2, 3], [4, 5, 6]])
print("total      :", m.sum())
print("col sums   :", m.sum(axis=0))
print("row means  :", m.mean(axis=1))
print("col max    :", m.max(axis=0))`,
        },
        {
          kind: "runnable",
          title: "Broadcasting: standardize columns",
          packages: ["numpy"],
          code: `import numpy as np
m = np.array([[1.0, 10.0], [2.0, 20.0], [3.0, 30.0]])
centered = m - m.mean(axis=0)     # subtract per-column mean
print(centered)
print("new col means:", centered.mean(axis=0))`,
        },
        {
          kind: "challenge",
          title: "Column sums",
          prompt:
            "Use NumPy. `column_sums(matrix)` returns a **list** with the sum of each column of a 2-D list.",
          packages: ["numpy"],
          starterCode: `import numpy as np

def column_sums(matrix):
    pass`,
          tests: [
            { name: "2x2", assertion: "assert column_sums([[1,2],[3,4]]) == [4, 6]" },
            { name: "3x3", assertion: "assert column_sums([[1,1,1],[2,2,2],[3,3,3]]) == [6, 6, 6]" },
            { name: "single row", assertion: "assert column_sums([[5,9]]) == [5, 9]", hidden: true },
          ],
          solution: `import numpy as np

def column_sums(matrix):
    return np.array(matrix).sum(axis=0).tolist()`,
          xp: 70,
        },
      ],
    },
  ],
};
