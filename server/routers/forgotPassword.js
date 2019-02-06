'use strict';

const express = require('express');
const async = require('async');

module.exports = function (server) {
  const router = express.Router();

  router.post('/forgotpassword', (req, res) => {
    if (!req.body.email) {
      res.status(400).json({
        error: 'Missing email'
      });
      return;
    }
    server.db.getUserByEmail(req.body.email, (err, user) => {
      if (err) {
        logger.error('Forgot password submit error', err);
        res.status(500).json({
          error: 'Internal server error'
        });
        return;
      }
      if (user == null) {
        res.status(400).json({
          error: 'Could not find user with that email'
        });
        return;
      }
      server.db.generatePasswordResetCode(user.username, (err, resetDoc) => {
        if (err) {
          logger.error('Forgot password generate reset error', err);
          res.status(500).json({
            error: 'Internal server error'
          });
          return;
        }
        server.mailer.sendPasswordReset(user.email, user.displayname, server.hostname + '/resetpassword?code=' + resetDoc.code, (err, info) => {
          if (err) {
            logger.error('Forgot password email send error', err);
            res.status(500).json({
              error: 'Could not send email, try again!'
            });
            return;
          }
          res.status(200).json({
            success: true
          });
          return;
        });
      });
    });
  });

  // When a password reset is requested from forgotten passwords
  router.post('/resetpassword', (req, res) => {
    async.series({
      resetDoc: function (callback) {
        server.db.validPasswordReset(req.body.code, (err, resetDoc) => {
          if (err) {
            logger.error('Valid password reset check error', err);
            return callback('Internal server error');
          }
          return callback(null, resetDoc);
        });
      },
      password: function (callback) {
        server.pass.checkPassword(req.body.password, req.body.passwordConfirm, callback);
      },
      passwordHash: function (callback) {
        server.pass.hashPassword(req.body.password, (err, hash) => {
          if (err) {
            logger.error('Hash password error', err);
            return callback('Internal server error');
          }
          return callback(null, hash);
        });
      }
    }, function (err, results) {
      if (err) {
        res.status(400).json({
          error: err
        });
        return;
      }
      if (results.resetDoc === null) {
        res.status(400).json({
          error: 'Reset link expired',
          single: true // Makes the error appear without the form still there
        });
        return;
      }
      server.db.updateUserPassword(results.resetDoc.username, results.passwordHash, (err, numAffected) => {
        if (err) {
          logger.error('Update user password error', err);
          res.status(500).json({
            error: 'Error changing password'
          });
          return;
        }
        // Remove all usernames reset password codes
        server.db.removePasswordResets(results.resetDoc.username);
        res.status(200).json({
          success: true
        });
        // Maybe send a reset notification email
      });
    });
  });

  return router;
};
