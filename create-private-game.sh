#!/bin/bash

URL="http://scia-sdateambld:3000/arena/create"

DEFAULT_COUNTDOWN=60
DEFAULT_GAME_LENGTH=1440

COUNTDOWN=${1:-$DEFAULT_COUNTDOWN}
GAME_LENGTH=${2:-$DEFAULT_GAME_LENGTH}

PAYLOAD='{
  "countdownToStart": '"$COUNTDOWN"',
  "gameLength": '"$GAME_LENGTH"',
  "arenaType": "private",
  "players": [{ "sharkName": "fp-tshrk" }]
}'

curl -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$URL"

echo