// network-monitor.js - Module de monitoring réseau
// Version 1.0 - Compatible Node.js v18.20.8

const { spawn } = require('child_process');

class NetworkMonitor {
    constructor() {
        this.devices = {
            'tp-link': {
                name: 'TP-Link TL-WR841N',
                ip: '10.0.1.200',
                type: 'router',
                status: 'unknown'
            },
            'cisco': {
                name: 'Cisco RV132W',
                ip: '10.0.1.251', 
                type: 'router',
                status: 'unknown'
            },
            'freebox': {
                name: 'Freebox Free',
                ip: '192.168.1.254',
                type: 'modem',
                status: 'unknown'
            },
            'repeater': {
                name: 'Répéteur Free',
                ip: '192.168.1.177',
                type: 'repeater',
                status: 'unknown'
            }
        };
        
        this.lastUpdate = null;
    }

    // Test ping basique
    async pingDevice(ip) {
        return new Promise((resolve) => {
            const ping = spawn('ping', ['-c', '1', '-W', '3', ip]);
            let output = '';
            
            ping.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            ping.on('close', (code) => {
                const isAlive = code === 0;
                const responseTime = isAlive ? this.extractPingTime(output) : null;
                resolve({ alive: isAlive, responseTime });
            });
            
            setTimeout(() => {
                ping.kill();
                resolve({ alive: false, responseTime: null });
            }, 5000);
        });
    }

    // Extraire temps de réponse ping
    extractPingTime(output) {
        const match = output.match(/time=(\d+\.?\d*)\s*ms/);
        return match ? parseFloat(match[1]) : null;
    }

    // Test d'un équipement
    async monitorDevice(deviceId) {
        const device = this.devices[deviceId];
        if (!device) return null;

        console.log(`[NetworkMonitor] Testing ${device.name} (${device.ip})`);
        
        const result = {
            id: deviceId,
            name: device.name,
            ip: device.ip,
            type: device.type,
            timestamp: new Date().toISOString(),
            ping: null,
            status: 'offline'
        };

        try {
            result.ping = await this.pingDevice(device.ip);
            
            if (result.ping.alive) {
                result.status = 'online';
                this.devices[deviceId].status = 'online';
                this.devices[deviceId].lastSeen = result.timestamp;
            }
            
        } catch (error) {
            console.error(`[NetworkMonitor] Error testing ${device.name}:`, error.message);
            result.error = error.message;
        }

        return result;
    }

    // API pour le dashboard
    async getNetworkStatus() {
        return {
            devices: this.devices,
            lastUpdate: this.lastUpdate,
            summary: {
                total: Object.keys(this.devices).length,
                online: Object.values(this.devices).filter(d => d.status === 'online').length,
                accessible: Object.values(this.devices).filter(d => d.status === 'accessible').length,
                offline: Object.values(this.devices).filter(d => d.status !== 'online' && d.status !== 'accessible').length,
                lastScan: this.lastUpdate
            }
        };
    }
}

module.exports = NetworkMonitor;
