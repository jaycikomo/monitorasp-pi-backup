const fs = require('fs');

console.log('🔧 Correction de la structure des données...');

let content = fs.readFileSync('server-with-vnstat.js', 'utf8');

// Problème : nous utilisons realTplinkData.system_info.firmware
// Mais les données API sont dans tplinkData.system.firmware

// Corriger la structure des données dans la route
const fixedStructure = `                wifi_info: {
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
                }`;

// Remplacer l'ancienne structure
content = content.replace(
    /wifi_info: {[\s\S]*?estimated_clients: tplinkData\.wifi\.clients\.length[\s\S]*?}/,
    fixedStructure
);

fs.writeFileSync('server-with-vnstat.js', content);
console.log('✅ Structure des données corrigée');
