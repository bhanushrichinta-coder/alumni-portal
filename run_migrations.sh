#!/bin/bash
# Script to run database migrations on Render
# This can be used as a pre-deploy command in Render settings

set -e

echo "🔄 Running database migrations..."
alembic upgrade head

echo "✅ Migrations completed successfully!"

# Optional: Initialize database with seed data
# Uncomment the line below if you want to run init_db on every deploy
# python -m app.db.init_db

