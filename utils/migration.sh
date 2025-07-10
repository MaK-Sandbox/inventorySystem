#! /usr/bin/bash
# Exit immediately if any command fails
set -e

# read our .env file
. .env

if [ ! -d ./backup ]; then 
  mkdir backup
fi

if [ -f $DB_FILE ]; then 
  cp -a $DB_FILE ./backup/"$(date +%s)-$DB_FILE"
fi

# extract first argument, if not existing, then set MAX_DATE -9999-99-99
MAX_DATE=${1:-9999-99-99}

# Path to migrations
MIGRATIONS_DIR="./migrations"

# Loop through sorted files
for FILE in $(ls "$MIGRATIONS_DIR" | sort); do
  # Extract the date prefix (first 10 characters)
  DATE=$(echo "$FILE" | cut -c1-10)
  
  # Compare and run
  if [[ "$DATE" < "$MAX_DATE" ]] || [[ "$DATE" == "$MAX_DATE" ]]; then
    echo "Running migration: $FILE"
    node --env-file=.env "$MIGRATIONS_DIR/$FILE"
  fi
done
