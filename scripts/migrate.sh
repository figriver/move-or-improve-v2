#!/bin/bash

# Attempt to deploy migrations
npx prisma migrate deploy

# If it fails with P3005 (schema not empty), mark the migration as deployed and retry
if [ $? -ne 0 ]; then
  echo "Migration failed, attempting to baseline..."
  # Mark the migration as deployed by recording it in _prisma_migrations table
  npx prisma migrate resolve --rolled-back 20260223064802_init
  npx prisma migrate deploy
fi

exit $?
