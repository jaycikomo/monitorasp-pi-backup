const fs = require('fs');

console.log('🔧 Ajout de l\'affichage du SSID dans la page...');

let content = fs.readFileSync('views/network.ejs', 'utf8');

// Chercher où ajouter le SSID (près des infos techniques)
const insertPoint = content.indexOf('📶 Canal WiFi:');

if (insertPoint !== -1) {
    // Ajouter le SSID avant le canal
    const ssidLine = '                                    <div class="tech-item">📡 SSID: <%= device.wifi_info.ssid %></div>\n                                    ';
    
    content = content.slice(0, insertPoint) + ssidLine + content.slice(insertPoint);
    
    fs.writeFileSync('views/network.ejs', content);
    console.log('✅ Affichage du SSID ajouté au template');
} else {
    console.log('❌ Point d\'insertion non trouvé');
}
