'use strict';

const jsonFile = require('jsonfile');
const path = require('path');
const winston = require('winston');

// Setup logger
const prod = process.env.PROD || false;

global.logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      name: 'main',
      filename: 'main.log',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'info',
      json: false
    }),
    new winston.transports.File({
      name: 'mainjson',
      filename: 'mainjson.log',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: 'info'
    })
  ],
  level: 'silly',
  exitOnError: false
});

if (!prod) {
  logger.add(winston.transports.Console, {
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: 'silly',
    timestamp: true
  });
}

process.on('uncaughtException', function (err) {
  logger.error('Uncaught exception', err);
});

const settingsFile = 'settings.json';
const settings = require('./settings').loadSettings(settingsFile);

const TMDBClient = require('./tmdbapi');
const tmdb = new TMDBClient(settings.tmdbkey, path.join(settings.storagepath, 'cache'));

const DBClient = require('./db');
const db = new DBClient(path.join(settings.storagepath, 'db'));

const Mailer = require('./mailer');
const mailer = new Mailer('MyWatchlist', settings.gmailUsername, settings.gmailPassword);

const server = require('./server').startServer(settings.hostname, settings.port, settings.storagepath, tmdb, db, mailer);

// mailer.sendMail('madsskovgaard@hotmail.com', 'Test mail', '<p>This is just a simple test</p>', function (err, info) {
//   console.log(err);
//   console.log(info);
// });

// tmdb.get('/movie/550', function (err, data, res) {
//   if (err) {
//     return console.log(err);
//   }
//   // console.log(res.statusCode);
//   console.log(data);
// });
