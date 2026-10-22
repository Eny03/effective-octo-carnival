import os
import sys

# Set working directory to backend so sqlite:///./politiclens.db points to backend/politiclens.db
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

from app.database import SessionLocal
from app.models import PoliticalParty
from app.ingestion.poll_tracker import run_poll_tracker_pipeline
from app.main import seed_database_if_empty

print("--- Step 1: Run poll tracker pipeline on local DB ---")
db = SessionLocal()
updated = run_poll_tracker_pipeline(db)
print(f"Updated {len(updated)} parties in poll tracker.")
for p in db.query(PoliticalParty).order_by(PoliticalParty.poll_percentage.desc()).limit(6):
    print(f"  {p.code:8} {p.name:28}: {p.poll_percentage}% ({p.poll_trend})")
db.close()

# Record values
db = SessionLocal()
saved_values = {p.code: (p.poll_percentage, p.poll_trend) for p in db.query(PoliticalParty).all()}
db.close()

print("\n--- Step 2: Run seed_database_if_empty() to simulate server restart / spinup ---")
seed_database_if_empty()

print("\n--- Step 3: Verify that poll values were NOT overwritten by seed ---")
db = SessionLocal()
all_preserved = True
for p in db.query(PoliticalParty).all():
    old_val, old_trend = saved_values.get(p.code, (None, None))
    if p.poll_percentage != old_val:
        print(f"FAILED: {p.code} changed from {old_val} to {p.poll_percentage}")
        all_preserved = False

if all_preserved:
    print("SUCCESS! All poll values and trends are 100% PRESERVED across seed_database_if_empty()!")
else:
    print("ERROR: Some values were overwritten!")
db.close()
