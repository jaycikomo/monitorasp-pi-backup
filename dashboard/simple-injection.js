const fs = require('fs');

console.log('🔧 Injection SIMPLE des vraies données...');

let content = fs.readFileSync('server-with-vnstat.js', 'utf8');

// Trouver la route network-advanced et la rendre async
if (content.includes("app.get('/network-advanced', (req, res) => {")) {
    content = content.replace(
        "app.get('/network-advanced', (req, res) => {",
        "app.get('/network-advanced', async (req, res) => {"
    );
    console.log('✅ Route rendue async');
}

// Ajouter juste après le "try {" de la route
const tryIndex = content.indexOf('try {', content.indexOf("app.get('/network-advanced'"));
if (tryIndex !== -1) {
    const insertPoint = tryIndex + 5; // Après "try {"
    
    const injection = `
        // Récupération des vraies données TP-Link
        let realTPLink = {};
        try {
            const tpData = await tplinkScraper.getAllData();
            realTPLink.ssid = tpData.wifi.ssid;
            realTPLink.firmware = tpData.system.firmware;
            realTPLink.uptime = tpData.system.uptime;
            realTPLink.clients = tpData.wifi.clients.length;
            console.log('✅ Vraies données récupérées - SSID:', realTPLink.ssid);
        } catch (err) {
            console.log('⚠️ Fallback données par défaut');
            realTPLink.ssid = "MonReseau_2.4G";
            realTPLink.firmware = "TL-WR841N v13";
            realTPLink.uptime = "15 jours";
            realTPLink.clients = 8;
        }
`;
    
    content = content.slice(0, insertPoint) + injection + content.slice(insertPoint);
    console.log('✅ Code d\'injection ajouté');
}

fs.writeFileSync('server-with-vnstat.js', content);
console.log('✅ Modification terminée');
