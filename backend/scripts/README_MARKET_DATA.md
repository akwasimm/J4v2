# Market Data System Documentation

## Overview
This system stores pre-populated AI market insights in the database for fast access without real-time AI API calls.

## How It Works

1. **Script populates database**: `populate_market_data.py` fetches data from Groq AI for all role+location combinations
2. **API serves from DB**: New endpoint `/api/v1/market/market-insights-db` reads directly from database
3. **Frontend displays**: MarketInsights.jsx fetches from DB with currency toggle support

## Files Created/Modified

### Backend
- `@backend/app/models/ai_pages.py` - Added `MarketData` model
- `@backend/app/routers/market_data.py` - New API endpoints
- `@backend/main.py` - Registered market router
- `@backend/scripts/populate_market_data.py` - Data population script
- `@backend/alembic/versions/add_market_data_table.py` - Database migration

### Frontend
- `@frontend/src/services/insightsService.js` - Added `fetchMarketInsightsDB()`
- `@frontend/src/MarketInsights.jsx` - Updated to use database endpoint

## Default Data

### Roles (8 total)
1. Senior Product Designer
2. Full Stack Developer
3. Marketing Manager
4. Data Scientist
5. UX Researcher
6. DevOps Engineer
7. Product Manager
8. Software Architect

### Locations (15 total)
1. Global (Remote)
2. New York, USA
3. London, UK
4. Singapore
5. San Francisco, USA
6. Berlin, Germany
7. Toronto, Canada
8. Sydney, Australia
9. Dubai, UAE
10. Bangalore, India
11. Mumbai, India
12. Delhi, India
13. Hyderabad, India
14. Chennai, India
15. Pune, India

**Total Combinations**: 8 roles × 15 locations = 120 entries

## Setup Instructions

### 1. Run Database Migration
```bash
cd backend
alembic upgrade head
```

### 2. Set Environment Variable
Ensure `GROQ_API_KEY` is set in your `.env` file:
```bash
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Populate Market Data
```bash
cd backend
python scripts/populate_market_data.py
```

This will take a few minutes as it makes 120 API calls to Groq.

### 4. Check Status
```bash
# View population status
curl http://localhost:8000/api/v1/market/market-insights-db/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# View available combinations
curl http://localhost:8000/api/v1/market/market-insights-db/combinations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Endpoints

### GET /api/v1/market/market-insights-db
Main endpoint for fetching market data.

**Query Parameters:**
- `role` (required) - Job role title
- `location` (required) - Location string
- `show_inr` (optional) - Convert to INR currency

**Example Response:**
```json
{
  "user_id": "...",
  "role": "Full Stack Developer",
  "location": "New York, USA",
  "data": {
    "display_currency": "USD",
    "currency_symbol": "$",
    "inr_available": true,
    "metrics": {
      "min": 80000,
      "median": 120000,
      "max": 180000,
      "currency": "USD"
    },
    "trend": {
      "growth_percentage": 8.5,
      "active_listings": 1240,
      "avg_time_to_hire": 21
    },
    "skills_in_demand": [...],
    "top_hiring_companies": [...],
    "experience_distribution": [...],
    "geographic_distribution": [...],
    "salary_trends": [...],
    "market_summary": "..."
  },
  "source": "database",
  "is_cached": true
}
```

### GET /api/v1/market/market-insights-db/combinations
Returns all available role+location combinations.

### GET /api/v1/market/market-insights-db/status
Returns population status (record count, freshness, etc.)

## Adding More Roles/Locations

### Method 1: Command Line (One-time)
```bash
python scripts/populate_market_data.py \
  --roles "Mobile Developer,AI Engineer" \
  --locations "Tokyo, Japan,Paris, France"
```

### Method 2: Edit Script (Permanent)
Edit `@backend/scripts/populate_market_data.py`:

```python
DEFAULT_ROLES = [
    # ... existing roles ...
    "Mobile Developer",      # Add new
    "AI Engineer",            # Add new
]

DEFAULT_LOCATIONS = [
    # ... existing locations ...
    "Tokyo, Japan",           # Add new
    "Paris, France",          # Add new
]
```

Then run:
```bash
python scripts/populate_market_data.py
```

### Method 3: Force Update All
```bash
# Refresh all data even if exists
python scripts/populate_market_data.py --force
```

## Currency Support

Auto-detected based on location:
- USA, Remote → USD
- UK, London → GBP
- Germany, Berlin → EUR
- Singapore → SGD
- Australia → AUD
- Canada → CAD
- UAE, Dubai → AED
- India → INR

All currencies include INR conversion values for the toggle feature.

## Data Expiration

Data expires after 30 days (configurable in script). Expired data is still served but can be refreshed by running the script again.

## Troubleshooting

### 404 Not Found Error
```
Market data not found for role='X' location='Y'. 
Run: python scripts/populate_market_data.py to populate data.
```

**Solution:** Run the population script for the missing combination.

### Empty Database
```bash
# Check if table exists and has data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM market_data;"

# If 0, run population script
python scripts/populate_market_data.py
```

### Slow Initial Load
The first population takes time (120 API calls). Subsequent updates are faster with `--force` only updating existing records.

### Missing GROQ_API_KEY
```
GROQ_API_KEY not found in environment variables!
```

**Solution:** Add to `.env` file and ensure it's loaded.

## Cron Job (Optional)

To refresh data monthly:
```bash
# Add to crontab
0 2 1 * * cd /path/to/backend && python scripts/populate_market_data.py >> /var/log/market_data.log 2>&1
```

## Notes

- No Perplexity API key needed - uses Groq AI only
- Data is global (not user-specific)
- Fast API response (no AI calls during request)
- Currency toggle works without additional API calls
