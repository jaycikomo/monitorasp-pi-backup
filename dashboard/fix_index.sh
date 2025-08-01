#!/bin/bash

echo "🔧 Correction du fichier index.ejs..."

# Fichier à corriger
FILE="/home/admin/vnstat-web-dashboard/views/index.ejs"

# Sauvegarde avant correction
cp "$FILE" "${FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Sauvegarde créée"

# Créer un fichier temporaire avec le contenu corrigé
TEMP_FILE="/tmp/index_fixed.ejs"

# Partie 1: Prendre tout jusqu'à la ligne 794
sed -n '1,794p' "$FILE" > "$TEMP_FILE"

# Partie 2: Ajouter le code JavaScript bien placé
cat >> "$TEMP_FILE" << 'EOF'
        // ========================================
        // INITIALISATION AU CHARGEMENT
        // ========================================
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 Page chargée, initialisation...');
            testNetwork();
            setTimeout(function() {
                console.log('⏰ Lancement du test automatique...');
                testNetwork();
            }, 2000);
            setInterval(function() {
                console.log('🔄 Refresh automatique...');
                testNetwork();
            }, 60000);
        });
        
        function debugNetwork() {
            console.log('🔍 Debug réseau...');
            fetch('/api/network-minimal')
                .then(response => response.json())
                .then(data => console.log('🔍 Données API:', data))
                .catch(error => console.error('🔍 Erreur API:', error));
        }
EOF

# Partie 3: Fermer proprement
echo "    </script>" >> "$TEMP_FILE"
echo "</body>" >> "$TEMP_FILE"
echo "</html>" >> "$TEMP_FILE"

# Remplacer le fichier original
mv "$TEMP_FILE" "$FILE"

echo "✅ Fichier corrigé !"
systemctl restart vnstat-dashboard.service
echo "🌐 Testez : http://192.168.1.200:3000"
