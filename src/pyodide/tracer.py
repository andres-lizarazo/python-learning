"""Step recorder for PyLearn's ExecutionVisualizer.

Runs a piece of user code under ``sys.settrace`` and records, for every line that
executes, a snapshot of the local variables in scope. The result is a JSON-friendly
dict consumed by the React ExecutionVisualizer so learners can scrub through their
program one line at a time and *watch loops flow*.

Safety / limits:
  * Only events originating from the user's synthetic ``<exec>`` file are recorded.
  * Steps are capped (MAX_STEPS) to avoid runaway loops freezing the worker.
  * Values are rendered with a length-limited ``repr`` so huge objects stay cheap.
"""

import sys
import io
import json
import traceback

MAX_STEPS = 1500
MAX_REPR = 160
FILENAME = "<exec>"


def _safe_repr(value):
    try:
        r = repr(value)
    except Exception:
        return "<unreprable>"
    if len(r) > MAX_REPR:
        r = r[: MAX_REPR - 1] + "…"
    return r


def _kind(value):
    if isinstance(value, bool):
        return "bool"
    if isinstance(value, int):
        return "int"
    if isinstance(value, float):
        return "float"
    if isinstance(value, str):
        return "str"
    if isinstance(value, list):
        return "list"
    if isinstance(value, tuple):
        return "tuple"
    if isinstance(value, dict):
        return "dict"
    if isinstance(value, set):
        return "set"
    if value is None:
        return "none"
    return "object"


def _snapshot(local_vars):
    out = {}
    for name, value in local_vars.items():
        if name.startswith("__"):
            continue
        # Skip modules/functions/classes to keep the variable table focused on data.
        if callable(value) and not isinstance(value, (int, float, str)):
            continue
        if type(value).__name__ in ("module",):
            continue
        out[name] = {"repr": _safe_repr(value), "kind": _kind(value)}
    return out


MAX_NODES = 60  # heap objects per step
MAX_DIAGRAM_ITEMS = 30  # elements rendered per container


def _diagram(local_vars):
    """Structured snapshot for the reference diagram: primitives inline, containers as
    heap nodes addressed by a small integer id (so shared references/aliasing show up)."""
    heap = {}
    id_map = {}
    budget = [MAX_NODES]

    def cell(v, depth=0):
        if isinstance(v, bool):
            return {"t": "bool", "v": repr(v)}
        if isinstance(v, (int, float)):
            return {"t": "num", "v": _safe_repr(v)}
        if isinstance(v, str):
            return {"t": "str", "v": _safe_repr(v)}
        if v is None:
            return {"t": "none", "v": "None"}
        if isinstance(v, (list, tuple, dict, set)):
            oid = id(v)
            if oid in id_map:
                return {"t": "ref", "id": id_map[oid]}
            if budget[0] <= 0 or depth > 4:
                return {"t": "str", "v": _safe_repr(v)}
            idx = len(id_map)
            id_map[oid] = idx
            budget[0] -= 1
            node = {"kind": _kind(v)}
            if isinstance(v, (list, tuple)):
                seq = list(v)
                node["items"] = [cell(x, depth + 1) for x in seq[:MAX_DIAGRAM_ITEMS]]
                node["more"] = max(0, len(seq) - MAX_DIAGRAM_ITEMS)
            elif isinstance(v, dict):
                items = []
                for k in list(v.keys())[:MAX_DIAGRAM_ITEMS]:
                    items.append([_safe_repr(k), cell(v[k], depth + 1)])
                node["items"] = items
                node["more"] = max(0, len(v) - MAX_DIAGRAM_ITEMS)
            else:  # set
                seq = list(v)
                node["items"] = [_safe_repr(x) for x in seq[:MAX_DIAGRAM_ITEMS]]
                node["more"] = max(0, len(seq) - MAX_DIAGRAM_ITEMS)
            heap[idx] = node
            return {"t": "ref", "id": idx}
        return {"t": "str", "v": _safe_repr(v)}

    refs = {}
    for name, value in local_vars.items():
        if name.startswith("__"):
            continue
        if callable(value) and not isinstance(value, (int, float, str)):
            continue
        if type(value).__name__ in ("module",):
            continue
        refs[name] = cell(value)
    return refs, heap


def trace_code(source):
    steps = []
    out_buffer = io.StringIO()
    error = None
    truncated = False
    # Names of the functions currently on the call stack (within the user's file).
    call_stack = []

    def tracer(frame, event, arg):
        nonlocal truncated
        if frame.f_code.co_filename != FILENAME:
            return tracer
        if event == "call":
            call_stack.append(frame.f_code.co_name)
            return tracer
        if event == "line" or event == "return":
            if len(steps) >= MAX_STEPS:
                truncated = True
                return None  # stop tracing this frame
            refs, heap = _diagram(frame.f_locals)
            steps.append(
                {
                    "line": frame.f_lineno,
                    "event": event,
                    "func": frame.f_code.co_name,
                    "depth": max(0, len(call_stack) - 1),
                    "stack": list(call_stack),
                    "locals": _snapshot(frame.f_locals),
                    "refs": refs,
                    "heap": heap,
                    "stdout": out_buffer.getvalue(),
                }
            )
            if event == "return" and call_stack:
                call_stack.pop()
        return tracer

    try:
        compiled = compile(source, FILENAME, "exec")
    except SyntaxError:
        return {
            "steps": [],
            "stdout": "",
            "error": "".join(traceback.format_exc(limit=0)),
            "truncated": False,
        }

    real_stdout = sys.stdout
    namespace = {"__name__": "__main__"}
    sys.stdout = out_buffer
    sys.settrace(tracer)
    try:
        exec(compiled, namespace)
    except Exception:
        error = traceback.format_exc()
    finally:
        sys.settrace(None)
        sys.stdout = real_stdout

    return {
        "steps": steps,
        "stdout": out_buffer.getvalue(),
        "error": error,
        "truncated": truncated,
    }


def trace_to_json(source):
    return json.dumps(trace_code(source))
