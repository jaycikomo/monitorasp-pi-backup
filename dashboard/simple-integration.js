const fs = require('fs');

console.log('🔧 Intégration simplifiée - Route async...');

let content = fs.readFileSync('server-with-vnstat.js', 'utf8');

// Remplacer la déclaration de route par une version async
content = content.replace(
    /app\.get\('\/network-advanced', \(req, res\) => {/,
    "app.get('/network-advanced', async (req, res) => {"
);

// Ajouter la récupération des données TP-Link au début de la route
const insertPoint = content.indexOf('try {', content.indexOf("app.get('/network-advanced'")) + 4;
const insertText = `
        // Récupération des données TP-Link réelles
        let realTplinkData = {};
        try {
            const tplinkData = await tplinkScraper.getAllData();
            realTplinkData = {
                ssid: tplinkData.wifi.ssid,
                channel: tplinkData.wifi.channel,
                mode: tplinkData.wifi.mode,
                uptime: tplinkData.system.uptime,
                firmware: tplinkData.system.firmware,
                clients: tplinkData.wifi.clients.length
            };
            console.log('✅ Données TP-Link réelles récupérées:', realTplinkData.ssid);
        } catch (error) {
            console.log('⚠️ Fallback vers données par défaut TP-Link');
            realTplinkData = {
                ssid: "MonReseau_2.4G", channel: "6", mode: "Mixed",
                uptime: "15 jours", firmware: "TL-WR841N v13", clients: 8
            };
        }
`;

content = content.slice(0, insertPoint) + insertText + content.slice(insertPoint);

// Remplacer les données statiques par les données réelles
content = content.replace(
    /wifi_info: { ssid: "MonReseau_2\.4G", channel: "6", mode: "Mixed", bands: \["2\.4GHz"\] }/,
    'wifi_info: { ssid: realTplinkData.ssid, channel: realTplinkData.channel, mode: realTplinkData.mode, bands: ["2.4GHz"] }'
);

content = content.replace(
    /system_info: { firmware: "TL-WR841N v13", uptime: "15 jours" }/,
    'system_info: { firmware: realTplinkData.firmware, uptime: realTplinkData.uptime }'
);

content = content.replace(
    /network_services: { estimated_clients: 8 }/,
    'network_services: { estimated_clients: realTplinkData.clients }'
);

fs.writeFileSync('server-with-vnstat.js', content);
console.log('✅ Intégration terminée');
