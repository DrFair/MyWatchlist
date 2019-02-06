var jsonFile = require('jsonfile');
var fs = require('fs');
var path = require('path');

exports.loadSettings = function (settingsFile) {
  if (fs.existsSync(settingsFile)) {
    var settingsData = jsonFile.readFileSync(settingsFile);
    if (!settingsData.tmdbkey) {
      console.log('Project ' + settingsFile + ' file is missing tmdbkey.');
      process.exit(1);
    }
    if (!settingsData.gmailUsername) {
      console.log('Project ' + settingsFile + ' file is missing gmailUsername.');
      process.exit(1);
    }
    if (!settingsData.gmailPassword) {
      console.log('Project ' + settingsFile + ' file is missing gmailPassword.');
      process.exit(1);
    }
    if (!settingsData.port) {
      settingsData.port = 80;
      console.log('Project ' + settingsFile + ' file is missing port, defaulted to' + settingsData.port + '.');
    }
    if (!settingsData.hostname) {
      settingsData.hostname = 'localhost';
      console.log('Project ' + settingsFile + ' file is missing hostname, defaulted to ' + settingsData.hostname + '.');
    }
    if (!settingsData.storagepath) {
      settingsData.storagepath = path.join(__dirname, 'storage');
      console.log('Project ' + settingsFile + ' file is missing storagepath, defaulted to ' + settingsData.storagepath + '.');
    }
    return settingsData;
  } else {
    console.log('Project missing ' + settingsFile + ' file.');
    process.exit(1);
  }
};
