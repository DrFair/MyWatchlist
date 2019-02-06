'use strict';

const express = require('express');

module.exports = function (server) {
  const router = express.Router();

  // All routes are at /api/browse/profile/...

  router.get('/:user', (req, res) => {
    server.db.getUserByName(req.params.user, function (err, user) {
      if (err) {
        return res.status(500).json({
          error: 'Internal server error'
        });
      }
      if (user === null) {
        return res.status(404).json({
          error: 'Profile not found'
        });
      }
      return res.status(200).json({
        username: user.username,
        displayname: user.displayname
      });
    });
  });


  return router;
};
