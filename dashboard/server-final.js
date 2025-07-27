const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 80;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
    // Données par défaut
    const pageData = {
        connections: { total: 0, established: 0, listening: 0 },
        availableInterfaces: ['eth0', 'wlan0', 'wlan1', 'docker0', 'vethd9a58b9'],
        vnstatData: {},
        interfaceStatus: {},
        serverIP: '192.168.1.200'
    };
    
    console.log('Récupération des données...');
    
    // Étape 1: Connexions actives
    exec('ss -tuln | wc -l', (error, stdout) => {
        if (!error) {
            pageData.connections.total = Math.max(0, parseInt(stdout.trim()) - 1);
            console.log('Connexions totales:', pageData.connections.total);
        }
        
        // Étape 2: Connexions établies
        exec('ss -t | grep ESTAB | wc -l', (error2, stdout2) => {
            if (!error2) {
                pageData.connections.established = parseInt(stdout2.trim()) || 0;
                console.log('Connexions établies:', pageData.connections.established);
            }
            
            // Étape 3: Connexions en écoute  
            exec('ss -l | wc -l', (error3, stdout3) => {
                if (!error3) {
                    pageData.connections.listening = Math.max(0, parseInt(stdout3.trim()) - 1);
                    console.log('Connexions en écoute:', pageData.connections.listening);
                }
                
                // Rendu de la page avec les données récupérées
                console.log('Rendu de la page...');
                res.render('index', pageData);
            });
        });
    });
});

app.listen(port, () => {
    console.log('Dashboard final sur http://192.168.1.200');
    console.log('Logs de debug activés');
});
