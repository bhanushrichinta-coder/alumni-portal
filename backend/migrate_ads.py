"""Migration script to add new columns to the ads table."""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.core.database import engine

def migrate_ads_table():
    """Add new columns to the ads table for enhanced ad management."""
    print("Starting ads table migration...")
    
    columns_to_add = {
        'media_url': 'VARCHAR',
        'media_type': "VARCHAR DEFAULT 'image'",
        'link_url': 'VARCHAR',
        'placement': "VARCHAR DEFAULT 'feed'",
        'target_universities': "TEXT DEFAULT '[\"all\"]'",
        'impressions': 'INTEGER DEFAULT 0',
        'clicks': 'INTEGER DEFAULT 0'
    }
    
    with engine.begin() as conn:
        for col_name, col_type in columns_to_add.items():
            try:
                # Check if column exists
                result = conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'ads' AND column_name = '{col_name}'
                """))
                
                if result.fetchone() is None:
                    # Column doesn't exist, add it
                    conn.execute(text(f"ALTER TABLE ads ADD COLUMN {col_name} {col_type}"))
                    print(f"  + Added column: {col_name}")
                else:
                    print(f"  - Column already exists: {col_name}")
            except Exception as e:
                print(f"  ! Error adding {col_name}: {e}")
        
        # Copy data from legacy columns
        try:
            # Copy image to media_url where media_url is null
            result = conn.execute(text("""
                UPDATE ads SET media_url = image 
                WHERE media_url IS NULL AND image IS NOT NULL
            """))
            print(f"  = Copied image to media_url for {result.rowcount} rows")
            
            # Copy link to link_url where link_url is null  
            result = conn.execute(text("""
                UPDATE ads SET link_url = link 
                WHERE link_url IS NULL AND link IS NOT NULL
            """))
            print(f"  = Copied link to link_url for {result.rowcount} rows")
        except Exception as e:
            print(f"  ! Error copying legacy data: {e}")
    
    print("Migration completed!")

if __name__ == "__main__":
    migrate_ads_table()

