#!/bin/bash

# Script de surveillance des interfaces réseau critiques avec protection anti-boucle
# Redémarre max 3 fois, puis s'arrête pour éviter les redémarrages infinis

LOG_FILE="/var/log/interface-watchdog.log"
DOWN_TIME_FILE="/tmp/interface_down_times"
REBOOT_COUNT_FILE="/var/log/watchdog_reboots"
RESTART_THRESHOLD=180  # 3 minutes en secondes
MAX_REBOOTS=3  # Maximum 3 redémarrages consécutifs
RESET_TIME=3600  # Reset compteur après 1 heure sans problème
INTERFACES=("eth0" "wlan0" "wlan1")

# Fonction de log
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Vérifier l'état d'une interface
check_interface() {
    local interface=$1
    local status=$(cat /sys/class/net/$interface/operstate 2>/dev/null)
    
    if [[ "$status" == "up" ]]; then
        return 0  # Interface UP
    else
        return 1  # Interface DOWN
    fi
}

# Gérer le compteur de redémarrages
manage_reboot_counter() {
    local action=$1
    local current_time=$(date +%s)
    
    if [[ ! -f "$REBOOT_COUNT_FILE" ]]; then
        echo "0:$current_time" > "$REBOOT_COUNT_FILE"
        return 0
    fi
    
    local count=$(cut -d: -f1 "$REBOOT_COUNT_FILE")
    local last_reboot=$(cut -d: -f2 "$REBOOT_COUNT_FILE")
    
    # Si plus d'1 heure s'est écoulée depuis le dernier problème, reset le compteur
    if [[ $((current_time - last_reboot)) -gt $RESET_TIME ]]; then
        echo "0:$current_time" > "$REBOOT_COUNT_FILE"
        count=0
        log_message "Compteur de redémarrages réinitialisé (plus d'1h sans problème)"
    fi
    
    case $action in
        "check")
            echo $count
            ;;
        "increment")
            count=$((count + 1))
            echo "$count:$current_time" > "$REBOOT_COUNT_FILE"
            log_message "Compteur de redémarrages: $count/$MAX_REBOOTS"
            echo $count
            ;;
        "reset")
            echo "0:$current_time" > "$REBOOT_COUNT_FILE"
            log_message "Compteur de redémarrages réinitialisé (toutes interfaces OK)"
            ;;
    esac
}

# Vérifier si toutes les interfaces critiques sont UP
all_interfaces_up() {
    for interface in "${INTERFACES[@]}"; do
        if [[ -d "/sys/class/net/$interface" ]]; then
            if ! check_interface "$interface"; then
                return 1  # Au moins une interface DOWN
            fi
        fi
    done
    return 0  # Toutes les interfaces UP
}

# Initialiser les fichiers si inexistants
if [[ ! -f "$DOWN_TIME_FILE" ]]; then
    touch "$DOWN_TIME_FILE"
fi

# Vérifier si toutes les interfaces sont UP pour reset le compteur
if all_interfaces_up; then
    # Si toutes les interfaces sont UP depuis plus de 10 minutes, reset le compteur
    if [[ -f "$REBOOT_COUNT_FILE" ]]; then
        last_time=$(cut -d: -f2 "$REBOOT_COUNT_FILE" 2>/dev/null || echo "0")
        current_time=$(date +%s)
        if [[ $((current_time - last_time)) -gt 600 ]]; then  # 10 minutes
            manage_reboot_counter "reset"
        fi
    fi
fi

# Vérifier chaque interface critique
restart_needed=false
problematic_interface=""

for interface in "${INTERFACES[@]}"; do
    # Vérifier si l'interface existe
    if [[ ! -d "/sys/class/net/$interface" ]]; then
        continue
    fi
    
    if check_interface "$interface"; then
        # Interface UP - supprimer l'entrée du fichier de temps
        sed -i "/^$interface:/d" "$DOWN_TIME_FILE"
        log_message "Interface $interface est UP"
    else
        # Interface DOWN
        current_time=$(date +%s)
        
        # Vérifier si on a déjà un timestamp pour cette interface
        if grep -q "^$interface:" "$DOWN_TIME_FILE"; then
            # Récupérer le timestamp existant
            down_start=$(grep "^$interface:" "$DOWN_TIME_FILE" | cut -d: -f2)
            down_duration=$((current_time - down_start))
            
            log_message "Interface $interface DOWN depuis ${down_duration}s"
            
            # Vérifier si le seuil est dépassé
            if [[ $down_duration -ge $RESTART_THRESHOLD ]]; then
                restart_needed=true
                problematic_interface="$interface"
                break
            fi
        else
            # Première fois que l'interface est DOWN
            echo "$interface:$current_time" >> "$DOWN_TIME_FILE"
            log_message "Interface $interface vient de passer DOWN à $(date)"
        fi
    fi
done

# Si un redémarrage est nécessaire, vérifier le compteur
if [[ "$restart_needed" == "true" ]]; then
    current_reboot_count=$(manage_reboot_counter "check")
    
    log_message "ALERTE: Interface $problematic_interface DOWN depuis plus de $RESTART_THRESHOLD secondes!"
    
    if [[ $current_reboot_count -ge $MAX_REBOOTS ]]; then
        log_message "SÉCURITÉ: Limite de $MAX_REBOOTS redémarrages atteinte!"
        log_message "ARRÊT DES TENTATIVES DE REDÉMARRAGE pour éviter une boucle infinie"
        log_message "Intervention manuelle requise ou attendre 1h pour reset automatique"
        
        # Optionnel: envoyer une notification critique
        # echo "CRITIQUE: Raspberry Pi a arrêté de redémarrer après $MAX_REBOOTS tentatives" | mail -s "Watchdog Stopped" admin@domain.com
        
        exit 1
    else
        new_count=$(manage_reboot_counter "increment")
        log_message "REDÉMARRAGE $new_count/$MAX_REBOOTS INITIÉ pour interface $problematic_interface"
        
        # Nettoyer les fichiers temporaires avant redémarrage
        rm -f "$DOWN_TIME_FILE"
        
        # Redémarrer le système
        /sbin/reboot
        exit 0
    fi
fi

# Nettoyer le fichier des entrées obsolètes (plus de 24h)
current_time=$(date +%s)
temp_file=$(mktemp)
while IFS=: read -r iface timestamp; do
    if [[ $((current_time - timestamp)) -lt 86400 ]]; then
        echo "$iface:$timestamp" >> "$temp_file"
    fi
done < "$DOWN_TIME_FILE" 2>/dev/null
if [[ -f "$temp_file" ]]; then
    mv "$temp_file" "$DOWN_TIME_FILE"
fi
