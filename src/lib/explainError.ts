// Maps a raw Python error/traceback line to a friendly, beginner-oriented tip.
// Returns null when we don't have a specific hint (the raw error is still shown).

const RULES: { match: RegExp; tip: string }[] = [
  {
    match: /AssertionError/,
    tip: "Your function ran without crashing, but returned the wrong value for this case. Re-check the logic.",
  },
  {
    match: /NameError/,
    tip: "A name isn't defined — check for a typo, or make sure you defined (and returned) it.",
  },
  {
    match: /IndentationError|TabError/,
    tip: "Indentation problem — Python blocks use consistent 4-space indents under a `:` line.",
  },
  { match: /SyntaxError/, tip: "Syntax issue — check for a missing `:`, bracket, or comma." },
  {
    match: /ZeroDivisionError/,
    tip: "You divided by zero — guard the denominator (e.g. `if b != 0:`).",
  },
  {
    match: /IndexError/,
    tip: "You indexed past the end of a list/string — remember indices go from 0 to len-1.",
  },
  {
    match: /KeyError/,
    tip: "That key isn't in the dict — use `d.get(key, default)` or check membership first.",
  },
  {
    match: /TypeError.*NoneType/,
    tip: "Something is `None` where a value was expected — did you forget a `return`?",
  },
  {
    match: /TypeError/,
    tip: "A type mismatch — you combined incompatible types (e.g. adding a str and an int).",
  },
  {
    match: /ValueError/,
    tip: "A value had the wrong form for the operation (e.g. `int('abc')`).",
  },
  {
    match: /AttributeError/,
    tip: "You used a method/attribute the object doesn't have — check the variable's type.",
  },
  {
    match: /RecursionError/,
    tip: "Infinite recursion — make sure every path reaches a base case that returns.",
  },
];

export function explainError(error: string | undefined): string | null {
  if (!error) return null;
  for (const r of RULES) {
    if (r.match.test(error)) return r.tip;
  }
  return null;
}
