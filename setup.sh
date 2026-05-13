#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
#  GPS Navigator — Quick Setup Script
# ─────────────────────────────────────────────────────────
set -e

echo ""
echo "🗺️  GPS Navigator Setup"
echo "═══════════════════════════════════════"

# ── Backend ──────────────────────────────────────────────
echo ""
echo "📦 Setting up Python backend..."
cd backend
pip install -r requirements.txt --quiet
echo "✓ Backend dependencies installed"
cd ..

# ── Frontend ─────────────────────────────────────────────
echo ""
echo "⚛️  Setting up React frontend..."
cd frontend
npm install --silent
echo "✓ Frontend dependencies installed"
cd ..

echo ""
echo "═══════════════════════════════════════"
echo "✅ Setup complete!"
echo ""
echo "To run the project:"
echo ""
echo "  Terminal 1 (Backend):"
echo "  ─────────────────────"
echo "  cd backend && python app.py"
echo "  → API: http://localhost:5000"
echo ""
echo "  Terminal 2 (Frontend):"
echo "  ─────────────────────"
echo "  cd frontend && npm run dev"
echo "  → App: http://localhost:3000"
echo ""
