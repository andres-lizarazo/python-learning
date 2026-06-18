import type { Module } from "../../types/lesson";

// Pandas — data processing, cleaning, transformation. Now a "deep" module; runs in Pyodide.
export const pandas: Module = {
  id: "pandas",
  title: "Pandas — Data Wrangling",
  blurb: "Load, select, clean, group, merge and aggregate tabular data.",
  level: "Intermediate",
  icon: "🐼",
  status: "deep",
  lessons: [
    {
      id: "dataframes",
      title: "Series & DataFrames",
      summary: "The core pandas objects and selection.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# Pandas

A **DataFrame** is a 2-D labeled table; a **Series** is a single labeled column.
Pandas is the workhorse of data analysis in Python.

> The first run installs pandas into Pyodide (a few seconds).`,
        },
        {
          kind: "runnable",
          title: "Create & inspect",
          packages: ["pandas"],
          code: `import pandas as pd

df = pd.DataFrame({
    "name": ["Ada", "Linus", "Grace", "Alan"],
    "lang": ["python", "c", "cobol", "math"],
    "score": [91, 85, 99, 88],
})
print(df)
print("\\nshape:", df.shape)
print("\\nmean score:", df["score"].mean())
print("\\ntop scorer:\\n", df.loc[df["score"].idxmax()])`,
        },
      ],
    },
    {
      id: "selecting-filtering",
      title: "Selecting & Filtering",
      summary: "loc / iloc, boolean masks and query.",
      minutes: 11,
      blocks: [
        {
          kind: "prose",
          markdown: `# Selecting & Filtering

- \`df["col"]\` → a Series; \`df[["a", "b"]]\` → a DataFrame of those columns.
- \`df.loc[rows, cols]\` selects by **label**; \`df.iloc[i, j]\` by **position**.
- Boolean masks filter rows: \`df[df["score"] > 90]\`.
- \`df.query("score > 90 and lang == 'python'")\` is a readable alternative.

\`\`\`python
df.loc[df["score"] > 90, "name"]   # names of high scorers
df.iloc[0]                          # first row
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Filter rows & pick columns",
          packages: ["pandas"],
          code: `import pandas as pd
df = pd.DataFrame({
    "name": ["Ada", "Linus", "Grace", "Alan"],
    "lang": ["python", "c", "cobol", "math"],
    "score": [91, 85, 99, 88],
})
print("high scorers:\\n", df[df["score"] > 90][["name", "score"]])
print("\\nvia query:\\n", df.query("score >= 88 and lang != 'c'"))
print("\\niloc[0]:\\n", df.iloc[0])`,
        },
        {
          kind: "challenge",
          title: "Names above a threshold",
          prompt:
            "`records` is a list of dicts each with `\"name\"` and `\"score\"`. Using pandas, return a **list of names** whose score is `>= cutoff`, in their original order.",
          packages: ["pandas"],
          starterCode: `import pandas as pd

def names_above(records, cutoff):
    pass`,
          tests: [
            {
              name: "basic",
              assertion:
                "assert names_above([{'name':'a','score':90},{'name':'b','score':70},{'name':'c','score':80}], 80) == ['a','c']",
            },
            {
              name: "none pass",
              assertion: "assert names_above([{'name':'x','score':10}], 50) == []",
              hidden: true,
            },
          ],
          solution: `import pandas as pd

def names_above(records, cutoff):
    df = pd.DataFrame(records)
    return df[df["score"] >= cutoff]["name"].tolist()`,
          xp: 70,
        },
      ],
    },
    {
      id: "cleaning",
      title: "Cleaning & Transforming",
      summary: "Missing values, types, filtering, derived columns.",
      minutes: 14,
      blocks: [
        {
          kind: "prose",
          markdown: `# Cleaning data

Real data is messy: missing values, wrong types, duplicates. The typical pipeline:
**inspect → handle NaNs → fix types → filter → derive columns → aggregate**.`,
        },
        {
          kind: "runnable",
          title: "Handle missing values",
          packages: ["pandas", "numpy"],
          code: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    "city": ["NY", "NY", "LA", "LA", "SF"],
    "temp": [30, np.nan, 75, 80, np.nan],
})
print("missing per column:\\n", df.isna().sum())

# fill NaNs with the city's mean temperature
df["temp"] = df.groupby("city")["temp"].transform(lambda s: s.fillna(s.mean()))
print("\\nafter fill:\\n", df)`,
        },
        {
          kind: "runnable",
          title: "Filter & derive columns",
          packages: ["pandas"],
          code: `import pandas as pd
df = pd.DataFrame({
    "product": ["A", "B", "C", "D"],
    "price": [10, 25, 5, 40],
    "qty": [3, 1, 10, 2],
})
df["revenue"] = df["price"] * df["qty"]
hot = df[df["revenue"] > 30].sort_values("revenue", ascending=False)
print(hot)`,
        },
      ],
    },
    {
      id: "groupby-aggregation",
      title: "Group-by & Aggregation",
      summary: "Split-apply-combine: group, aggregate, pivot.",
      minutes: 13,
      blocks: [
        {
          kind: "prose",
          markdown: `# Group-by & Aggregation

The **split-apply-combine** pattern: split rows into groups, apply an aggregation,
combine the results.

\`\`\`python
df.groupby("city")["temp"].mean()
df.groupby("city").agg(avg=("temp", "mean"), n=("temp", "size"))
df.pivot_table(index="city", columns="season", values="temp", aggfunc="mean")
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Group and aggregate",
          packages: ["pandas"],
          code: `import pandas as pd
df = pd.DataFrame({
    "city": ["NY", "NY", "LA", "LA", "LA"],
    "sales": [100, 150, 200, 50, 50],
})
print("sum by city:\\n", df.groupby("city")["sales"].sum())
print("\\nmulti-agg:\\n", df.groupby("city").agg(
    total=("sales", "sum"),
    avg=("sales", "mean"),
    n=("sales", "size"),
))`,
        },
        {
          kind: "challenge",
          title: "Average by group",
          prompt:
            "`records` is a list of dicts with keys `group` and `value`. Using pandas, return a **dict** mapping each group to the **mean** of its values (as plain floats).",
          packages: ["pandas"],
          starterCode: `import pandas as pd

def avg_by_group(records):
    pass`,
          tests: [
            {
              name: "two groups",
              assertion:
                "assert avg_by_group([{'group':'x','value':2},{'group':'x','value':4},{'group':'y','value':9}]) == {'x': 3.0, 'y': 9.0}",
            },
            {
              name: "single",
              assertion: "assert avg_by_group([{'group':'a','value':5}]) == {'a': 5.0}",
              hidden: true,
            },
          ],
          solution: `import pandas as pd

def avg_by_group(records):
    s = pd.DataFrame(records).groupby("group")["value"].mean()
    return {k: float(v) for k, v in s.items()}`,
          xp: 80,
        },
      ],
    },
    {
      id: "merge-join-concat",
      title: "Merge, Join & Concat",
      summary: "Combine tables row-wise and key-wise.",
      minutes: 12,
      blocks: [
        {
          kind: "prose",
          markdown: `# Combining DataFrames

- \`pd.concat([df1, df2])\` stacks rows (or columns with \`axis=1\`).
- \`a.merge(b, on="key", how="inner")\` joins on a shared key — like a SQL JOIN.
  \`how\` can be \`inner\`, \`left\`, \`right\`, or \`outer\`.

\`\`\`python
orders.merge(prices, on="item", how="left")
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Merge two tables",
          packages: ["pandas"],
          code: `import pandas as pd
orders = pd.DataFrame({"item": ["a", "b", "c"], "qty": [2, 1, 5]})
prices = pd.DataFrame({"item": ["a", "b", "c"], "price": [10, 25, 4]})

m = orders.merge(prices, on="item")
m["cost"] = m["qty"] * m["price"]
print(m)
print("\\ntotal cost:", m["cost"].sum())`,
        },
        {
          kind: "challenge",
          title: "Join orders with prices",
          prompt:
            "`orders` = list of dicts `{item, qty}`; `prices` = list of dicts `{item, price}`. Using a pandas **merge**, return a **dict** mapping each item to its cost (`qty * price`, as int).",
          packages: ["pandas"],
          starterCode: `import pandas as pd

def order_costs(orders, prices):
    pass`,
          tests: [
            {
              name: "basic",
              assertion:
                "assert order_costs([{'item':'a','qty':2},{'item':'b','qty':3}], [{'item':'a','price':10},{'item':'b','price':5}]) == {'a': 20, 'b': 15}",
            },
            {
              name: "single",
              assertion:
                "assert order_costs([{'item':'x','qty':4}], [{'item':'x','price':3}]) == {'x': 12}",
              hidden: true,
            },
          ],
          solution: `import pandas as pd

def order_costs(orders, prices):
    m = pd.DataFrame(orders).merge(pd.DataFrame(prices), on="item")
    return {row["item"]: int(row["qty"] * row["price"]) for _, row in m.iterrows()}`,
          xp: 80,
        },
      ],
    },
  ],
};
