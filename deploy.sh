#!/bin/bash
# deploy.sh — Admin-Backend auf Server einrichten
# Ausführen mit: bash deploy.sh

set -e

SERVER="leon@192.168.2.48"
REMOTE_DIR="/var/www/vite-app"

echo "==> Server-Dateien übertragen..."
scp server/server.js    "$SERVER:$REMOTE_DIR/server/"
scp server/package.json "$SERVER:$REMOTE_DIR/server/"

echo "==> Dependencies installieren..."
ssh "$SERVER" "cd $REMOTE_DIR/server && npm install --omit=dev"

echo "==> JWT_SECRET setzen (falls noch nicht vorhanden)..."
ssh "$SERVER" "
  if grep -q JWT_SECRET $REMOTE_DIR/.env.local 2>/dev/null; then
    echo '  JWT_SECRET bereits gesetzt, wird nicht überschrieben'
  else
    SECRET=\$(tr -dc 'a-f0-9' < /dev/urandom | head -c 64)
    echo \"JWT_SECRET=\$SECRET\" >> $REMOTE_DIR/.env.local
    echo '  JWT_SECRET generiert und gesetzt'
  fi
"

echo "==> Server neustarten..."
ssh "$SERVER" "
  cd $REMOTE_DIR
  if command -v pm2 &>/dev/null; then
    pm2 describe portfolio &>/dev/null \
      && pm2 restart portfolio \
      || pm2 start server/server.js --name portfolio --env production
    pm2 save
  else
    echo 'PM2 nicht gefunden. Bitte manuell starten: node $REMOTE_DIR/server/server.js'
  fi
"

echo ""
echo "✓ Fertig!"
echo "  Beim ersten Aufruf von /admin: Admin-Account anlegen"
