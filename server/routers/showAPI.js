'use strict';

const express = require('express');

module.exports = function (server) {
  const router = express.Router();

  // All routes are at /api/browse/show/...

  router.get('/:id', function (req, res) {
    const showID = req.params.id;
    // Get data from TMDB
    server.api.get('/tv/' + showID + '?append_to_response=credits,external_ids', function (err, data, apiRes) {
      if (err) {
        logger.error('Error getting show details for ' + showID, err);
        return res.status(500).json({
          success: false,
          error: 'Unknown error getting show details'
        });
      }
      if (apiRes.statusCode == 200) {
        // Runtime string
        // data.run_time = data.episode_run_time.join('m, ') + 'm';
        // Add poster image url
        if (data.poster_path) data.poster_url = server.api.getImageURL('poster', 350, data.poster_path);
        else data.poster_url = '/img/poster_unknown_border.png';
        data.credits.cast.sort(compareCast);
        data.credits.totalCast = data.credits.cast.length;
        data.credits.totalCrew = data.credits.crew.length;
        data.credits.cast.splice(10); // Only give 10 cast
        data.credits.crew.splice(10); // Only give 10 crew
        // Add casts profile image url
        for (let i = 0; i < data.credits.cast.length; i++) {
          if (data.credits.cast[i].profile_path) {
            data.credits.cast[i].profile_url = server.api.getImageURL('profile', 200, data.credits.cast[i].profile_path);
          } else {
            data.credits.cast[i].profile_url = '/img/person_unknown_border.png';
          }
        }
        let seasonsData = [];
        data.totalSeasons = data.seasons.length;
        data.seasons.splice(10); // Only give 10 seasons at once
        // Add season poster image urls
        for (let i = 0; i < data.seasons.length; i++) {
          if (data.seasons[i].poster_path) {
            data.seasons[i].poster_url = server.api.getImageURL('poster', 200, data.seasons[i].poster_path);
          } else {
            data.seasons[i].poster_url = '/img/poster_unknown_border.png';
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
        logger.error('Error getting show details for ' + showID + " code " + apiRes.statusCode, data);
        return res.status(apiRes.statusCode).json({
          success: false,
          error: 'Unkown ' + apiRes.statusCode + ' error'
        });
      }
    });
  });

  // To expand cast list
  router.get('/:id/cast', (req, res) => {
    const showID = req.params.id;
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
    server.api.get('/tv/' + showID + '/credits', (err, data, apiRes) => {
      if (err) {
        logger.error('Error getting show credits for ' + showID, err);
        return res.status(500).json({
          success: false,
          error: 'Unknown error getting show credits'
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
        logger.error('Error getting show credits for ' + showID + " code " + apiRes.statusCode, data);
        return res.status(apiRes.statusCode).json({
          success: false,
          error: 'Unkown ' + apiRes.statusCode + ' error'
        });
      }
    });
  });

  router.get('/:id/seasons', (req, res) => {
    const showID = req.params.id;
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
    server.api.get('/tv/' + showID, (err, data, apiRes) => {
      if (err) {
        logger.error('Error getting show seasons for ' + showID, err);
        return res.status(500).json({
          success: false,
          error: 'Unknown error getting show credits'
        });
      }
      if (apiRes.statusCode == 200) {
        const totalSeasons = data.seasons.length;
        data.seasons = data.seasons.slice(from, from + 10);
        // Add season poster image urls
        for (let i = 0; i < data.seasons.length; i++) {
          if (data.seasons[i].poster_path) {
            data.seasons[i].poster_url = server.api.getImageURL('poster', 200, data.seasons[i].poster_path);
          } else {
            data.seasons[i].poster_url = '/img/poster_unknown_border.png';
          }
        }
        return res.status(200).json({
          success: true,
          seasons: data.seasons,
          from: from,
          totalSeasons: totalSeasons
        });
      } else {
        logger.error('Error getting show seasons for ' + showID + " code " + apiRes.statusCode, data);
        return res.status(apiRes.statusCode).json({
          success: false,
          error: 'Unkown ' + apiRes.statusCode + ' error'
        });
      }
    });
  });

  // Season details
  router.get('/:id/season/:season', (req, res) => {
    const showID = req.params.id;
    const seasonNum = req.params.season;

    server.api.get('/tv/' + showID + '/season/' + seasonNum + '?append_to_response=credits', (err, data, apiRes) => {
      if (err) {
        logger.error('Error getting season details for ' + showID + ' season ' + seasonNum, err);
        return res.status(500).json({
          success: false,
          error: 'Unknown error getting show details'
        });
      }
      if (apiRes.statusCode == 200) {
        // Add show id
        data.showID = showID;
        // Add poster image url
        if (data.poster_path) data.poster_url = server.api.getImageURL('poster', 350, data.poster_path);
        else data.poster_url = '/img/poster_unknown_border.png';
        // Add episodes still image urls
        for (var i = 0; i < data.episodes.length; i++) {
          if (data.episodes[i].still_path) data.episodes[i].still_url = server.api.getImageURL('still', 350, data.episodes[i].still_path);
          else data.episodes[i].still_url = '/img/still_unknown_border.png';
        }
        data.credits.cast.sort(compareCast);
        data.credits.totalCast = data.credits.cast.length;
        data.credits.totalCrew = data.credits.crew.length;
        data.credits.cast.splice(10); // Only give 10 cast
        data.credits.crew.splice(10); // Only give 10 crew
        // Add casts profile image urls
        for (var i = 0; i < data.credits.cast.length; i++) {
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
        logger.error('Error getting season details for ' + showID + ' season ' + seasonNum + " code " + apiRes.statusCode, data);
        return res.status(apiRes.statusCode).json({
          success: false,
          error: 'Unkown ' + apiRes.statusCode + ' error'
        });
      }
    });
  });

  router.get('/:id/season/:season/cast', function (req, res) {
    const showID = req.params.id;
    const seasonNum = req.params.season;
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
    server.api.get('/tv/' + showID + '/season/' + seasonNum + '/credits', (err, data, apiRes) => {
      if (err) {
        logger.error('Error getting show credits for ' + showID, err);
        return res.status(500).json({
          success: false,
          error: 'Unknown error getting show season credits'
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
        logger.error('Error getting show season credits for ' + showID + " code " + apiRes.statusCode, data);
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
