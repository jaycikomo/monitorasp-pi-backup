const fs = require('fs');

console.log('🔧 Ajout de logs de debug...');

let content = fs.readFileSync('server-with-vnstat.js', 'utf8');

// Ajouter des logs de debug après la récupération des données
const debugLogs = `            console.log('🐛 DEBUG - Données récupérées:');
            console.log('🐛 SSID:', tplinkData.wifi.ssid);
            console.log('🐛 Firmware:', tplinkData.system.firmware);
            console.log('🐛 Uptime:', tplinkData.system.uptime);
            console.log('🐛 Structure realTplinkData:', JSON.stringify(realTplinkData.wifi_info));`;

// Insérer après "console.log('✅ Données TP-Link réelles récupérées:'"
const insertPoint = content.indexOf("console.log('✅ Données TP-Link réelles récupérées:'") + 80;
content = content.slice(0, insertPoint) + '\n' + debugLogs + content.slice(insertPoint);

fs.writeFileSync('server-with-vnstat.js', content);
console.log('✅ Logs de debug ajoutés');
