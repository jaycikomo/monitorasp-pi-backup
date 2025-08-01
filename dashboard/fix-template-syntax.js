const fs = require('fs');

console.log('🔧 Correction de la syntaxe du template...');

let content = fs.readFileSync('views/network.ejs', 'utf8');

// Remplacer la mauvaise syntaxe par la bonne syntaxe EJS
content = content.replace(
    /{{ SSID_DYNAMIQUE }}/g,
    '<%= device.wifi_info.ssid %>'
);

// Vérifier qu'on a bien la bonne structure
console.log('📋 Lignes SSID dans le template:');
const ssidLines = content.match(/.*SSID.*device\.wifi_info\.ssid.*/g);
if (ssidLines) {
    ssidLines.forEach(line => console.log('  ' + line.trim()));
} else {
    console.log('❌ Aucune ligne SSID trouvée avec la bonne syntaxe');
}

fs.writeFileSync('views/network.ejs', content);
console.log('✅ Template corrigé');
