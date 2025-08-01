const fs = require('fs');

console.log('🔧 Correction pour utiliser les VRAIES données...');

let content = fs.readFileSync('server-with-vnstat.js', 'utf8');

// Remplacer les données statiques par les données dynamiques
content = content.replace(
    /firmware: "TL-WR841N v13"/g,
    'firmware: realTplinkData.system_info.firmware'
);

content = content.replace(
    /uptime: "15 jours"/g, 
    'uptime: realTplinkData.system_info.uptime'
);

content = content.replace(
    /ssid: "MonReseau_2\.4G"/g,
    'ssid: realTplinkData.wifi_info.ssid'
);

content = content.replace(
    /estimated_clients: 8/g,
    'estimated_clients: realTplinkData.network_services.estimated_clients'
);

fs.writeFileSync('server-with-vnstat.js', content);
console.log('✅ Données statiques remplacées par données dynamiques');
