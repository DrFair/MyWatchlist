'use strict';

const mailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

class Gmailer {
  constructor(fromText, gmailUsername, gmailPassword) {
    this.fromText = fromText;
    this.username = gmailUsername;
    this.gmail = gmailUsername + '@gmail.com';
    this.transporter = mailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.gmail,
        pass: gmailPassword
      }
    });
  }

  // Callback is err, info
  sendMail(toEmail, subject, html, callback) {
    this.transporter.sendMail({
      from: '"' + this.fromText + '" ' + this.gmail,
      to: toEmail,
      subject: subject,
      html: html
    }, callback);
  }

  // Callback is err, info
  sendWelcome(toEmail, recipientName, callback) {
    ejs.renderFile(path.join(__dirname, 'templates/welcome.ejs'), {
      recipientName: recipientName
    }, (err, html) => {
      if (err) {
        logger.error('Send welcome email ejs error', err);
        return;
      }
      this.sendMail(toEmail, 'Welcome to MyWatchlist!', html, callback);
    });
  }

  // Callback is err, info
  sendEmailConfirm(toEmail, recipientName, confirmLink, callback) {
    ejs.renderFile(path.join(__dirname, 'templates/emailConfirm.ejs'), {
      recipientName: recipientName,
      confirmLink: confirmLink
    }, (err, html) => {
      if (err) {
        logger.error('Send confirm email ejs error', err);
        return;
      }
      this.sendMail(toEmail, 'Confirm email', html, callback);
    });
  }

  // Callback is err, info
  sendPasswordReset(toEmail, recipientName, resetLink, callback) {
    ejs.renderFile(path.join(__dirname, 'templates/passwordreset.ejs'), {
      recipientName: recipientName,
      resetLink: resetLink
    }, (err, html) => {
      if (err) {
        logger.error('Send password reset email ejs error', err);
        return;
      }
      this.sendMail(toEmail, 'Passsword reset', html, callback);
    });
  }
}

module.exports = Gmailer;
