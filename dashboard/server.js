const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 80;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

function getAvailableInterfaces(callback) {
    callback(null, ['eth0', 'wlan0', 'wlan1', 'docker0', 'vethd9a58b9']);
}

function getNetworkStats(callback) {
    exec('cat /proc/net/dev', (error, stdout, stderr) => {
        if (error) return callback(error, {});
        const lines = stdout.split('\n');
        const stats = {};
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const parts = line.split(/\s+/);
                const iface = parts[0].replace(':', '');
                if (iface !== 'lo') {
                    stats[iface] = {
                        rx_bytes: parseInt(parts[1]) || 0,
                        tx_bytes: parseInt(parts[9]) || 0
                    };
                }
            }
        }
        callback(null, stats);
    });
}

function getActiveConnections(callback) {
    exec('ss -tuln | wc -l', (error, stdout, stderr) => {
        if (error) {
            return callback(null, { total: 0, established: 0, listening: 0 });
        }
        const total = parseInt(stdout.trim()) - 1;
        
        exec('ss -t | grep ESTAB | wc -l', (error2, stdout2) => {
            const established = error2 ? 0 : parseInt(stdout2.trim());
            
            exec('ss -l | wc -l', (error3, stdout3) => {
                const listening = error3 ? 0 : parseInt(stdout3.trim()) - 1;
                callback(null, { 
                    total: total > 0 ? total : 0, 
                    established: established > 0 ? established : 0, 
                    listening: listening > 0 ? listening : 0 
                });
            });
        });
    });
}

function getAllVnstatData(interfaces, callback) {
    if (!interfaces || interfaces.length === 0) {
        return callback(null, {});
    }
    
    const results = {};
    let completed = 0;
    
    interfaces.forEach(iface => {
        exec(`vnstat -i ${iface} --json 2>/dev/null`, (error, stdout, stderr) => {
            if (!error && stdout) {
                try {
                    const data = JSON.parse(stdout);
                    if (data.interfaces && data.interfaces.length > 0) {
                        results[iface] = data.interfaces[0];
                    }
                } catch (parseError) {
                    console.error(`Erreur parsing JSON pour ${iface}`);
                }
            }
            completed++;
            if (completed === interfaces.length) {
                callback(null, results);
            }
        });
    });
}

function getInterfaceStatus(callback) {
    exec('ip link show', (error, stdout, stderr) => {
        if (error) return callback(null, {});
        
        const interfaces = {};
        const lines = stdout.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/^\d+:/)) {
                const match = line.match(/^\d+:\s+(\w+).*state\s+(\w+)/);
                if (match) {
                    const [, name, state] = match;
                    if (name !== 'lo') {
                        interfaces[name] = { 
                            name: name, 
                            state: state.toLowerCase(), 
                            up: state.toLowerCase() === 'up' 
                        };
                    }
                }
            }
        }
        callback(null, interfaces);
    });
}

app.get('/', (req, res) => {
    // Initialisation des variables avec des valeurs par défaut
    let vnstatData = {};
    let networkStats = {};
    let connections = { total: 0, established: 0, listening: 0 };
    let interfaceStatus = {};
    let availableInterfaces = ['eth0', 'wlan0', 'wlan1', 'docker0', 'vethd9a58b9'];
    
    let tasksCompleted = 0;
    const totalTasks = 4;
    
    function renderPage() {
        res.render('index', {
            vnstatData: vnstatData,
            networkStats: networkStats,
            connections: connections,
            interfaceStatus: interfaceStatus,
            availableInterfaces: availableInterfaces,
            serverIP: '192.168.1.200'
        });
    }
    
    function taskCompleted() {
        tasksCompleted++;
        if (tasksCompleted >= totalTasks) {
            renderPage();
        }
    }
    
    // Tâche 1: Récupération des interfaces et données vnstat
    getAvailableInterfaces((error, interfaces) => {
        if (!error && interfaces) {
            availableInterfaces = interfaces;
        }
        
        getAllVnstatData(availableInterfaces, (error, data) => {
            if (!error && data) {
                vnstatData = data;
            }
            taskCompleted();
        });
    });
    
    // Tâche 2: Statistiques réseau
    getNetworkStats((error, data) => {
        if (!error && data) {
            networkStats = data;
        }
        taskCompleted();
    });
    
    // Tâche 3: Connexions actives
    getActiveConnections((error, data) => {
        if (!error && data) {
            connections = data;
        }
        taskCompleted();
    });
    
    // Tâche 4: Statut des interfaces
    getInterfaceStatus((error, data) => {
        if (!error && data) {
            interfaceStatus = data;
        }
        taskCompleted();
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log('Dashboard Multi-Interfaces disponible sur http://192.168.1.200');
    console.log('Interfaces surveillees: eth0, wlan0, wlan1, docker0, vethd9a58b9');
    console.log('Ctrl+C pour arreter le serveur');
});

process.on('SIGINT', () => {
    console.log('\nArret du serveur...');
    process.exit(0);
});
