const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class DynamicNetworkMonitor {
    constructor() {
        this.devices = [
            { name: 'TP-Link TL-WR841N', ip: '10.0.1.200', type: 'router' },
            { name: 'Cisco RV132W', ip: '10.0.1.251', type: 'router' },
            { name: 'Freebox Free', ip: '192.168.1.254', type: 'gateway' },
            { name: 'Répéteur Free', ip: '192.168.1.177', type: 'repeater' }
        ];
        this.results = {};
    }

    async pingDevice(ip) {
        try {
            const pingCmd = `ping -c 1 -W 3 ${ip}`;
            const { stdout } = await execAsync(pingCmd);
            
            const timeMatch = stdout.match(/time=([0-9.]+)/);
            const responseTime = timeMatch ? parseFloat(timeMatch[1]) : null;
            
            return {
                success: true,
                status: 'online',
                responseTime: responseTime,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            return {
                success: false,
                status: 'offline',
                responseTime: null,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async scanAllDevices() {
        console.log('🔍 Scan DYNAMIQUE de tous les équipements...');
        
        const results = {};
        
        for (const device of this.devices) {
            console.log(`🏓 Test ${device.name} (${device.ip})...`);
            const pingResult = await this.pingDevice(device.ip);
            
            results[device.ip] = {
                ...device,
                ...pingResult,
                statusLabel: this.getStatusLabel(pingResult),
                online: pingResult.success,
                error: !pingResult.success
            };
            
            console.log(`   ${pingResult.success ? '✅' : '❌'} ${device.name}: ${pingResult.status} ${pingResult.responseTime ? `(${pingResult.responseTime}ms)` : ''}`);
        }
        
        this.results = results;
        return results;
    }

    getStatusLabel(pingResult) {
        if (!pingResult.success) return 'HORS LIGNE';
        
        const time = pingResult.responseTime;
        if (time === null) return 'OPÉRATIONNEL';
        if (time < 5) return 'EXCELLENT';
        if (time < 20) return 'OPÉRATIONNEL';
        if (time < 100) return 'LENT';
        return 'TRÈS LENT';
    }

    async getNetworkStatus() {
        await this.scanAllDevices();
        
        const online = Object.values(this.results).filter(r => r.success).length;
        const offline = Object.values(this.results).filter(r => !r.success).length;
        
        return {
            summary: { online, offline, total: this.devices.length },
            devices: this.results
        };
    }
}

module.exports = DynamicNetworkMonitor;
