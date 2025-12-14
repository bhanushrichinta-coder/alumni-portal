#!/usr/bin/env python3
"""
Manual seed script for Render
Run this via Render Shell to seed the database
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from seed_data import main

if __name__ == "__main__":
    print("🌱 Starting manual database seeding...")
    main()
    print("✅ Seeding complete!")

