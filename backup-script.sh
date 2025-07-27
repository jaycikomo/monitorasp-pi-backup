#!/bin/bash

# Script de backup automatique Raspberry Pi
# Sauvegarde toutes les configurations importantes

BACKUP_DIR="/home/admin/raspberry-backup"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

echo "🚀 Début du backup - $DATE"

# Créer les répertoires de backup
mkdir -p "$BACKUP_DIR/configs"
mkdir -p "$BACKUP_DIR/scripts"
mkdir -p "$BACKUP_DIR/services"
mkdir -p "$BACKUP_DIR/dashboard"
mkdir -p "$BACKUP_DIR/wireguard"
mkdir -p "$BACKUP_DIR/system"

# Backup dashboard
echo "📊 Backup dashboard..."
cp -r /home/admin/vnstat-web-dashboard/* "$BACKUP_DIR/dashboard/" 2>/dev/null

# Backup scripts de surveillance
echo "🔍 Backup scripts surveillance..."
cp /home/admin/interface-watchdog.sh "$BACKUP_DIR/scripts/" 2>/dev/null
cp /usr/local/bin/watchdog-protection.sh "$BACKUP_DIR/scripts/" 2>/dev/null

# Backup configurations WireGuard
echo "🔐 Backup WireGuard..."
sudo cp -r /etc/wireguard/* "$BACKUP_DIR/wireguard/" 2>/dev/null
cp -r /home/admin/configs/* "$BACKUP_DIR/wireguard/" 2>/dev/null

# Backup configurations système importantes
echo "⚙️ Backup configurations système..."
sudo cp /etc/nut/ups.conf "$BACKUP_DIR/configs/" 2>/dev/null
sudo cp /etc/nut/nut.conf "$BACKUP_DIR/configs/" 2>/dev/null
sudo cp /etc/nut/upsd.conf "$BACKUP_DIR/configs/" 2>/dev/null
sudo cp /etc/nut/hosts.conf "$BACKUP_DIR/configs/" 2>/dev/null

# Backup services systemd
echo "🔧 Backup services..."
sudo cp /etc/systemd/system/vnstat-dashboard.service "$BACKUP_DIR/services/" 2>/dev/null
sudo cp /etc/systemd/system/watchdog-protection.service "$BACKUP_DIR/services/" 2>/dev/null

# Backup crontab
echo "⏰ Backup crontab..."
sudo crontab -l > "$BACKUP_DIR/system/crontab-backup.txt" 2>/dev/null

# Backup configuration réseau
echo "🌐 Backup réseau..."
sudo cp /etc/dhcpcd.conf "$BACKUP_DIR/system/" 2>/dev/null
sudo cp /etc/wpa_supplicant/wpa_supplicant.conf "$BACKUP_DIR/system/" 2>/dev/null

# Backup logs de monitoring
echo "📋 Backup logs..."
mkdir -p "$BACKUP_DIR/logs"
cp /var/log/interface-watchdog.log "$BACKUP_DIR/logs/" 2>/dev/null
cp /var/log/watchdog-protection.log "$BACKUP_DIR/logs/" 2>/dev/null
cp /home/admin/vnstat-web-dashboard/monitoring-data.json "$BACKUP_DIR/logs/" 2>/dev/null

# Créer un fichier d'informations système
echo "💾 Informations système..."
cat > "$BACKUP_DIR/system/system-info.txt" << EOF
Backup créé le: $DATE
Raspberry Pi Model: $(cat /proc/device-tree/model 2>/dev/null)
OS Version: $(cat /etc/os-release | grep PRETTY_NAME)
Kernel: $(uname -r)
Uptime: $(uptime)
Services actifs:
$(systemctl list-units --state=active --no-pager | grep -E "(vnstat|watchdog|nut)")
EOF

# Ajouter au Git
echo "📦 Ajout au Git..."
cd "$BACKUP_DIR"
git add .
git commit -m "Backup automatique du $DATE"

echo "✅ Backup terminé - $DATE"
echo "📁 Fichiers sauvegardés dans: $BACKUP_DIR"
