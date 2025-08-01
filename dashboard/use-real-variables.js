const fs = require('fs');

console.log('🔧 Remplacement des données statiques par les variables réelles...');

let content = fs.readFileSync('server-with-vnstat.js', 'utf8');

// Remplacer les données statiques par les variables dynamiques
content = content.replace(
    'ssid: "MonReseau_2.4G"',
    'ssid: realTPLink.ssid'
);

content = content.replace(
    'firmware: "TL-WR841N v13"',
    'firmware: realTPLink.firmware'
);

content = content.replace(
    'uptime: "15 jours"',
    'uptime: realTPLink.uptime'
);

content = content.replace(
    'estimated_clients: 8',
    'estimated_clients: realTPLink.clients'
);

fs.writeFileSync('server-with-vnstat.js', content);
console.log('✅ Variables dynamiques intégrées');
