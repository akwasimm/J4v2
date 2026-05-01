#!/usr/bin/env python3
"""Quick test to verify market data setup"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("Testing Market Data Setup...")
print("=" * 50)

# Test 1: Check imports
try:
    from app.models.ai_pages import MarketData
    print("✓ MarketData model imported successfully")
except Exception as e:
    print(f"✗ MarketData import failed: {e}")
    sys.exit(1)

# Test 2: Check database connection
try:
    from app.core.database import SessionLocal
    db = SessionLocal()
    print("✓ Database connection successful")
    db.close()
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    sys.exit(1)

# Test 3: Check table exists
try:
    from sqlalchemy import inspect
    from app.core.database import engine
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if 'market_data' in tables:
        print("✓ market_data table exists")
    else:
        print("✗ market_data table NOT found - run: alembic upgrade head")
except Exception as e:
    print(f"✗ Table check failed: {e}")

# Test 4: Check Groq service
try:
    from app.services.groq_service import call_groq_json
    print("✓ Groq service imported successfully")
except Exception as e:
    print(f"✗ Groq service import failed: {e}")

# Test 5: Check market_data router
try:
    from app.routers.market_data import router
    print("✓ Market data router imported successfully")
except Exception as e:
    print(f"✗ Market data router import failed: {e}")

print("=" * 50)
print("Basic setup verification complete!")
print("\nNext steps:")
print("1. Run: alembic upgrade head")
print("2. Run: python scripts/populate_market_data.py")
print("3. Test API: GET /api/v1/market/market-insights-db/status")
