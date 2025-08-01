const fs = require('fs');

console.log('🔧 Ajout du bouton "Données TP-Link Réelles"...');

let content = fs.readFileSync('views/index.ejs', 'utf8');

// Chercher le bouton "Détails" existant
const detailsButtonRegex = /<a href="\/network-advanced"[^>]*class="btn btn-primary"[^>]*>\s*<i class="fas fa-info-circle"><\/i>\s*Détails\s*<\/a>/;

if (content.match(detailsButtonRegex)) {
    // Remplacer par deux boutons : "Détails" et "Données Réelles"
    const newButtons = `<a href="/network-advanced" class="btn btn-primary me-2">
                        <i class="fas fa-info-circle"></i> Détails
                    </a>
                    <a href="/network-demo" class="btn btn-success">
                        <i class="fas fa-satellite-dish"></i> Données Réelles TP-Link
                    </a>`;
    
    content = content.replace(detailsButtonRegex, newButtons);
    
    fs.writeFileSync('views/index.ejs', content);
    console.log('✅ Bouton "Données Réelles" ajouté au dashboard');
} else {
    console.log('❌ Bouton Détails non trouvé');
}
