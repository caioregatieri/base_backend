const express = require('express');
const http = require('http');
const path = require('path');
const logger = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const cors = require('cors');
const methodOverride = require('method-override');
const fingerprint = require('express-fingerprint');
const helmet = require('helmet');
const responseTime = require('response-time');
const fs = require('fs');
const shell = require('shelljs');

require('dotenv/config');

const errorHandler = require('./services/errorHandler');

class App {
  
  constructor()  {
    errorHandler.load();

    this.app = express();

    this.loadPlugins     = this.loadPlugins.bind(this);
    this.setPublicPath   = this.setPublicPath.bind(this);
    this.setMiddlewares  = this.setMiddlewares.bind(this);
    this.setRoutes       = this.setRoutes.bind(this);
    this.setSocketServer = this.setSocketServer.bind(this);

    this.loadPlugins();
    this.setPublicPath();
    this.setMiddlewares();
    this.setRoutes();

    this.server = this.setSocketServer()
  }
  
  loadPlugins() {
    this.app.use(compression());
    this.app.use(logger('dev'));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(expressValidator());
    this.app.use(cors());
    this.app.use(methodOverride('_method'));
    this.app.use(fingerprint({
      parameters:[
          fingerprint.useragent,
          fingerprint.acceptHeaders,
          fingerprint.geoip,
      ]
    }));
    this.app.use(helmet());
    this.app.use(responseTime());
  }

  setPublicPath() {
    const public_path = path.join(__dirname, 'public');
    if (!fs.existsSync(public_path)) shell.mkdir('-p', public_path);
    this.app.use('/public', express.static(public_path));
  }

  setMiddlewares() {
    //middleware para autenticar
    const authMiddleware = require('./middlewares/auth')(require('./config/authSkip'));
    this.app.use(authMiddleware);

    //middleware para lidar com # em query e body
    const hashtagMiddleware = require('./middlewares/hashtag');
    this.app.use(hashtagMiddleware);
  }

  setRoutes() {
    this.app.use('/api', require('./routes'));
    this.app.use('*', (req, res) => res.send({msg: 'route_not_found'}));
  }

  setSocketServer() {
    const server = http.Server(this.app);
    const io = require('socket.io')(server);

    this.app.use((req, res, next) => {
        req.io = io;
        next();
    });

    require('./socket')(io);

    return server;
  }

}

module.exports = new App().server;

