#!/usr/bin/env bash
# Sobe API (porta 3001) e frontend (porta 5173) juntos.
cd "$(dirname "$0")" || exit 1
(cd backend && exec node server.js) &
API_PID=$!
trap 'kill $API_PID 2>/dev/null' EXIT INT TERM
cd frontend && npm run dev
