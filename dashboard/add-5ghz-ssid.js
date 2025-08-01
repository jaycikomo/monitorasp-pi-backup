const fs = require('fs');

let content = fs.readFileSync('views/network.ejs', 'utf8');

// Chercher la ligne avec le SSID et ajouter le 5GHz après
const ssidLineRegex = /<div class="tech-item">📡 SSID: <%= device\.wifi_info\.ssid %><\/div>/;

if (content.match(ssidLineRegex)) {
    const replacement = `<div class="tech-item">📡 SSID 2.4GHz: <%= device.wifi_info.ssid %></div>
                                    <div class="tech-item">📡 SSID 5GHz: JOOWIN 5 GHz</div>`;
    
    content = content.replace(ssidLineRegex, replacement);
    
    fs.writeFileSync('views/network.ejs', content);
    console.log('✅ SSID 5GHz ajouté');
} else {
    console.log('❌ Ligne SSID non trouvée');
}
