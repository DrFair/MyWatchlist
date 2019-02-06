'use strict';

const Datastore = require('nedb');
const path = require('path');
const uuid4 = require('uuid/v4');
const async = require('async');

class NEDB {
  constructor(dbFolder) {
    this.dbFolder = dbFolder;
    this.users = this.newDatastore('users');
    this.emailConfirms = this.newDatastore('emailconfirms');
    this.resetPass = this.newDatastore('resetpass');

    this.doMaintenance();
    // Start maintenance interval
    // Every 8 hours
    setInterval(() => {
      this.doMaintenance();
    }, 8 * 60 * 60 * 1000);
  }

  doMaintenance() {
    logger.info('Doing database maintenance..');
    this.users.persistence.compactDatafile();
    this.emailConfirms.persistence.compactDatafile();
    this.resetPass.persistence.compactDatafile();
    // Clear expired email confirmations and password resets
    async.series([
      (callback) => {
        this.emailConfirms.remove({
          expireTime: { $lt: Date.now() }
        }, { multi: true }, callback);
      },
      (callback) => {
        this.resetPass.remove({
          expireTime: { $lt: Date.now() }
        }, { multi: true }, callback);
      }
    ], (err, results) => {
      if (err) {
        logger.error('Error in database maintenance', err);
        return;
      }
      logger.info('Database maintenance complete.');
    });
  }

  newDBPath(dbName) {
    return path.join(this.dbFolder, dbName + '.db');
  }

  newDatastore(dbName) {
    return new Datastore({ filename: this.newDBPath(dbName), autoload: true });
  }

  // Users database

  // Callback is err, user
  // user can be null if no user found
  getUserById(userID, callback) {
    this.users.find({
      _id: userID
    }, (err, docs) => {
      if (err) {
        return callback(err);
      }
      if (docs.length == 0) {
        return callback(null, null);
      }
      return callback(null, docs[0]);
    });
  }

  // Callback is err, user
  // user can be null if no user found
  getUserByName(username, callback) {
    this.users.find({
      username: username.toLowerCase()
    }, (err, docs) => {
        if (err) {
          return callback(err);
        }
        if (docs.length == 0) {
          return callback(null, null);
        }
        return callback(null, docs[0]);
    });
  }

  // Callback is err, user
  // user can be null if no user found
  getUserByEmail(email, callback) {
    this.users.find({
      email: email
    }, (err, docs) => {
        if (err) {
          return callback(err);
        }
        if (docs.length == 0) {
          return callback(null, null);
        }
        return callback(null, docs[0]);
    });
  }

  // Callback is err, newDoc
  // Password need to be hashed before this stage
  addNewUser(username, hashedPassword, email, callback) {
    this.users.insert({
      username: username.toLowerCase(),
      displayname: username,
      password: hashedPassword,
      email: email,
      needConfirm: true
    }, callback);
  }

  // Callback is err, numAffected
  confirmUserEmail(username, callback) {
      this.users.update({
        username: username.toLowerCase()
      }, {
        $unset: { needConfirm: true }
      }, {}, callback);
  }

  // Callback is err, numAffected
  // Password need to be hashed before this call
  updateUserPassword(username, hashedPassword, callback) {
    this.users.update({
      username: username.toLowerCase()
    }, {
      $set: { password: hashedPassword }
    }, {}, callback);
  }

  // Callback is err, numAffected
  updateUserDisplayname(username, newName, callback) {
    this.users.update({
      username: username.toLowerCase()
    }, {
      $set: { displayname: newName }
    }, {}, callback);
  }

  // Email confirms database

  // Callback is err, newDoc (with code variable)
  generateConfirmEmailCode(username, callback) {
    var confirmCode = uuid4();
    var expireTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expire time
    this.emailConfirms.insert({
      code: confirmCode,
      expireTime: expireTime,
      username: username
    }, callback);
  }

  // Callback is err, confirmDoc
  validConfirmEmailCode(confirmCode, callback) {
    this.emailConfirms.find({
      code: confirmCode
    }, function (err, docs) {
        if (err) {
          return callback(err);
        }
        if (docs.length == 0) {
          return callback(null, null);
        }
        return callback(null, docs[0]);
    });
  }

  // Callback is err, numRemoved
  removeConfirmEmail(username, callback) {
    this.emailConfirms.remove({
      username: username
    }, { multi: true }, callback);
  }


  // Passwords reset database

  // Callback err, newDoc (with code variable)
  generatePasswordResetCode(username, callback) {
    var resetCode = uuid4();
    var expireTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expire time
    this.resetPass.insert({
      code: resetCode,
      expireTime: expireTime,
      username: username
    }, callback);
  }

    // Callback is err, confirmDoc
  validPasswordReset(resetCode, callback) {
    this.resetPass.find({
      code: resetCode
    }, function (err, docs) {
        if (err) {
          return callback(err);
        }
        if (docs.length == 0) {
          return callback(null, null);
        }
        return callback(null, docs[0]);
    });
  }

  // Callback is err, numRemoved
  removePasswordResets(username, callback) {
    this.resetPass.remove({
      username: username
    }, { multi: true }, callback);
  }
}

module.exports = NEDB;
