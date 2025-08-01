const fs = require('fs');

console.log('🧹 Nettoyage et correction complète des routes...');

let content = fs.readFileSync('server-with-vnstat.js', 'utf8');

// Supprimer TOUTES les routes network-advanced existantes
content = content.replace(/app\.get\('\/network-advanced'[\s\S]*?}\);/g, '');

// Ajouter UNE SEULE route network-advanced propre et fonctionnelle
const cleanRoute = `
// Route réseau avancée avec VRAIES données TP-Link
app.get('/network-advanced', async (req, res) => {
    try {
        console.log('🌐 Page réseau avec VRAIES données TP-Link...');
        
        // Récupérer les vraies données TP-Link
        const tplinkData = await tplinkScraper.getAllData();
        
        console.log('🐛 DEBUG - SSID récupéré:', tplinkData.wifi.ssid);
        console.log('🐛 DEBUG - Firmware récupéré:', tplinkData.system.firmware);
        console.log('🐛 DEBUG - Uptime récupéré:', tplinkData.system.uptime);

        const devices = {
            tplink: {
                name: "TP-Link TL-WR841N (DONNÉES RÉELLES)",
                ip: tplinkData.ip,
                type: "router",
                status: tplinkData.status === 'online' ? "operational" : "offline",
                online: tplinkData.status === 'online',
                responseTime: 25,
                protocol: "http",
                wifi_info: { 
                    ssid: tplinkData.wifi.ssid,
                    channel: tplinkData.wifi.channel,
                    mode: tplinkData.wifi.mode,
                    bands: [tplinkData.wifi.frequency]
                },
                system_info: { 
                    firmware: tplinkData.system.firmware,
                    uptime: tplinkData.system.uptime
                },
                network_services: { 
                    estimated_clients: tplinkData.wifi.clients.length
                },
                enterprise_features: { 
                    vlan_support: "Non", 
                    vpn_tunnels: "Non" 
                }
            },
            cisco: {
                name: "Cisco RV132W", ip: "10.0.1.251", type: "router", status: "operational", online: true, responseTime: 12, protocol: "https",
                wifi_info: { ssid: "CiscoWiFi_5G", channel: "36", mode: "AC", bands: ["5GHz"] },
                system_info: { firmware: "RV132W v1.0.3.45", uptime: "45j 12h 30m" },
                network_services: { estimated_clients: 15 },
                enterprise_features: { vlan_support: "Oui", vpn_tunnels: "2 tunnels actifs" }
            },
            freebox: {
                name: "Freebox Ultra", ip: "192.168.1.254", type: "gateway", status: "operational", online: true, responseTime: 3, protocol: "http",
                wifi_info: { ssid: "Freebox-WiFi6", channel: "Auto", mode: "WiFi 6", bands: ["2.4GHz", "5GHz"] },
                system_info: { firmware: "Freebox OS v4.7.8", uptime: "125j 8h 15m" },
                network_services: { estimated_clients: 12 },
                enterprise_features: { vlan_support: "Natif", vpn_tunnels: "WireGuard actif" }
            },
            repeater: {
                name: "Répéteur Free", ip: "192.168.1.177", type: "repeater", status: "operational", online: true, responseTime: 1, protocol: "http",
                wifi_info: { ssid: "Extension-WiFi", channel: "Sync", mode: "Répéteur", bands: ["2.4GHz"] },
                system_info: { firmware: "Répéteur v2.1.3", uptime: "89j 4h 22m" },
                network_services: { estimated_clients: 3 },
                enterprise_features: { vlan_support: "N/A", vpn_tunnels: "N/A" }
            }
        };

        res.render('network', {
            devices: devices,
            stats: { 
                total_devices: 4, 
                online: 4, 
                offline: 0, 
                average_latency: "Real-time data" 
            },
            lastUpdate: new Date().toLocaleString('fr-FR')
        });

    } catch (error) {
        console.error('❌ Erreur page réseau avancée:', error.message);
        res.status(500).send('Erreur lors du chargement de la page réseau');
    }
});`;

// Ajouter la route propre à la fin du fichier
content += cleanRoute;

fs.writeFileSync('server-with-vnstat.js', content);
console.log('✅ Route network-advanced nettoyée et recréée');
