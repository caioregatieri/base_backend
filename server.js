const server = require('./app');

server.listen(process.env.PORT, function() {
    console.log(`> EXPRESS API SERVER INICIADO NA PORTA ${process.env.PORT}.`);
});