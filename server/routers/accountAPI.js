'use strict';

const express = require('express');

module.exports = function (server) {
  const router = express.Router();

  // All routes are at /api/account/...

  // router.get('/search', (req, res) => {
  //   res.status(200).json(req.query);
  // });

  router.post('/name/change', function (req, res) {
    if (req.user) {
      var reqName = req.body.name;
      if (reqName == req.user.displayname) {
        res.status(400).json({
          error: 'Already named ' + reqName
        });
        return;
      }
      checkDisplayname(reqName, function (err) {
        if (err) {
          res.status(400).json({
            error: err
          });
          return;
        }
        // Change name
        server.db.updateUserDisplayname(req.user.username, reqName, function (err, numAffected) {
          if (err) {
            logger.error('Error changing user displayname', err);
            res.status(500).json({
              error: 'Internal server error changing name'
            });
            return;
          }
          res.status(200).json({
            success: 'Successfully changed display name to ' + reqName,
          });
          return;
        });
      });
    } else { // Not logged in
      res.status(401).json({
        error: 'Not logged in'
      });
    }
  });

  // Callback is err (user friendly message)
  function checkDisplayname(name, callback) {
    if (!name) {
      return callback('Invalid name');
    } else if (name.length < 4) {
      return callback('Name too short');
    } else if (name.length > 50) {
      return callback('Name too long');
    }
    var nameRegex = /^[a-zA-Z0-9_ ]+$/;
    if (!nameRegex.test(name)) { // If doesn't match
      return callback('Name contains invalid characters');
    }
    return callback(null);
  }

  router.post('/password/change', function (req, res) {
    if (req.user) {
      if (!req.body.currentPassword) {
        res.status(400).json({
          error: 'Missing current password'
        });
        return;
      }
      if (req.body.currentPassword === req.body.password) {
        res.status(400).json({
          error: 'New password cannot be the same as old'
        });
        return;
      }
      server.pass.verifyPassword(req.body.currentPassword, req.user.password, function (err, correct) {
        if (err) {
          logger.error('Error changing user password', err);
          res.status(500).json({
            error: 'Internal server error changing password'
          });
          return;
        }
        if (!correct) {
          res.status(400).json({
            error: 'Current password incorrect'
          });
          return
        } else { // Means password was correct
          // Make sure new password is valid
          server.pass.checkPassword(req.body.password, req.body.passwordConfirm, function (err, password) {
            if (err) {
              res.status(400).json({
                error: err
              });
              return;
            }
            // Hash password
            server.pass.hashPassword(req.body.password, function (err, hash) {
              if (err) {
                logger.error('User change password hash error', err);
                res.status(500).json({
                  error: 'Internal server error changing password'
                });
                return;
              }
              // Store it in database
              server.db.updateUserPassword(req.user.username, hash, function (err, numAffected) {
                if (err) {
                  res.status(500).json({
                    error: 'Internal server error changing password'
                  });
                  return;
                }
                res.status(400).json({
                  success: 'Successfully changed password'
                });
                return;
              });
            });
          });
        }
      });
    } else { // Not logged in
      res.status(401).json({
        error: 'Not logged in'
      });
    }
  });

  return router;
};
