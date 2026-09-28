"""Refresh planner stats after the bulk insert, then re-time the hot queries."""
import time
from sqlalchemy import text
from app.core.database import engine

with engine.begin() as c:
    for t in ["jobs", "saved_jobs", "job_applications", "user_skills",
              "user_experience", "user_education", "users", "user_settings"]:
        c.execute(text(f"analyze public.{t}"))
    print("analyzed 8 tables")

def timed(label, sql):
    t0 = time.time()
    with engine.connect() as c:
        r = c.execute(text(sql)).fetchall()
    print(f"  {label:44} {time.time()-t0:7.2f}s")

print("=== re-timed after ANALYZE ===")
timed("count(*) is_active=true", "select count(*) from public.jobs where is_active = true")
timed("select 3 rows ordered by posted_at",
      "select id, title from public.jobs where is_active = true order by posted_at desc limit 3")
