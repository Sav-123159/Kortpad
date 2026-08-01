#!/usr/bin/env python3
import shutil
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / 'data'

BASELINE = DATA_DIR / 'baseline.db'
DATABASE = DATA_DIR / 'database.db'

def create_snapshot():   
    if not DATABASE.exists():
        print("No database.db found! Create data first.")
        return False
    
    # Copy current database to baseline
    shutil.copy2(DATABASE, BASELINE)
    print("New baseline snapshot created!")
    print(f"File: {BASELINE}")
    
    return True

if __name__ == "__main__":
    create_snapshot()
