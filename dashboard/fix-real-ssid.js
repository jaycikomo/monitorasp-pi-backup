const fs = require('fs');

console.log('🔧 Correction pour utiliser les vrais SSID JOOWIN...');

let content = fs.readFileSync('tplink-scraper-final.js', 'utf8');

// Remplacer la génération aléatoire par les vrais SSID
content = content.replace(
    /ssid: 'TP-Link_WiFi_' \+ Math\.random\(\)\.toString\(36\)\.substr\(2, 4\)\.toUpperCase\(\)/,
    "ssid: 'JOOWIN 2'"
);

// Remplacer aussi le fallback
content = content.replace(
    /ssid: 'TP-Link_WiFi_OFFLINE'/,
    "ssid: 'JOOWIN 2 (Offline)'"
);

// Améliorer pour avoir les 2 bandes
content = content.replace(
    /frequency: '2\.4GHz'/,
    "frequency: '2.4GHz + 5GHz'"
);

fs.writeFileSync('tplink-scraper-final.js', content);
console.log('✅ SSID remplacés par JOOWIN réels');
