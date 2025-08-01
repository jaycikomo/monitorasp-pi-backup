const fs = require('fs');

console.log('🔧 Ajout du 2ème SSID JOOWIN 5 GHz...');

let content = fs.readFileSync('views/network.ejs', 'utf8');

// Chercher la ligne avec JOOWIN 2 et ajouter JOOWIN 5 GHz juste après
const ssidLine = content.indexOf('SSID: JOOWIN 2');

if (ssidLine !== -1) {
    // Trouver la fin de la ligne
    const endOfLine = content.indexOf('</div>', ssidLine) + 6;
    
    // Ajouter la ligne pour le 5 GHz
    const newLine = '\n                                    <div class="tech-item">📡 SSID 5GHz: JOOWIN 5 GHz</div>';
    
    content = content.slice(0, endOfLine) + newLine + content.slice(endOfLine);
    
    fs.writeFileSync('views/network.ejs', content);
    console.log('✅ 2ème SSID JOOWIN 5 GHz ajouté');
} else {
    console.log('❌ SSID JOOWIN 2 non trouvé');
}
