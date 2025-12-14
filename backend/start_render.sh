#!/bin/bash
# Render startup script - ensures correct paths
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to backend directory (where app module is)
cd "$SCRIPT_DIR" || exit 1

# Set PYTHONPATH to include current directory
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH}"

# Verify we can import
python3 -c "import sys; sys.path.insert(0, '.'); from app.main import app; print('✅ App import verified')" || {
    echo "❌ Failed to import app module"
    echo "Current directory: $(pwd)"
    echo "Python path: $PYTHONPATH"
    echo "Contents: $(ls -la)"
    exit 1
}

# Start uvicorn
exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

