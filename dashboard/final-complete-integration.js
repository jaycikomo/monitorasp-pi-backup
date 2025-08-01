const fs = require('fs');

console.log('🔧 Intégration COMPLÈTE de toutes les données réelles...');

let content = fs.readFileSync('server-with-vnstat.js', 'utf8');

// Remplacer TOUTES les données statiques restantes
content = content.replace('channel: "6"', 'channel: realTPLink.channel');
content = content.replace('mode: "Mixed"', 'mode: realTPLink.mode');

// Dans le code d'injection, ajouter les données manquantes
const injectionRegex = /(realTPLink\.clients = tpData\.wifi\.clients\.length;)/;
const additionalData = `$1
            realTPLink.channel = tpData.wifi.channel;
            realTPLink.mode = tpData.wifi.mode;`;

content = content.replace(injectionRegex, additionalData);

// Dans le fallback aussi
const fallbackRegex = /(realTPLink\.clients = 8;)/;
const fallbackAdditional = `$1
            realTPLink.channel = "6";
            realTPLink.mode = "Mixed";`;

content = content.replace(fallbackRegex, fallbackAdditional);

fs.writeFileSync('server-with-vnstat.js', content);
console.log('✅ Toutes les données réelles intégrées');
