"""BigConfig Python API.

The Python rewrite keeps the original map-threading workflow model.
Namespaced keys are represented as strings, e.g. ``"big-config/exit"``.
"""

EXIT = "big-config/exit"
ERR = "big-config/err"
STACK_TRACE = "big-config/stack-trace"
ENV = "big-config/env"
PROCS = "big-config/procs"
STEPS = "big-config/steps"
TEST_MODE = "big-config/test-mode"

__all__ = ["EXIT", "ERR", "STACK_TRACE", "ENV", "PROCS", "STEPS", "TEST_MODE"]
