const fs = require('fs');

console.log('🔧 Correction de la route /network-demo...');

let content = fs.readFileSync('server-with-vnstat.js', 'utf8');

// Remplacer la structure des données pour être compatible avec le template
const newDemoData = `        const demoData = {
            tplink_real: {
                name: "TP-Link TL-WR841N (DONNÉES RÉELLES)",
                ip: tplinkData.ip,
                type: "router",
                status: "operational",
                online: true,
                responseTime: 25,
                protocol: "http",  // AJOUT du protocole manquant
                wifi_info: {
                    ssid: tplinkData.wifi.ssid,
                    channel: tplinkData.wifi.channel,
                    mode: tplinkData.wifi.mode,
                    bands: [tplinkData.wifi.frequency]
                },
                system_info: {
                    firmware: tplinkData.system.firmware,
                    uptime: tplinkData.system.uptime
                },
                network_services: {
                    estimated_clients: tplinkData.wifi.clients.length
                },
                enterprise_features: {
                    vlan_support: "Non",
                    vpn_tunnels: "Non"
                }
            }
        };`;

// Remplacer l'ancienne structure
content = content.replace(
    /const demoData = {[\s\S]*?};/,
    newDemoData
);

fs.writeFileSync('server-with-vnstat.js', content);
console.log('✅ Structure corrigée pour compatibilité template');
