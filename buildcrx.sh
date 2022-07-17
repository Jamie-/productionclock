#!/bin/bash

if test $# -ne 1; then
  echo "Usage: buildcrx.sh <pem path>"
  exit 1
fi

FILE_KEY="$1"
BASENAME="productionclock"
FILE_CRX="$BASENAME.crx"
FILE_PUB="$BASENAME.pub"
FILE_SIG="$BASENAME.sig"
FILE_ZIP="$BASENAME.zip"
FILE_TOSIGN="$BASENAME.presig"
FILE_CRX_ID="$BASENAME.crxid"
trap 'rm -f "$FILE_PUB" "$FILE_SIG" "$FILE_ZIP" "$FILE_TOSIGN" "$FILE_CRX_ID"' EXIT

set -ex

# Zip up extension data
zip -qr -9 -X "$FILE_ZIP" \
  lib \
  styles \
  clock.png \
  manifest.json \
  *.js \
  *.html

# Extract CRX ID
openssl rsa -in "$FILE_KEY" -pubout -outform der | openssl dgst -sha256 -binary -out "$FILE_CRX_ID"
truncate -s 16 "$FILE_CRX_ID"

# Generate file to sign
(
  printf "CRX3 SignedData"
  echo "00 12 00 00 00 0A 10" | xxd -r -p
  cat "$FILE_CRX_ID" "$FILE_ZIP"
) > "$FILE_TOSIGN"

# Generate signature
openssl dgst -sha256 -binary -sign "$FILE_KEY" < "$FILE_TOSIGN" > "$FILE_SIG"

# Extract public key
openssl rsa -pubout -outform DER < "$FILE_KEY" > "$FILE_PUB" 2>/dev/null

CRMAGIC_HEX="43 72 32 34" # Cr24
VERSION_HEX="03 00 00 00" # 3
HEADER_LENGTH="45 02 00 00"
HEADER_CHUNK_1="12 AC 04 0A A6 02"
HEADER_CHUNK_2="12 80 02"
HEADER_CHUNK_3="82 F1 04 12 0A 10"
# Or for a future 4096-bit key:
# HEADER_LENGTH="45 04 00 00"
# HEADER_CHUNK_1="12 AC 08 0A A6 04"
# HEADER_CHUNK_2="12 80 04"

(
  echo "$CRMAGIC_HEX $VERSION_HEX $HEADER_LENGTH $HEADER_CHUNK_1" | xxd -r -p
  cat "$FILE_PUB"
  echo "$HEADER_CHUNK_2" | xxd -r -p
  cat "$FILE_SIG"
  echo "$HEADER_CHUNK_3" | xxd -r -p
  cat "$FILE_CRX_ID" "$FILE_ZIP"
) > "$FILE_CRX"
echo "Wrote $FILE_CRX"
