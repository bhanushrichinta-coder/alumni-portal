#!/usr/bin/env python3
"""
Fix events table schema - remove old columns that don't exist in current model
Run this once to fix the database schema mismatch
"""
import sys
import os
from sqlalchemy import text

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, SessionLocal

def fix_events_schema():
    """Remove old columns from events table if they exist."""
    db = SessionLocal()
    try:
        # Check if old columns exist and drop them
        with engine.connect() as conn:
            # Check what columns exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'events'
            """))
            existing_columns = [row[0] for row in result]
            
            print(f"Existing columns: {existing_columns}")
            
            # Drop old columns if they exist
            columns_to_drop = ['event_type', 'status', 'start_date', 'end_date', 
                             'venue', 'registration_deadline', 'image_url', 
                             'registration_url', 'is_online', 'online_link', 'creator_id']
            
            for col in columns_to_drop:
                if col in existing_columns:
                    try:
                        conn.execute(text(f"ALTER TABLE events DROP COLUMN IF EXISTS {col}"))
                        conn.commit()
                        print(f"✓ Dropped column: {col}")
                    except Exception as e:
                        print(f"⚠ Could not drop {col}: {e}")
            
            # Add new columns if they don't exist
            if 'event_date' not in existing_columns:
                conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date VARCHAR"))
                conn.commit()
                print("✓ Added column: event_date")
            
            if 'event_time' not in existing_columns:
                conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time VARCHAR"))
                conn.commit()
                print("✓ Added column: event_time")
            
            if 'organizer_id' not in existing_columns:
                conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_id VARCHAR"))
                conn.commit()
                print("✓ Added column: organizer_id")
            
            if 'is_virtual' not in existing_columns:
                conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT FALSE"))
                conn.commit()
                print("✓ Added column: is_virtual")
            
            if 'meeting_link' not in existing_columns:
                conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS meeting_link VARCHAR"))
                conn.commit()
                print("✓ Added column: meeting_link")
            
            if 'category' not in existing_columns:
                conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS category VARCHAR"))
                conn.commit()
                print("✓ Added column: category")
            
            if 'attendees_count' not in existing_columns:
                conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS attendees_count INTEGER DEFAULT 0"))
                conn.commit()
                print("✓ Added column: attendees_count")
            
            if 'is_active' not in existing_columns:
                conn.execute(text("ALTER TABLE events ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE"))
                conn.commit()
                print("✓ Added column: is_active")
            
            print("\n✅ Events table schema fixed!")
            
    except Exception as e:
        print(f"❌ Error fixing schema: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Fixing events table schema...")
    fix_events_schema()

