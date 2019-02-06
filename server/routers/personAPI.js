'use strict';

const express = require('express');

module.exports = function (server) {
  const router = express.Router();

  // All routes are at /api/browse/person/...

  router.get('/:id', (req, res) => {
    const personID = req.params.id;
    var renderData = { details: null };
    // Get data from TMDB
    server.api.get('/person/' + personID, (err, data, apiRes) => {
      if (err) {
        logger.error('Error getting person details for ' + personID, err);
        return res.status(500).json({
          success: false,
          error: 'Unknown error getting person details'
        });
      }
      if (apiRes.statusCode == 200) {
        if (data.profile_path) {
          data.profile_url = server.api.getImageURL('profile', 350, data.profile_path);
        } else {
          data.profile_url = '/img/person_unknown_border.png';
        }
        return res.status(200).json({
          success: true,
          details: data
        });
      } else if (apiRes.statusCode == 404) {
        return res.status(404).json({
          success: false,
          error: 'Not found'
        });
      } else {
        logger.error('Error getting person details for ' + personID + " code " + apiRes.statusCode, data);
        return res.status(apiRes.statusCode).json({
          success: false,
          error: 'Unkown ' + apiRes.statusCode + ' error'
        });
      }
    });
  });


  return router;
};
