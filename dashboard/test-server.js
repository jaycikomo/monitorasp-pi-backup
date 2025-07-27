const express = require('express');
const app = express();
const port = 80;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
    res.render('index', {
        connections: { total: 15, established: 8, listening: 4 },
        availableInterfaces: ['eth0', 'wlan0', 'wlan1'],
        vnstatData: {},
        interfaceStatus: { eth0: { up: true }, wlan0: { up: true }, wlan1: { up: false } },
        serverIP: '192.168.1.200'
    });
});

app.listen(port, () => {
    console.log('Serveur de test sur http://192.168.1.200');
});
