#!/usr/bin/env python3
import os
import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / 'data'

BASELINE = DATA_DIR / 'baseline.db'
DATABASE = DATA_DIR / 'database.db'

def reset_database():
    # Check if baseline exists
    if not BASELINE.exists():
        print("No baseline.db found!")
        print("Run 'python -m backend.scripts.snapshot_db' first")
        return False
    
    # Copy baseline to development
    shutil.copy2(BASELINE, DATABASE)
    print("Database reset to baseline!")
    
    return True

if __name__ == "__main__":
    reset_database()
