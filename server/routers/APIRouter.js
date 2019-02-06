'use strict';

const express = require('express');

module.exports = function (server) {
  const router = express.Router();

  // All routes are at /api/...

  // The api requires csrfToken verification (either sent in query or body)
  router.use((req, res, next) => {
    const csrfToken = req.query.csrfToken || req.body.csrfToken;
    // console.log(req.url);
    // console.log(csrfToken);
    // Verify csrf token first
    if (!req.verifyCSRF(csrfToken)) {
      return res.status(401).json({
        success: false,
        error: 'Error authenticating request, please try and refresh!'
      });
    }
    next();
  });

  router.use('/browse/profile', require('./profileAPI')(server));

  router.use('/browse/movie', require('./movieAPI')(server));
  router.use('/browse/show', require('./showAPI')(server));
  router.use('/browse/person', require('./personAPI')(server));

  router.use('/search', require('./searchAPI')(server));
  router.use('/account', require('./accountAPI')(server));
  router.use('/account', require('./forgotPassword')(server))

  // router.get('/search', (req, res) => {
  //   res.status(200).json(req.query);
  // });

  return router;
};
