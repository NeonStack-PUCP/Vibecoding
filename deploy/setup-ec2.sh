#!/bin/bash
# ReportaPe — EC2 Ubuntu 22.04 setup script
# Run as root or with sudo
set -e

echo "=== [1/6] Actualizando paquetes ==="
apt-get update -y && apt-get upgrade -y

echo "=== [2/6] Instalando Docker ==="
apt-get install -y ca-certificates curl gnupg lsb-release
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

echo "=== [3/6] Creando directorio del proyecto ==="
mkdir -p /opt/reportape
chown -R ubuntu:ubuntu /opt/reportape

echo "=== [4/6] Configurando límites del sistema ==="
echo "fs.file-max = 65536" >> /etc/sysctl.conf
sysctl -p

echo "=== [5/6] Abriendo firewall ==="
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 8000/tcp
ufw --force enable

echo "=== [6/6] Listo! ==="
echo "Copia el código con:"
echo "  rsync -avz --exclude='.env' --exclude='node_modules' --exclude='.git' \\"
echo "    ./backend ubuntu@<EC2_IP>:/opt/reportape/"
echo "  scp ./backend/.env ubuntu@<EC2_IP>:/opt/reportape/backend/.env"
echo "  scp ./docker-compose.yml ubuntu@<EC2_IP>:/opt/reportape/"
echo ""
echo "Luego en la instancia:"
echo "  cd /opt/reportape && docker compose up --build -d"
echo ""
echo "Backend disponible en: http://<EC2_IP>:8000/api/health"
