#!/bin/bash

# Protection anti-boucle pour watchdog matériel
# Limite les redémarrages automatiques à 3 maximum

REBOOT_COUNT_FILE="/var/log/hardware_watchdog_reboots"
MAX_REBOOTS=3
RESET_TIME=3600  # 1 heure
LOG_FILE="/var/log/watchdog-protection.log"

# Fonction de log
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Vérifier le compteur de redémarrages
check_reboot_limit() {
    local current_time=$(date +%s)
    
    if [[ ! -f "$REBOOT_COUNT_FILE" ]]; then
        echo "0:$current_time" > "$REBOOT_COUNT_FILE"
        return 0
    fi
    
    local count=$(cut -d: -f1 "$REBOOT_COUNT_FILE")
    local last_reboot=$(cut -d: -f2 "$REBOOT_COUNT_FILE")
    
    # Reset après 1 heure
    if [[ $((current_time - last_reboot)) -gt $RESET_TIME ]]; then
        echo "0:$current_time" > "$REBOOT_COUNT_FILE"
        log_message "Compteur watchdog matériel réinitialisé"
        return 0
    fi
    
    if [[ $count -ge $MAX_REBOOTS ]]; then
        log_message "LIMITE ATTEINTE: $count redémarrages watchdog matériel"
        log_message "DÉSACTIVATION du watchdog pour éviter boucle infinie"
        # Désactiver temporairement le watchdog
        systemctl stop watchdog
        return 1
    fi
    
    # Incrémenter le compteur
    count=$((count + 1))
    echo "$count:$current_time" > "$REBOOT_COUNT_FILE"
    log_message "Redémarrage watchdog matériel $count/$MAX_REBOOTS"
    
    return 0
}

# Vérifier au démarrage
if [[ "$1" == "boot-check" ]]; then
    # Vérifier si le dernier redémarrage était dû au watchdog
    if dmesg | grep -q "watchdog"; then
        log_message "Redémarrage détecté par watchdog matériel"
        if ! check_reboot_limit; then
            exit 1
        fi
    fi
fi

# Reset manuel du compteur
if [[ "$1" == "reset" ]]; then
    echo "0:$(date +%s)" > "$REBOOT_COUNT_FILE"
    log_message "Compteur watchdog matériel réinitialisé manuellement"
    systemctl start watchdog
    log_message "Watchdog matériel redémarré"
fi
