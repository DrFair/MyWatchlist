'use strict';

const express = require('express');

module.exports = function (server) {
  const router = express.Router();

  // All routes are at /api/search/...

  router.get('/quick', (req, res) => {
    let query = req.query.q;
    if (!query) {
      res.status(400).json({ success: false });
      return;
    }
    server.api.get('/search/multi?query=' + query, (err, data, apiRes) => {
      if (err) {
        logger.error('Error TMDB search', err);
        res.status(500).json({ success: false });
        return;
      }
      if (apiRes.statusCode == 200) {
        // Only sort for movies and shows
        let results = [];
        let maxResults = 7;
        for (let i = 0; i < Math.min(data.results.length, maxResults); i++) {
          let result = data.results[i];
          if (result.media_type == 'movie') { // For movies
            results.push({
              type: 'movie',
              id: result.id,
              title: result.title,
              year: new Date(result.release_date).getFullYear()
            });
          } else if (result.media_type == 'tv') { // For shows
            results.push({
              type: 'show',
              id: result.id,
              title: result.name,
              year: new Date(result.first_air_date).getFullYear()
            });
          } else if (result.media_type == 'person') {
            results.push({
              type: 'person',
              id: result.id,
              title: result.name,
              year: null
            });
          }
        }
        res.json({
          success: true,
          results: results
        });
      } else {
        logger.error('Error search from TMDB (' + apiRes.statusCode + ')', data);
        res.status(500).json({ success: false });
      }
    });
  });

  router.get('/all', (req, res) => {
    let query = req.query.q;
    let page = req.query.page || 0;
    if (!query) {
      res.status(400).json({
        error: 'No search query'
      });
      return;
    } else {
      let pageQuery = page > 0 ? '&page=' + page : '';
      server.api.get('/search/multi?query=' + query + pageQuery, (err, data, apiRes) => {
        if (err) {
          logger.error('Error TMDB search', err);
          res.status(400).json({
            error: 'Error searching for ' + query
          });
          return;
        }
        if (apiRes.statusCode == 200) {
          let resData = {
            results: [],
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results
          };
          for (let i = 0; i < data.results.length; i++) {
            let result = parseSearchResult(data.results[i], data.results[i].media_type);
            if (result) resData.results.push(result);
          }
          res.status(200).json(resData);
          return;
        } else {
          logger.error('Error search from TMDB (' + apiRes.statusCode + ')', data);
          res.status(400).json({
            error: 'Error searching for ' + query
          });
          return;
        }
      });
    }
  });

  router.get('/movies', (req, res) => {
    let query = req.query.q;
    let page = req.query.page || 0;
    if (!query) {
      res.status(400).json({
        error: 'No search query'
      });
      return;
    } else {
      let pageQuery = page > 0 ? '&page=' + page : '';
      server.api.get('/search/movie?query=' + query + pageQuery, (err, data, apiRes) => {
        if (err) {
          logger.error('Error TMDB search', err);
          res.status(400).json({
            error: 'Error searching for ' + query
          });
          return;
        }
        if (apiRes.statusCode == 200) {
          let resData = {
            results: [],
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results
          };
          for (let i = 0; i < data.results.length; i++) {
            let result = parseSearchResult(data.results[i], 'movie');
            if (result) resData.results.push(result);
          }
          res.status(200).json(resData);
          return;
        } else {
          logger.error('Error search from TMDB (' + apiRes.statusCode + ')', data);
          res.status(400).json({
            error: 'Error searching for ' + query
          });
          return;
        }
      });
    }
  });

  router.get('/shows', (req, res) => {
    let query = req.query.q;
    let page = req.query.page || 0;
    if (!query) {
      res.status(400).json({
        error: 'No search query'
      });
      return;
    } else {
      let pageQuery = page > 0 ? '&page=' + page : '';
      server.api.get('/search/tv?query=' + query + pageQuery, (err, data, apiRes) => {
        if (err) {
          logger.error('Error TMDB search', err);
          res.status(400).json({
            error: 'Error searching for ' + query
          });
          return;
        }
        if (apiRes.statusCode == 200) {
          let resData = {
            results: [],
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results
          };
          for (let i = 0; i < data.results.length; i++) {
            let result = parseSearchResult(data.results[i], 'tv');
            if (result) resData.results.push(result);
          }
          res.status(200).json(resData);
          return;
        } else {
          logger.error('Error search from TMDB (' + apiRes.statusCode + ')', data);
          res.status(400).json({
            error: 'Error searching for ' + query
          });
          return;
        }
      });
    }
  });

  router.get('/people', (req, res) => {
    let query = req.query.q;
    let page = req.query.page || 0;
    if (!query) {
      res.status(400).json({
        error: 'No search query'
      });
      return;
    } else {
      let pageQuery = page > 0 ? '&page=' + page : '';
      server.api.get('/search/person?query=' + query + pageQuery, (err, data, apiRes) => {
        if (err) {
          logger.error('Error TMDB search', err);
          res.status(400).json({
            error: 'Error searching for ' + query
          });
          return;
        }
        if (apiRes.statusCode == 200) {
          let resData = {
            results: [],
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results
          };
          for (let i = 0; i < data.results.length; i++) {
            let result = parseSearchResult(data.results[i], 'person');
            if (result) resData.results.push(result);
          }
          res.status(200).json(resData);
          return;
        } else {
          logger.error('Error search from TMDB (' + apiRes.statusCode + ')', data);
          res.status(400).json({
            error: 'Error searching for ' + query
          });
          return;
        }
      });
    }
  });

  // ---------- HELPER FUNCTIONS ----------

  function parseSearchResult(result, mediaType) {
    let out = {
      media_type: mediaType,
      id: result.id
    };
    switch (mediaType) {
      case 'movie':
        out.original_title = result.original_title;
        out.title = result.title;
        out.overview = result.overview;
        out.year = new Date(result.release_date).getFullYear();
        out.original_language = result.original_language;
        out.vote_average = result.vote_average;
        if (result.poster_path) out.image_url = server.api.getImageURL('poster', 350, result.poster_path);
        else out.image_url = '/img/poster_unknown_border.png';
        out.genres = arrayToString(server.api.convertMovieGenreIds(result.genre_ids), true);
        break;
      case 'tv':
        out.original_name = result.original_name;
        out.name = result.name;
        out.overview = result.overview;
        out.original_language = result.original_language;
        out.year = new Date(result.first_air_date).getFullYear();
        out.vote_average = result.vote_average;
        if (result.poster_path) out.image_url = server.api.getImageURL('poster', 350, result.poster_path);
        else out.image_url = '/img/poster_unknown_border.png';
        out.genres = arrayToString(server.api.convertShowGenreIds(result.genre_ids), true);
        break;
      case 'person':
        out.name = result.name;
        let known_for_array = [];
        for (let i = 0; i < result.known_for.length; i++) {
          let obj = result.known_for[i];
          if (obj.media_type == 'movie') {
            known_for_array.push(obj.title);
          } else if (obj.media_type == 'tv') {
            known_for_array.push(obj.name);
          }
        }
        out.known_for = arrayToString(known_for_array);
        if (result.profile_path) out.image_url = server.api.getImageURL('profile', 1000, result.profile_path);
        else out.image_url = '/img/person_unknown_border.png';
        break;
      default:
        return null;
    }
    return out;
  }

  function arrayToString(array, onlyCommas) {
    let out = '';
    for (let i = 0; i < array.length; i++) {
      if (i > 0) {
        if (!onlyCommas && i == array.length - 1) out += ' and ';
        else out += ', ';
      }
      out += array[i];
    }
    return out;
  }

  return router;
};
