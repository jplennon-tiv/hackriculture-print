"""Render and check this crop's saved review PDFs."""
from pathlib import Path
import sys

folder = Path(__file__).resolve().parent
sys.path.insert(0, str(folder.parents[3] / "scripts/lib"))
from finish_sowing_crop import finish

if __name__ == "__main__":
    finish(folder)
