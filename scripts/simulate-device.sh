#!/usr/bin/env bash
# Post telemetry every 30 seconds (simulates ESP32 sending data)
#
# Usage:
#   ./scripts/simulate-device.sh YOUR_DEVICE_ACCESS_TOKEN
#
# Values follow a virtual clock that runs 60x faster than real time by
# default (see post-telemetry.sh), so this loop moves through a full
# simulated day roughly every 24 minutes of real time. Override speed with:
#   SIM_SPEED=120 ./scripts/simulate-device.sh YOUR_DEVICE_ACCESS_TOKEN
#
# Stop with Ctrl+C

set -euo pipefail

TOKEN="${1:-}"

if [[ -z "$TOKEN" ]]; then
  echo "Usage: ./scripts/simulate-device.sh YOUR_DEVICE_ACCESS_TOKEN"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Simulating cold storage device — posting every 30s"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  "$SCRIPT_DIR/post-telemetry.sh" "$TOKEN"
  echo "  next reading in 30s..."
  sleep 30
done
