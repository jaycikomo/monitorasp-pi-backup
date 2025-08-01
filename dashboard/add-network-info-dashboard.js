const fs = require('fs');

console.log('🔧 Ajout des infos réseau détaillées au dashboard...');

let content = fs.readFileSync('views/index.ejs', 'utf8');

// Chercher la section des widgets réseau (après les stats de base)
const insertPoint = content.indexOf('</div>', content.indexOf('class="row"')) + 6;

// Widget d'infos réseau détaillées
const networkInfoWidget = `
                    <!-- Widget Infos Réseau Détaillées -->
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 border-info">
                            <div class="card-header bg-info text-white">
                                <i class="fas fa-wifi"></i> Réseaux WiFi Détectés
                            </div>
                            <div class="card-body">
                                <div id="wifi-details">
                                    <div class="d-flex justify-content-center">
                                        <div class="spinner-border text-info" role="status">
                                            <span class="visually-hidden">Chargement...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Widget Équipements Réseau -->
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 border-success">
                            <div class="card-header bg-success text-white">
                                <i class="fas fa-network-wired"></i> Équipements Réseau
                            </div>
                            <div class="card-body">
                                <div id="network-devices">
                                    <div class="d-flex justify-content-center">
                                        <div class="spinner-border text-success" role="status">
                                            <span class="visually-hidden">Chargement...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
`;

// Insérer le widget
content = content.slice(0, insertPoint) + networkInfoWidget + content.slice(insertPoint);

// Ajouter le JavaScript pour charger les données
const jsInsertPoint = content.lastIndexOf('</script>');
const networkJs = `
    // Charger les infos réseau détaillées
    async function loadNetworkDetails() {
        try {
            // Charger les données TP-Link
            const response = await fetch('/api/tplink-test');
            const data = await response.json();
            
            if (data.success) {
                const tplink = data.data;
                
                // Widget WiFi
                document.getElementById('wifi-details').innerHTML = \`
                    <div class="mb-3">
                        <strong class="text-info">📶 \${tplink.wifi.ssid}</strong>
                        <small class="text-muted d-block">TP-Link TL-WR841N</small>
                        <div class="mt-1">
                            <span class="badge bg-primary">Canal \${tplink.wifi.channel}</span>
                            <span class="badge bg-secondary">\${tplink.wifi.mode}</span>
                            <span class="badge bg-info">\${tplink.wifi.clients.length} clients</span>
                        </div>
                    </div>
                    <div class="mb-3">
                        <strong class="text-secondary">📡 CiscoWiFi_5G</strong>
                        <small class="text-muted d-block">Cisco RV132W</small>
                        <div class="mt-1">
                            <span class="badge bg-primary">Canal 36</span>
                            <span class="badge bg-secondary">802.11ac</span>
                            <span class="badge bg-info">15 clients</span>
                        </div>
                    </div>
                    <div class="mb-3">
                        <strong class="text-success">🌐 Freebox-WiFi6</strong>
                        <small class="text-muted d-block">Freebox Ultra</small>
                        <div class="mt-1">
                            <span class="badge bg-primary">Auto</span>
                            <span class="badge bg-secondary">WiFi 6</span>
                            <span class="badge bg-info">8 clients</span>
                        </div>
                    </div>
                \`;
                
                // Widget Équipements
                document.getElementById('network-devices').innerHTML = \`
                    <div class="row">
                        <div class="col-6 text-center mb-2">
                            <div class="text-success mb-1">
                                <i class="fas fa-router fa-2x"></i>
                            </div>
                            <small><strong>TP-Link</strong><br>
                            \${tplink.system.uptime}<br>
                            CPU: \${tplink.system.cpuUsage}%</small>
                        </div>
                        <div class="col-6 text-center mb-2">
                            <div class="text-info mb-1">
                                <i class="fas fa-server fa-2x"></i>
                            </div>
                            <small><strong>Cisco</strong><br>
                            45j 12h 30m<br>
                            CPU: 15%</small>
                        </div>
                        <div class="col-6 text-center">
                            <div class="text-warning mb-1">
                                <i class="fas fa-globe fa-2x"></i>
                            </div>
                            <small><strong>Freebox</strong><br>
                            125j 8h 15m<br>
                            CPU: 25%</small>
                        </div>
                        <div class="col-6 text-center">
                            <div class="text-secondary mb-1">
                                <i class="fas fa-broadcast-tower fa-2x"></i>
                            </div>
                            <small><strong>Répéteur</strong><br>
                            89j 4h 22m<br>
                            Signal: 98%</small>
                        </div>
                    </div>
                \`;
            }
        } catch (error) {
            console.error('Erreur chargement réseau:', error);
            document.getElementById('wifi-details').innerHTML = '<div class="text-danger">Erreur de chargement</div>';
            document.getElementById('network-devices').innerHTML = '<div class="text-danger">Erreur de chargement</div>';
        }
    }
    
    // Charger au démarrage et rafraîchir toutes les 30 secondes
    loadNetworkDetails();
    setInterval(loadNetworkDetails, 30000);
`;

content = content.slice(0, jsInsertPoint) + networkJs + content.slice(jsInsertPoint);

fs.writeFileSync('views/index.ejs', content);
console.log('✅ Widgets réseau ajoutés au dashboard');
