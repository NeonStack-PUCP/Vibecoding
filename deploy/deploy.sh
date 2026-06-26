#!/bin/bash
# ReportaPe — deploy a EC2 en un solo comando
# Uso: ./deploy/deploy.sh <EC2_PUBLIC_IP> <KEY_FILE.pem>
# Ejemplo: ./deploy/deploy.sh 3.82.45.123 ~/Downloads/mi-key.pem

set -e

EC2_IP="${1:?Falta la IP de EC2. Uso: $0 <IP> <KEY.pem>}"
KEY_FILE="${2:?Falta el archivo .pem. Uso: $0 <IP> <KEY.pem>}"
SSH="ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$EC2_IP"

echo "▶ Copiando código al servidor $EC2_IP..."
rsync -avz --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.env' \
  --exclude='.venv' \
  --exclude='alembic/versions/*.pyc' \
  -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
  backend/ "ubuntu@$EC2_IP:/opt/reportape/backend/"

echo "▶ Copiando .env..."
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no \
  backend/.env "ubuntu@$EC2_IP:/opt/reportape/backend/.env"

echo "▶ Copiando docker-compose.yml..."
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no \
  docker-compose.yml "ubuntu@$EC2_IP:/opt/reportape/docker-compose.yml"

echo "▶ Copiando Dockerfile..."
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no \
  backend/Dockerfile "ubuntu@$EC2_IP:/opt/reportape/backend/Dockerfile"

echo "▶ Iniciando servicios en el servidor..."
$SSH "cd /opt/reportape && docker compose pull || true && docker compose up --build -d"

echo "▶ Esperando que el API levante (30s)..."
sleep 30

echo "▶ Verificando salud del servidor..."
curl -s "http://$EC2_IP:8000/api/health" | python3 -m json.tool || echo "Aún iniciando..."

echo ""
echo "✅ Deploy completo!"
echo "   Backend: http://$EC2_IP:8000"
echo "   Health:  http://$EC2_IP:8000/api/health"
echo "   Docs:    http://$EC2_IP:8000/api/docs"
echo ""
echo "👉 Ahora actualiza mobile/app.json:"
echo '   "extra": { "apiUrl": "http://'"$EC2_IP"':8000" }'
echo ""
echo "👉 Luego construye el APK:"
echo "   cd mobile && npx eas build --platform android --profile preview"
