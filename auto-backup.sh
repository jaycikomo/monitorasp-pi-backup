#!/bin/bash

# Script de backup automatique quotidien
cd /home/admin/raspberry-backup

# Exécuter le backup
./backup-script.sh

# Pousser vers GitHub
git add .
git commit -m "Backup automatique du $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo "✅ Backup automatique terminé et envoyé sur GitHub !"
