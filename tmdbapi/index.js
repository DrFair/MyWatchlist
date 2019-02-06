'use strict';

const request = require('request');
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const jsonFile = require('jsonfile');
const path = require('path');

class TMDBClient {
  // cacheFilePath is optional, if given, the api will keep an up to date cache files
  // Caches to keep up is: configuration, movie and show genre ids
  // Configuration data will be stored at client.configuration
  constructor(apiKey, cacheFilePath) {
    this.apiKey = apiKey;
    this.apiURL = 'https://api.themoviedb.org/3/';
    if (cacheFilePath) {
      this.cacheFilePath = cacheFilePath;
      updateCache(path.join(cacheFilePath, 'configuration.json'), '/configuration', 'configuration', 0);
      updateCache(path.join(cacheFilePath, 'movie_genres.json'), '/genre/movie/list', 'movie_genres', 0);
      updateCache(path.join(cacheFilePath, 'show_genres.json'), '/genre/tv/list', 'show_genres', 0);
    }

    const self = this;
    function updateCache(filePath, apiPath, storePath, inTime) { // Helper function in constructor scope
      setTimeout(() => {
        self.checkCache(filePath, apiPath, storePath, (err, updated, timeToNext) => {
          if (err) {
            logger.info('Update ' + apiPath + ' cache err: ' + err);
            return updateCache(filePath, apiPath, storePath, 10 * 60 * 1000); // Wait 10 minutes to next update
          }
          if (updated) {
            logger.info('API ' + apiPath + ' cache updated');
          }
          return updateCache(filePath, apiPath, storePath, timeToNext + 1000);
        });
      }, inTime);
    }
  }

  // Callback is err, json, res
  request(apiCall, method, callback) {
    const options = {
      url: urlAppend(this.apiURL, apiCall),
      method: method
    }
    // Add api key
    if (options.url.indexOf('?') == -1) {
      options.url = options.url + '?api_key=' + this.apiKey;
    } else {
      if (options.url.charAt(options.url.length - 1) != '&') options.url = options.url + '&';
      options.url = options.url + 'api_key=' + this.apiKey;
    }
    // Call request package
    request(options, (err, res, body) => {
      if (err) {
        return callback(err);
      }
      let json = null;
      try { // Try parse json
        json = JSON.parse(body);
      } catch (e) {
        // Send empty json and res
        return callback(e, {}, res);
      }
      return callback(null, json, res);
    });
  }

  // Callback is err, json
  get(apiCall, callback) {
    this.request(apiCall, 'GET', callback);
  }

  // Will return an array of genres based of an array of genre ids
  convertMovieGenreIds(genreIds) {
    if (!this.movie_genres) {
      throw new Error('API needs to get movie_genres first');
    }
    const out = [];
    for (var i = 0; i < genreIds.length; i++) {
      for (var j = 0; j < this.movie_genres.genres.length; j++) {
        if (genreIds[i] == this.movie_genres.genres[j].id) {
          out.push(this.movie_genres.genres[j].name);
          break;
        }
      }
    }
    return out;
  }

  // Will return an array of genres based of an array of genre ids
  convertShowGenreIds(genreIds) {
    if (!this.show_genres) {
      throw new Error('API needs to get show_genres first');
    }
    const out = [];
    for (var i = 0; i < genreIds.length; i++) {
      for (var j = 0; j < this.show_genres.genres.length; j++) {
        if (genreIds[i] == this.show_genres.genres[j].id) {
          out.push(this.show_genres.genres[j].name);
          break;
        }
      }
    }
    return out;
  }

  // Will return the image url with at least the desired size (or original)
  // Valid imageType values are: (if not valid, original image url is returned)
  // backdrop, logo, poster, profile, still
  getImageURL(imageType, desiredSize, imagePath) {
    if (!this.configuration) {
      throw new Error('API needs to get configuration first');
    }
    let urlBuilder = this.configuration.images.base_url;
    if (this.configuration.images[imageType + '_sizes']) {
      urlBuilder += findSize(this.configuration.images[imageType + '_sizes'], desiredSize);
    } else {
      urlBuilder += 'original';
    }
    if (imagePath.charAt(0) == '/') {
      return urlBuilder + imagePath;
    } else {
      return urlBuilder + '/' + imagePath;
    }

    function findSize(sizes, desiredSize) { // Helper in function scope
      for (var i = 0; i < sizes.length; i++) {
        if (sizes[i].charAt(0) == 'w' || sizes[i].charAt(0) == 'h') {
          var size = parseInt(sizes[i].substring(1)) || 0;
          if (desiredSize <= size) return sizes[i];
        }
      }
      return sizes[sizes.length - 1];
    }
  }

  // Cache stores some TMDB data in files for future use
  // apiPath is the url which to get from example: '/configuration'
  // storePath (optional) is the key where it will store the data in this object
  // Example: 'configuration' will store it at this.configuration
  // Callback is err, updated, timeToNextUpdate
  // updated param is true if data was updated, false if data was up to date already
  // timeToNextUpdate param is the time in ms until the data is too old (time the next update should be ran)
  checkCache(filePath, apiPath, storePath, callback) {
    if (!callback) {
      callback = storePath;
      storePath = null;
    }
    const self = this;
    // If data is older than minAge, update it from API
    const minAge = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    if (fs.existsSync(filePath)) {
      jsonFile.readFile(filePath, (err, data) => {
        if (err) {
          return callback(err);
        }
        if (!data.age || data.age < minAge) {
          updateConf(filePath, callback);
        } else {
          var nextUpdate = minAge - data.age;
          if (storePath) self[storePath] = data;
          return callback(null, false, nextUpdate);
        }
      });
    } else {
      updateConf(filePath, callback);
    }

    function updateConf(filePath, callback) { // Helper function in scope
      self.get(apiPath, (err, data, res) => {
        if (err) {
          return callback(err);
        }
        if (res.statusCode == 200) {
          // Add age
          data.age = Date.now();
          if (storePath) self[storePath] = data;
          // Ensure directory is made
          var dirPath = path.dirname(filePath);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
          }
          jsonFile.writeFile(filePath, data, { spaces: 2 }, (err) => {
            if (err) {
              return callback(err);
            }
            var nextUpdate = minAge - data.age;
            return callback(null, true, nextUpdate);
          });
        } else {
          return callback(data);
        }
      });
    }
  }

  // Downloads and extracts the latest daily TMDB file export
  // Type must be one of: movie, tv_series, person, collection, tv_network, keyword, production_company
  // Destination must be
  // Calblack is err (null if completed)
  downloadExport(type, destination, callback) {
    // Check for valid types
      if (!(type === 'movie' ||
            type === 'tv_series' ||
            type === 'person' ||
            type === 'collection' ||
            type === 'tv_network' ||
            type === 'keyword' ||
            type === 'production_company')) {
        return callback(new Error('Invalid type'));
      }
      let writer = fs.createWriteStream(destination);
      let date = new Date(Date.now() - 8 * 60 * 60 * 1000); // 8 hours ago
      // Read about when the files are available at
      // https://developers.themoviedb.org/3/getting-started/daily-file-exports
      let downloadURL = 'http://files.tmdb.org/p/exports/' + type + '_ids_' +
                        ('0' + (date.getUTCMonth() + 1)).slice(-2) + '_' +
                        ('0' + date.getUTCDate()).slice(-2) + '_' +
                        date.getUTCFullYear() + '.json.gz';
      http.get(downloadURL, function (res) {
        res.pipe(zlib.createGunzip()).pipe(writer);
        res.on('end', function () {
          return callback(null);
        });
        res.on('error', function () {
          return callback(new Error('Error writing to file'));
        });
      });
  }
}

module.exports = TMDBClient;

// Helper functions
function urlAppend(url, append) {
  if (url.charAt(url.length - 1) === '/') {
    url = url.substring(0, url.length - 1);
  }
  if (append.charAt(0) == '/') {
    append = append.substring(1);
  }
  return url + '/' + append;
}
