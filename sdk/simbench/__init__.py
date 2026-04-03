"""SimBench — Gymnasium-compatible SDK for web agent training & evaluation."""

from simbench.env import SimBenchEnv, make
from simbench.curriculum import CurriculumRunner
from simbench.client import SimBenchClient, SimBenchError
from simbench.runner import BatchRunner

__version__ = "0.1.0"
__all__ = [
    "SimBenchEnv", "make", "CurriculumRunner", "SimBenchClient",
    "SimBenchError", "BatchRunner",
]
