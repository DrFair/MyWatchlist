'use strict';

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const async = require('async');
const express = require('express');


class PassportManager {
  constructor(server) {
    this.server = server;
    this.saltRounds = 10;
    const passport = require('passport');
    this.passport = passport;
    const router = express.Router();

    // Passport initialize
    server.app.use(passport.initialize());
    server.app.use(passport.session());

    const self = this;
    // Passport strategy
    passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    }, (req, username, password, callback) => {
      // logger.info('User tried to login with ' + username + ' - ' + password);
      server.db.getUserByName(username, function (err, user) {
        if (err) {
          return callback(err);
        }
        if (user == null) {
          return callback(null, false, 'Username incorrect');
        }
        self.verifyPassword(password, user.password, function (err, correct) {
          if (err) {
            return callback(err);
          }
          if (correct) {
            return callback(null, user);
          } else {
            return callback(null, false, 'Password incorrect');
          }
        });
      });
    }));

    // Passport serialize user logic (used for session cookies etc)
    passport.serializeUser((user, callback) => {
      callback(null, user._id); // Should maybe be more secret?
    });

    passport.deserializeUser((userID, callback) => {
      // Find user in database
      server.db.getUserById(userID, (err, user) => {
        if (err) {
          return callback(err);
        }
        if (user == null) {
          return callback(null, false);
        }
        return callback(null, user);
      });
    });

    router.post('/login', (req, res, next) => {
      // logger.info('Login attempt');
      // console.log(req.body);
      // Verify csrf token first
      // logger.info('LOGIN TOKEN: ' + req.body.csrfToken);
      if (!req.verifyCSRF(req.body.csrfToken)) {
        return callback(null, false, 'Error authenticating login, please try again!');
      }
      if (!req.body.username) {
        return res.status(401).json({
          error: 'Missing username'
        });
      }
      if (!req.body.password) {
        return res.status(401).json({
          error: 'Missing password'
        });
      }
      passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (info) {
          return res.status(401).json({
            error: info
          });
        }
        req.login(user, (err) => {
          if (err) return next(err);
          return res.redirect('/');
        });
      })(req, res, next);
    });

    // Sign out route
    router.get('/logout', (req, res) => {
      // console.log('Logged out');
      req.logout();
      res.redirect('/');
    });


    // Sign up route
    router.post('/signup', (req, res) => {
      const self = this;

      // Verify csrf token first
      // logger.info('SIGNUP TOKEN: ' + req.body.csrfToken);
      if (!req.verifyCSRF(req.body.csrfToken)) {
        res.status(400).json({
          error: 'Error authenticating signup, please try again!'
        });
        return;
      }
      async.series({
        username: function (callback) {
          self.checkUsername(req.body.username, callback);
        },
        password: function (callback) {
          self.checkPassword(req.body.password, req.body.passwordConfirm, callback);
        },
        email: function (callback) {
          self.checkEmail(req.body.email, callback);
        },
        // All inputs validated, now hash the password
        passwordHash: function (callback) {
          self.hashPassword(req.body.password, function (err, hash) {
            if (err) {
              logger.error('Hash password error', err);
              return callback('Internal server errror');
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
        // Every input is validated, create new user
        server.db.addNewUser(results.username, results.passwordHash, results.email, function (err, newUser) {
          if (err) {
            logger.error('Add new user error', err);
            res.status(400).json({
              error: 'Internal server error'
            });
            return;
          }
          logger.info('Signed up user ' + newUser.username + ' - ' + newUser.email);
          server.mailer.sendWelcome(newUser.email, newUser.displayname, function (err, info) {
            if (err) {
              logger.error('Send welcome email error', err);
              return;
            }
          });
          // OLD:
          // Setup confirm link and send email
          // server.db.generateConfirmEmailCode(newUser.username, function (err, codeDoc) {
          //   if (err) {
          //     logger.error('Generate confirm email code error', err);
          //     return;
          //   }
          //   server.mailer.sendEmailConfirm(newUser.email, newUser.displayname, server.hostname + '/confirmmail?code=' + codeDoc.code, function (err, info) {
          //     if (err) {
          //       logger.error('Send confirm email error', err);
          //       return;
          //     }
          //     // Email sent, don't do anything (could move redirect to here)
          //   });
          // });
          res.status(200).send('OK');
          return;
        });
      });
    });

    server.app.use(router);
  }

  // Callback is err (friendly user message) and username
  checkUsername(username, callback) {
    if (!username) {
      return callback('Missing username');
    }
    if (username.length < 4) {
      return callback('Username too short');
    } else if (username.length > 50) {
      return callback('Username too long');
    }
    const userRegex = /^[a-zA-Z0-9_]+$/;
    if (!userRegex.test(username)) { // If doesn't match
      return callback('Username cannot contain special characters');
    }
    // Check if username already exists
    this.server.db.getUserByName(username, (err, user) => {
      if (err) {
        logger.error('Username in db check error', err);
        return callback('Internal server error');
      }
      if (user != null) {
        return callback('User with that name already exists');
      }
      return callback(null, username); // Success
    });
  }

  // Callback is err (friendly user message) and password
  checkPassword(password, passwordConfirm, callback) {
    if (!password) {
      return callback('Missing password');
    }
    if (!passwordConfirm) {
      return callback('Missing confirm password');
    }
    // TODO: make more requirements for a good password?
    if (password.length < 6) {
      return callback('Password too short');
    } else if (password.length > 50) {
      return callback('Password too long');
    }
    if (password != passwordConfirm) {
      return callback('Passwords did not match');
    }
    return callback(null, password); // Success
  }

  // Callback is err (friendly user message) and email
  checkEmail(email, callback) {
    if (!email) {
      return callback('Missing email');
    }
    if (email.length > 150) {
      return callback('Email too long');
    }
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      return callback('Invalid email');
    }
    // Check if email already exists
    this.server.db.getUserByEmail(email, (err, user) => {
      if (err) {
        logger.error('Email in db check error', err);
        return callback('Internal server error');
      }
      if (user != null) {
        return callback('User with that email already exists');
      }
      return callback(null, email); // Success
    });
  }

  // Callback is err, hash
  hashPassword(password, callback) {
    bcrypt.hash(password, this.saltRounds, callback);
  }

  // Callback is err, correct
  verifyPassword(password, hash, callback) {
    bcrypt.compare(password, hash, callback);
  }


}

module.exports.setup = function (server) {
  return new PassportManager(server);
};
