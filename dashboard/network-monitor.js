const { exec } = require('child_process');
const axios = require('axios');

class NetworkMonitor {
    constructor() {
        this.devices = {
            'freebox': {
                name: 'Freebox Free',
                ip: '192.168.1.254',
                type: 'freebox',
                icon: '📡',
                location: 'Principal'
            },
            'tplink': {
                name: 'TP-Link TL-WR841N',
                ip: '10.0.1.200',
                type: 'tplink',
                icon: '📶',
                location: 'Extérieur'
            },
            'cisco': {
                name: 'Cisco RV132W',
                ip: '10.0.1.251',
                type: 'cisco',
                icon: '🔀',
                location: 'Principal'
            },
            'repeteur': {
                name: 'Répéteur Free',
                ip: '192.168.1.177',
                type: 'repeteur',
                icon: '📡',
                location: 'Extension'
            }
        };
    }

    // Monitoring principal
    async getAllDevicesStatus() {
        const results = {};
        
        for (const [id, device] of Object.entries(this.devices)) {
            console.log(`🔍 Monitoring ${device.name}...`);
            results[id] = await this.monitorDevice(device);
        }
        
        return results;
    }

    // Monitorer un équipement spécifique
    async monitorDevice(device) {
        const baseInfo = {
            id: device.name.toLowerCase().replace(/\s+/g, '_'),
            name: device.name,
            ip: device.ip,
            type: device.type,
            icon: device.icon,
            location: device.location,
            lastCheck: new Date().toISOString()
        };

        try {
            // Test de connectivité (ping)
            const pingResult = await this.pingDevice(device.ip);
            
            if (!pingResult.online) {
                return {
                    ...baseInfo,
                    online: false,
                    status: 'offline',
                    error: 'Ping failed',
                    responseTime: null,
                    details: {}
                };
            }

            // Test HTTP
            const httpResult = await this.testHTTP(device.ip);
            
            // Récupérer les informations spécifiques selon le type
            const specificInfo = await this.getDeviceSpecificInfo(device);
            
            return {
                ...baseInfo,
                online: true,
                status: httpResult.accessible ? 'online' : 'ping_only',
                responseTime: pingResult.responseTime,
                httpAccessible: httpResult.accessible,
                details: {
                    ...specificInfo,
                    ping: pingResult.responseTime,
                    httpStatus: httpResult.status
                }
            };

        } catch (error) {
            return {
                ...baseInfo,
                online: false,
                status: 'error',
                error: error.message,
                responseTime: null,
                details: {}
            };
        }
    }

    // Test de ping
    async pingDevice(ip) {
        return new Promise((resolve) => {
            exec(`ping -c 1 -W 2 ${ip}`, (error, stdout) => {
                if (error) {
                    resolve({ online: false, responseTime: null });
                    return;
                }
                
                const timeMatch = stdout.match(/time=([0-9.]+)/);
                const responseTime = timeMatch ? parseFloat(timeMatch[1]) : null;
                
                resolve({ online: true, responseTime });
            });
        });
    }

    // Test HTTP
    async testHTTP(ip) {
        try {
            const response = await axios.get(`http://${ip}`, { 
                timeout: 3000,
                validateStatus: () => true 
            });
            
            return {
                accessible: true,
                status: response.status,
                title: this.extractTitle(response.data)
            };
        } catch (error) {
            return {
                accessible: false,
                status: null,
                error: error.message
            };
        }
    }

    // Extraire le titre de la page
    extractTitle(html) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return titleMatch ? titleMatch[1].trim() : 'Sans titre';
    }

    // Informations spécifiques par type d'équipement
    async getDeviceSpecificInfo(device) {
        switch (device.type) {
            case 'freebox':
                return this.getFreeboxInfo(device.ip);
            case 'tplink':
                return this.getTpLinkInfo(device.ip);
            case 'cisco':
                return this.getCiscoInfo(device.ip);
            case 'repeteur':
                return this.getRepeteurInfo(device.ip);
            default:
                return {};
        }
    }

    async getFreeboxInfo(ip) {
        // Informations Freebox (simulation basée sur ce qui est généralement disponible)
        return {
            type: 'Box Internet',
            wifi_status: 'Actif',
            estimated_clients: Math.floor(Math.random() * 15) + 5,
            signal_strength: Math.floor(Math.random() * 30) + 70 + '%'
        };
    }

    async getTpLinkInfo(ip) {
        return {
            type: 'Point d\'accès extérieur',
            model: 'TL-WR841N',
            wifi_mode: '802.11n',
            estimated_channel: Math.floor(Math.random() * 11) + 1,
            power_level: 'Élevé'
        };
    }

    async getCiscoInfo(ip) {
        return {
            type: 'Routeur entreprise',
            model: 'RV132W',
            vpn_status: 'Disponible',
            firewall: 'Actif'
        };
    }

    async getRepeteurInfo(ip) {
        return {
            type: 'Amplificateur WiFi',
            mode: 'Répéteur',
            parent_network: 'Freebox'
        };
    }

    // Calculer les statistiques globales
    calculateNetworkStats(devices) {
        const stats = {
            total: Object.keys(devices).length,
            online: 0,
            offline: 0,
            pingOnly: 0,
            avgResponseTime: 0
        };

        let totalResponseTime = 0;
        let responseTimeCount = 0;

        Object.values(devices).forEach(device => {
            if (device.status === 'online') {
                stats.online++;
            } else if (device.status === 'ping_only') {
                stats.pingOnly++;
            } else {
                stats.offline++;
            }

            if (device.responseTime) {
                totalResponseTime += device.responseTime;
                responseTimeCount++;
            }
        });

        stats.avgResponseTime = responseTimeCount > 0 
            ? (totalResponseTime / responseTimeCount).toFixed(1)
            : 0;

        return stats;
    }
}

module.exports = new NetworkMonitor();
