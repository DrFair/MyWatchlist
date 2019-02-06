'use strict';

const express = require('express');

module.exports = function (server) {
  const router = express.Router();

  // All routes are at /api/browse/movie/...

  router.get('/:id', (req, res) => {
    const movieID = req.params.id;
    // Get data from TMDB
    server.api.get('/movie/' + movieID + '?&append_to_response=credits', (err, data, apiRes) => {
      if (err) {
        logger.error('Error getting movie details for ' + movieID, err);
        return res.status(500).json({
          success: false,
          error: 'Unknown error getting movie details'
        });
      }
      if (apiRes.statusCode == 200) {
        // Add poster image url
        if (data.poster_path) data.poster_url = server.api.getImageURL('poster', 350, data.poster_path);
        else data.poster_url = '/img/poster_unknown_border.png';
        // Add casts profile image url
        data.credits.cast.sort(compareCast);
        data.credits.totalCast = data.credits.cast.length;
        data.credits.totalCrew = data.credits.crew.length;
        data.credits.cast.splice(10); // Only give 10 cast
        data.credits.crew.splice(10); // Only give 10 crew
        for (let i = 0; i < data.credits.cast.length; i++) {
          if (data.credits.cast[i].profile_path) {
            data.credits.cast[i].profile_url = server.api.getImageURL('profile', 200, data.credits.cast[i].profile_path);
          } else {
            data.credits.cast[i].profile_url = '/img/person_unknown_border.png';
          }
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
        logger.error('Error getting movie details for ' + movieID + " code " + apiRes.statusCode, data);
        return res.status(apiRes.statusCode).json({
          success: false,
          error: 'Unkown ' + apiRes.statusCode + ' error'
        });
      }
    });
  });

  // To expand cast list
  router.get('/:id/cast', (req, res) => {
    const movieID = req.params.id;
    let from = req.query.from; // The from cast
    if (!from) {
      return res.status(400).json({
        success: false,
        error: 'Missing "from" query'
      });
      return res.status(400).json({ success: false });
    }
    from = Number(from);
    // Get data from TMDB
    server.api.get('/movie/' + movieID + '/credits', (err, data, apiRes) => {
      if (err) {
        logger.error('Error getting movie credits for ' + movieID, err);
        return res.status(500).json({
          success: false,
          error: 'Unknown error getting movie credits'
        });
      }
      if (apiRes.statusCode == 200) {
        const totalCast = data.cast.length;
        data.cast.sort(compareCast);
        data.cast = data.cast.slice(from, from + 10);
        delete data.crew; // Remove crew from data
        for (var i = 0; i < data.cast.length; i++) {
          if (data.cast[i].profile_path) {
            data.cast[i].profile_url = server.api.getImageURL('profile', 200, data.cast[i].profile_path);
          } else {
            data.cast[i].profile_url = '/img/person_unknown_border.png';
          }
        }
        return res.status(200).json({
          success: true,
          cast: data,
          from: from,
          totalCast: totalCast
        });
      } else {
        logger.error('Error getting movie credits for ' + movieID + " code " + apiRes.statusCode, data);
        return res.status(apiRes.statusCode).json({
          success: false,
          error: 'Unkown ' + apiRes.statusCode + ' error'
        });
      }
    });
  });

  // ---------- HELPER FUNCTIONS ----------

  function compareCast(castA, castB) {
    return castA.order - castB.order;
  }

  return router;
};
