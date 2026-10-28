#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ $# -gt 0 ]]; then
  if [[ $# -ne 2 || "$1" != "--baseline-sha" ]]; then
    echo "Usage: bash scripts/agent-validate.sh [--baseline-sha COMMIT]" >&2
    exit 2
  fi
  git rev-parse --verify "${2}^{commit}" > /dev/null
fi

npm ci
npm run ci
npx expo-doctor
