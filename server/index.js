'use strict';

const path = require('path');
const express = require('express');
const http = require('http');
const Tokens = require('csrf');

class Server {
  constructor(hostname, port, storagepath, apiClient, db, mailer) {
    const self = this;
    this.port = port;
    this.storagepath = storagepath;
    this.api = apiClient;
    this.db = db;
    this.mailer = mailer;
    const app = express();
    const server = http.Server(app);
    this.app = app;
    this.server = server;
    this.csrf = new Tokens();

    hostname = hostname + (port == 80 ? '' : ':' + port);
    this.hostname = hostname;
    logger.info('Attempting to start server at ' + hostname);

    const prod = process.env.PROD || false;

    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Middleware
    app.use(require('cookie-parser')());
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(require('connect-flash')());

    const secret = 'fair-mwl-sec'; // Should be generated?
    const cookieSid = 'mwl.sid';
    // Session store setup
    const session = require('express-session');
    const NedbStore = require('nedb-session-store')(session);
    const sessionStore = new NedbStore({
      filename: db.newDBPath('sessions')
    });
    app.use(session({
      resave: true,
      saveUninitialized: true,
      name: cookieSid,
      secret: secret,
      store: sessionStore
    }));

    // CSRF middleware
    app.use(function (req, res, next) {
      // Secret stored in req.session.csrfSecret
      var secret = req.session.csrfSecret;
      // If secret not already generated, generate new one and set it
      if (!secret) secret = self.csrf.secretSync();
      req.session.csrfSecret = secret;
      // Create a token and send to view engine data at csrf_token
      res.locals.csrf_token = self.csrf.create(secret);
      // Add a verify function, returns true if verified
      req.verifyCSRF = function (token) {
        if (!token) return false;
        return self.csrf.verify(secret, token);
      }
      next();
    });

    // Used for react to retrieve the csrf token
    app.get('/gettoken', (req, res) => {
      if (res.locals.csrf_token) {
        res.status(200).json({
          token: res.locals.csrf_token
        });
      } else {
        // Should only happen if this client doesn't have a session
        res.status(401).send('Who are you?');
      }
    });

    this.pass = require('./passport').setup(this);

    // Route to verify user is authenticated
    app.get('/user', (req, res) => {
      // User is authenticated if req.user
      if (req.user) {
        // logger.info('User tried to authenticate (success)');
        // Send user
        return res.status(200).json({
          user: {
            username: req.user.username,
            displayname: req.user.displayname
          },
          authenticated: true
        });
      } else {
        // logger.info('User tried to authenticate (fail)');
        // Send error
        return res.status(401).json({
          error: 'User is not authenticated',
          authenticated: false
        });
      }
    });

    app.use('/api', require('./routers/APIRouter')(this));

    // Serves the react index file
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });

    // Handle server errors
    app.use(function (err, req, res, next) {
      logger.error('Express error:', err);
      res.status(500).send('Something broke!');
    });

    // Start web server
    server.listen(port, function () {
      logger.info('Started server at ' + hostname);
    });
  }
}


module.exports.startServer = function (hostname, port, storagepath, apiClient, db, mailer) {
  return new Server(hostname, port, storagepath, apiClient, db, mailer);
}
