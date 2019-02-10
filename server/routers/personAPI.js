'use strict';

const express = require('express');

module.exports = function (server) {
  const router = express.Router();

  // All routes are at /api/browse/person/...

  router.get('/:id', (req, res) => {
    const personID = req.params.id;
    var renderData = { details: null };
    // Get data from TMDB
    server.api.get('/person/' + personID + "?append_to_response=combined_credits", (err, data, apiRes) => {
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
        let credits = [];
        if (data.combined_credits.cast) {
          for (let i = 0; i < data.combined_credits.cast.length; i++) {
            addCredit(credits, data.combined_credits.cast[i], false);
          }
        }
        if (data.combined_credits.crew) {
          for (let i = 0; i < data.combined_credits.crew.length; i++) {
            addCredit(credits, data.combined_credits.crew[i], true);
          }
        }
        // Sort credits by release or first air date
        credits.sort((a, b) => {
          const aDate = a.first_air_date ? a.first_air_date : (a.release_date ? a.release_date : '0000-00-00');
          const bDate = b.first_air_date ? b.first_air_date : (b.release_date ? b.release_date : '0000-00-00');
          const aSplit = aDate.split('-').join();
          const bSplit = bDate.split('-').join();
          return aSplit < bSplit ? 1 : (aSplit > bSplit ? -1 : 0);
        });
        data.credits = credits;
        delete data.combined_credits;
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

  function addCredit(credits, credit, isCrew) {
    for (let i = 0; i < credits.length; i++) {
      if (credits[i].id == credit.id) {
        if (isCrew) {
          if (credit.job) credits[i].credits.push(credit.job);
          else if (credit.department) credits[i].credits.push(credit.department);
        } else {
          if (credit.character) credits[i].credits.push(credit.character);
        }
        return;
      }
    }
    const creditObj = {
      id: credit.id,
      media_type: credit.media_type,
      credits: []
    };
    if (credit.title) creditObj.title = credit.title;
    if (credit.name) creditObj.name = credit.name;
    if (credit.episode_count) creditObj.episode_count = credit.episode_count;
    if (credit.release_date) creditObj.release_date = credit.release_date;
    if (credit.first_air_date) creditObj.first_air_date = credit.first_air_date;
    if (credit.poster_path) {
      creditObj.poster_path = server.api.getImageURL('poster', 200, credit.poster_path);
    } else {
      creditObj.poster_path = '/img/poster_unknown_border.png';
    }
    if (isCrew) {
      if (credit.job) creditObj.credits.push(credit.job);
    } else {
      if (credit.character) creditObj.credits.push(credit.character);
    }
    credits.push(creditObj);
  }

  return router;
};
