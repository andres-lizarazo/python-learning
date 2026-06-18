import type { Module } from "../../types/lesson";

// Data Visualization — matplotlib + seaborn rendered to PNG via Pyodide. Now "deep".
// Plots are captured automatically after each run (no checkbox needed).
export const viz: Module = {
  id: "viz",
  title: "Data Visualization",
  blurb: "Plot with matplotlib and seaborn — rendered right in the browser.",
  level: "Intermediate",
  icon: "📈",
  status: "deep",
  lessons: [
    {
      id: "matplotlib",
      title: "matplotlib Basics",
      summary: "Line, bar, and scatter plots.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `# matplotlib

The foundational plotting library. Build a figure, draw on it, and PyLearn renders
the result below the editor **automatically** — no need to call \`plt.show()\`.`,
        },
        {
          kind: "runnable",
          title: "Line & bar plot",
          packages: ["matplotlib", "numpy"],
          code: `import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2*np.pi, 100)
fig, axes = plt.subplots(1, 2, figsize=(9, 3))
axes[0].plot(x, np.sin(x), label="sin")
axes[0].plot(x, np.cos(x), label="cos")
axes[0].legend(); axes[0].set_title("Trig")

axes[1].bar(["A", "B", "C", "D"], [5, 9, 3, 7], color="#3776ab")
axes[1].set_title("Categories")
fig.tight_layout()`,
        },
      ],
    },
    {
      id: "customizing-plots",
      title: "Customizing Plots",
      summary: "Titles, labels, legends, styles and subplot grids.",
      minutes: 11,
      blocks: [
        {
          kind: "prose",
          markdown: `# Customizing plots

Make a chart readable: titles, axis labels, legends, grid, colors and a style sheet.

\`\`\`python
ax.set_title(...); ax.set_xlabel(...); ax.set_ylabel(...)
ax.legend(); ax.grid(True)
plt.style.use("seaborn-v0_8")     # or "ggplot", "dark_background", …
\`\`\`

A \`subplots(rows, cols)\` grid lets you place several charts in one figure.`,
        },
        {
          kind: "runnable",
          title: "A polished 2×2 grid",
          packages: ["matplotlib", "numpy"],
          code: `import numpy as np
import matplotlib.pyplot as plt

plt.style.use("ggplot")
x = np.linspace(0, 10, 100)
fig, ax = plt.subplots(2, 2, figsize=(9, 5))

ax[0, 0].plot(x, np.sin(x)); ax[0, 0].set_title("sin"); ax[0, 0].grid(True)
ax[0, 1].plot(x, np.sqrt(x), color="purple"); ax[0, 1].set_title("sqrt")
ax[1, 0].scatter(np.random.rand(40), np.random.rand(40), alpha=0.6)
ax[1, 0].set_xlabel("x"); ax[1, 0].set_ylabel("y"); ax[1, 0].set_title("scatter")
ax[1, 1].hist(np.random.randn(500), bins=20, color="teal")
ax[1, 1].set_title("histogram")

fig.suptitle("Customized subplot grid", fontsize=14)
fig.tight_layout()`,
        },
        {
          kind: "quiz",
          question: "Which call adds a legend that uses each plot's `label=` argument?",
          options: [
            { text: "ax.set_title()" },
            { text: "ax.legend()", correct: true },
            { text: "ax.grid(True)" },
            { text: "plt.show()" },
          ],
          explanation: "`ax.legend()` reads the `label=` you passed to plot/bar/etc.",
        },
      ],
    },
    {
      id: "pandas-plotting",
      title: "Plotting from Pandas",
      summary: "Charts straight from a DataFrame with df.plot().",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `# Plotting from pandas

DataFrames and Series have a built-in \`.plot()\` (backed by matplotlib):

\`\`\`python
df["col"].plot(kind="line")
df["cat"].value_counts().plot(kind="bar")
df.plot(x="a", y="b", kind="scatter")
\`\`\``,
        },
        {
          kind: "runnable",
          title: "Bar & line from a DataFrame",
          packages: ["pandas", "matplotlib"],
          code: `import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({
    "month": ["Jan", "Feb", "Mar", "Apr", "May"],
    "sales": [120, 150, 90, 170, 200],
    "costs": [80, 100, 70, 110, 130],
})

fig, axes = plt.subplots(1, 2, figsize=(9, 3.2))
df.plot(x="month", y=["sales", "costs"], kind="bar", ax=axes[0], title="Monthly")
df.assign(profit=df["sales"] - df["costs"]).plot(
    x="month", y="profit", marker="o", ax=axes[1], title="Profit", legend=False
)
fig.tight_layout()`,
        },
      ],
    },
    {
      id: "seaborn",
      title: "seaborn — statistical plots",
      summary: "Beautiful statistical graphics on top of matplotlib.",
      minutes: 10,
      blocks: [
        {
          kind: "prose",
          markdown: `# seaborn

Seaborn makes attractive statistical plots with minimal code and integrates with
pandas DataFrames.

> The first run installs seaborn (and scipy) via pip in Pyodide — this can take
> ~15–30s the first time.`,
        },
        {
          kind: "runnable",
          title: "Distribution & relationship",
          packages: ["seaborn", "pandas", "numpy", "matplotlib"],
          code: `import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
df = pd.DataFrame({
    "x": rng.normal(0, 1, 200),
    "group": rng.choice(["A", "B"], 200),
})
df["y"] = df["x"] * 2 + rng.normal(0, 0.5, 200)

sns.set_theme(style="whitegrid")
fig, axes = plt.subplots(1, 2, figsize=(9, 3.2))
sns.histplot(data=df, x="x", hue="group", ax=axes[0])
sns.scatterplot(data=df, x="x", y="y", hue="group", ax=axes[1])
fig.tight_layout()`,
        },
      ],
    },
    {
      id: "seaborn-categorical",
      title: "seaborn — categorical & heatmaps",
      summary: "Boxplots, barplots and correlation heatmaps.",
      minutes: 11,
      blocks: [
        {
          kind: "prose",
          markdown: `# Categorical plots & heatmaps

Seaborn shines at comparing groups and showing matrices:

- \`sns.boxplot\` / \`sns.violinplot\` — distribution per category
- \`sns.barplot\` — mean (with confidence interval) per category
- \`sns.heatmap\` — a matrix (e.g. a correlation matrix) as colors`,
        },
        {
          kind: "runnable",
          title: "Boxplot, barplot & heatmap",
          packages: ["seaborn", "pandas", "numpy", "matplotlib"],
          code: `import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)
df = pd.DataFrame({
    "team": rng.choice(["A", "B", "C"], 120),
    "score": rng.normal(50, 12, 120),
    "minutes": rng.normal(30, 8, 120),
})

sns.set_theme(style="whitegrid")
fig, axes = plt.subplots(1, 3, figsize=(11, 3.2))
sns.boxplot(data=df, x="team", y="score", ax=axes[0])
axes[0].set_title("Score by team")
sns.barplot(data=df, x="team", y="minutes", ax=axes[1])
axes[1].set_title("Avg minutes")
sns.heatmap(df[["score", "minutes"]].corr(), annot=True, cmap="Blues", ax=axes[2])
axes[2].set_title("Correlation")
fig.tight_layout()`,
        },
      ],
    },
  ],
};
