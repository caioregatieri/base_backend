const express = require('express');
const http = require('http');
const path = require('path');
const logger = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const dotenv = require('dotenv');
const cors = require('cors');
const methodOverride = require('method-override');
const fingerprint = require('express-fingerprint');
const helmet = require('helmet');
const responseTime = require('response-time');
const fs = require('fs');
const shell = require('shelljs');

const errorHandler = require('./errorHandler');
errorHandler.load();

dotenv.load();

const app = express();
app.set('port', process.env.PORT || 3000);

app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

const public_path = path.join(__dirname, 'public');
if (!fs.existsSync(public_path)) shell.mkdir('-p', public_path);

app.use('/public', express.static(public_path));
app.use(cors());
app.use(methodOverride('_method'));
app.use(fingerprint({
  parameters:[
      fingerprint.useragent,
      fingerprint.acceptHeaders,
      fingerprint.geoip,
  ]
}));
app.use(helmet());
app.use(responseTime());

//middleware para autenticar
var authMiddleware = require('./middlewares/auth')(require('./config/authAllow'));
app.use(authMiddleware);

//middleware para lidar com # em query e body
var hashtagMiddleware = require('./middlewares/hashtag');
app.use(hashtagMiddleware);

//middleware redis cache
if (process.env.REDIS_CACHE && Boolean(process.env.REDIS_CACHE == 'true')) {
  var redisMiddleware = require('./middlewares/redis');
  app.use(redisMiddleware);
}

app.use('/api', require('./routes'));
app.use('*', (req, res) => res.send({msg: 'route_not_found'}));

// servidor socket.io
const server = http.Server(app);
const io = require('socket.io')(server);

app.use((req, res, next) => {
    req.io = io;
    next();
});

require('./socket')(io);

server.listen(app.get('port'), function() {
  console.log('> EXPRESS API SERVER INICIADO NA PORTA %s.', app.get('port'));
});

