#!/usr/bin/env bash
# Quick health check: ThingsBoard reachable + dashboard API routes exist
#
# Usage (with dashboard running on :3000 and TB on :9090):
#   ./scripts/test-integration.sh

set -euo pipefail

TB_URL="${THINGSBOARD_URL:-http://localhost:9090}"
DASHBOARD_URL="${DASHBOARD_URL:-http://localhost:3000}"

echo "=== ThingsBoard Integration Test ==="
echo ""

# 1. ThingsBoard reachable
echo "1. ThingsBoard at $TB_URL ..."
if curl -sf -o /dev/null "$TB_URL/login"; then
  echo "   ✓ ThingsBoard is reachable"
else
  echo "   ✗ Cannot reach ThingsBoard — is Docker running? (docker start thingsboard)"
  exit 1
fi

# 2. TB login
echo ""
echo "2. ThingsBoard login (tenant@thingsboard.org) ..."
TB_TOKEN=$(curl -sf -X POST "$TB_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"tenant@thingsboard.org","password":"tenant"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || true)

if [[ -n "$TB_TOKEN" ]]; then
  echo "   ✓ Login successful"
else
  echo "   ✗ Login failed — check TB credentials or if TB is fully started"
  exit 1
fi

# 3. Device exists
echo ""
echo "3. Tenant devices ..."
DEVICES=$(curl -sf "$TB_URL/api/tenant/devices?pageSize=5&page=0" \
  -H "Authorization: Bearer $TB_TOKEN")
DEVICE_COUNT=$(echo "$DEVICES" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('data',[])))" 2>/dev/null || echo "0")
echo "   Found $DEVICE_COUNT device(s)"

if [[ "$DEVICE_COUNT" == "0" ]]; then
  echo "   ✗ No devices — create one in ThingsBoard UI first"
  exit 1
fi

echo "$DEVICES" | python3 -c "
import sys, json
data = json.load(sys.stdin).get('data', [])
for d in data:
    print(f\"   - {d.get('name','?')}: {d['id']['id']}\")
"

# 4. Dashboard running
echo ""
echo "4. Dashboard at $DASHBOARD_URL ..."
if curl -sf -o /dev/null "$DASHBOARD_URL/login"; then
  echo "   ✓ Dashboard is running"
else
  echo "   ✗ Dashboard not running — start with: npm run dev"
  exit 1
fi

echo ""
echo "=== Backend checks passed ==="
echo ""
echo "Next steps for FULL integration test:"
echo "  1. Set DEV_AUTH_BYPASS=false in .env.local"
echo "  2. Restart: npm run dev"
echo "  3. Post test data: ./scripts/post-telemetry.sh YOUR_ACCESS_TOKEN"
echo "  4. Log into dashboard with tenant@thingsboard.org / tenant"
echo "  5. Overview should say: Live data from ThingsBoard"
