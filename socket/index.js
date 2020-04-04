'use strict'

module.exports = function(io) {
    io.on('connection', function (socket) {
        console.log('Someone was connected');
        socket.on('disconnect', function () {
            console.log('Someone was disconnected');
        });
    });
}
