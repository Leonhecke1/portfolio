#!/bin/bash
# deploy.sh — Portfolio auf Server deployen
# Ausführen mit: bash deploy.sh

set -e

SERVER="leon@192.168.2.48"
REMOTE_DIR="/var/www/portfolio"

echo "==> Build..."
npm run build

echo "==> Dateien übertragen..."
ssh "$SERVER" "mkdir -p $REMOTE_DIR/server $REMOTE_DIR/dist"

# dist + server-Dateien übertragen
scp -r dist/*           "$SERVER:$REMOTE_DIR/dist/"
scp server/server.js    "$SERVER:$REMOTE_DIR/server/"
scp server/planets.json "$SERVER:$REMOTE_DIR/server/"
scp server/package.json "$SERVER:$REMOTE_DIR/server/"

echo "==> Dependencies installieren..."
ssh "$SERVER" "cd $REMOTE_DIR/server && npm install --omit=dev"

echo "==> .env.local übertragen (JWT_SECRET)..."
# Generiere einen zufälligen JWT_SECRET falls noch keiner existiert
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | head -c 32 | base64)
ssh "$SERVER" "
  if [ ! -f $REMOTE_DIR/.env.local ]; then
    echo 'JWT_SECRET=$JWT_SECRET' > $REMOTE_DIR/.env.local
    echo '.env.local erstellt mit JWT_SECRET'
  else
    echo '.env.local existiert bereits, wird nicht überschrieben'
  fi
"

echo "==> Server neustarten (PM2)..."
ssh "$SERVER" "
  cd $REMOTE_DIR
  if command -v pm2 &> /dev/null; then
    pm2 describe portfolio &>/dev/null && pm2 restart portfolio || pm2 start server/server.js --name portfolio
  else
    echo 'PM2 nicht gefunden — manuell starten: node $REMOTE_DIR/server/server.js'
  fi
"

echo ""
echo "✓ Deploy abgeschlossen!"
echo "  Admin:     https://deine-domain.de/admin"
echo "  Beim ersten Aufruf: Admin-Account anlegen"
