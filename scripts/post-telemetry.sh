#!/usr/bin/env bash
# Post one telemetry reading to ThingsBoard (simulates ESP32)
#
# Usage:
#   ./scripts/post-telemetry.sh YOUR_DEVICE_ACCESS_TOKEN
#
# Example:
#   ./scripts/post-telemetry.sh AbCdEf123456
#
# Speed: values follow a deterministic 24h day/night curve (no randomness),
# but a virtual clock is used instead of real wall-clock time so repeated
# calls (e.g. from simulate-device.sh) actually show it moving instead of
# sitting nearly flat for 30s-apart calls. Default 60x — 1 real minute of
# calls covers 1 simulated hour. Override with SIM_SPEED=<multiplier>.
# Reset the virtual clock back to "now" with: rm /tmp/cold-storage-sim-clock

set -euo pipefail

TOKEN="${1:-}"
TB_URL="${THINGSBOARD_URL:-http://localhost:9090}"
SIM_SPEED="${SIM_SPEED:-60}"
STATE_FILE="/tmp/cold-storage-sim-clock"

if [[ -z "$TOKEN" ]]; then
  echo "Usage: ./scripts/post-telemetry.sh YOUR_DEVICE_ACCESS_TOKEN"
  echo ""
  echo "Get the token from ThingsBoard: Device → Manage credentials"
  echo ""
  echo "Optional: SIM_SPEED=<multiplier> ./scripts/post-telemetry.sh TOKEN  (default 60x)"
  exit 1
fi

# Anchor the virtual clock to real wall-clock time on first run, then persist
# it so subsequent calls (including from simulate-device.sh's loop) keep
# advancing from where the last call left off, at SIM_SPEED x real time.
if [[ -f "$STATE_FILE" ]]; then
  read -r ANCHOR_EPOCH ANCHOR_HOUR < "$STATE_FILE"
else
  ANCHOR_EPOCH=$(date +%s)
  ANCHOR_HOUR=$(python3 -c "import datetime; n=datetime.datetime.now(); print(n.hour + n.minute/60 + n.second/3600)")
  echo "$ANCHOR_EPOCH $ANCHOR_HOUR" > "$STATE_FILE"
fi

read -r TEMP HUMIDITY BATTERY SOLAR SIM_CLOCK <<< "$(python3 -c "
import math, time, datetime
anchor_epoch = $ANCHOR_EPOCH
anchor_hour = $ANCHOR_HOUR
speed = $SIM_SPEED

elapsed_real_hours = (time.time() - anchor_epoch) / 3600
h = (anchor_hour + elapsed_real_hours * speed) % 24

temp = 4 + math.sin((h - 6) / 12 * math.pi) * 0.8
humidity = 55 + math.cos((h - 8) / 10 * math.pi) * 12
humidity = max(35, min(85, humidity))
battery = 88 - (h / 24) * 8
battery = max(20, min(100, battery))
solar = max(0, math.sin((h - 6) / 12 * math.pi) * 420) if 6 <= h <= 18 else 0

hh = int(h)
mm = int((h - hh) * 60)
print(round(temp, 1), round(humidity), round(battery), round(solar), f'{hh:02d}:{mm:02d}')
")"

echo "Posting to $TB_URL ... (simulated time-of-day: $SIM_CLOCK, ${SIM_SPEED}x speed)"
echo "  temperature=$TEMP  humidity=$HUMIDITY  battery=$BATTERY  solarPower=$SOLAR"

HTTP_CODE=$(curl -s -o /tmp/tb_post_response.txt -w "%{http_code}" \
  -X POST "$TB_URL/api/v1/$TOKEN/telemetry" \
  -H "Content-Type: application/json" \
  -d "{
    \"temperature\": $TEMP,
    \"humidity\": $HUMIDITY,
    \"battery\": $BATTERY,
    \"solarPower\": $SOLAR,
    \"latitude\": 6.5244,
    \"longitude\": 3.3792,
    \"systemStatus\": \"running\"
  }")

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "✓ Success (HTTP 200) — data sent to ThingsBoard"
else
  echo "✗ Failed (HTTP $HTTP_CODE)"
  cat /tmp/tb_post_response.txt
  echo ""
  echo "Check: Is ThingsBoard running? Is the access token correct?"
  exit 1
fi
