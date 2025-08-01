// Route de test simple
app.get('/network-test', (req, res) => {
    res.json({ message: "Route test fonctionne !", timestamp: new Date() });
});
