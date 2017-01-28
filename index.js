'use strict';

// Gotta set a few config variables here since AWS Lambda restricts ENV values
// to a limiting format (like not allowing commas).
const config = {
  TEXT_CHECKIN: '@ NYC Office',
  TEXT_CHECKOUT: ':wave: Heading out, have a good night'
};

const https = require('https');
const url = require('url');

exports.handler = (event, context, callback) => {
  getWeather()
    .then(weather => getMessage(event, weather))
    .then(sendMessage)
    .then(body => callback(null, body))
    .catch(callback);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getMessage(event, weather) {
  let message = { username: process.env.USERNAME };

  if (event.clickType === 'SINGLE') {
    message.text = config.TEXT_CHECKIN || 'Checking in';
  } else if (event.clickType === 'DOUBLE') {
    message.text = config.TEXT_CHECKOUT || 'Checking out';
  } else if (event.clickType === 'LONG') {
    const emojis = ['poultry_leg', 'hamburger', 'pizza', 'taco', 'burrito', 'ramen', 'sushi', 'chicken'];
    const emoji = emojis[getRandomInt(0, emojis.length - 1)];
    message.text = `:${emoji}: Grabbing lunch`;
  } else {
    return Promise.reject(Error('Invalid clickType'));
  }

  if (weather && event.clickType !== 'LONG') {
    message.attachments = [{
      fallback: weather.summary,
      fields: [
        {
          title: 'Currently',
          value: `${weather.emoji} ${weather.summary} (${Math.round(weather.apparentTemperature)}°)`,
          short: false
        }
      ],
    }]
  }

  return message;
}

function getWeather() {
  if (!process.env.DARK_SKY_KEY) return Promise.resolve(null);

  const options = {
    hostname: 'api.darksky.net',
    path: `/forecast/${process.env.DARK_SKY_KEY}/${process.env.LATITUDE},${process.env.LONGITUDE}`
  }

  const iconEmoji = {
    "clear-day": ":sunny:",
    "clear-night": ":crescent_moon:",
    "rain": ":umbrella_with_rain_drops:",
    "snow": ":snowflake:",
    "sleet": ":rain_cloud:",
    "wind": ":wind_blowing_face:",
    "fog": ":fog:",
    "cloudy": ":cloud:",
    "partly-cloudy-day": ":partly_sunny:",
    "partly-cloudy-night": ":partly_sunny:"
  };

  return new Promise((resolve, reject) => {
    // res: https://darksky.net/dev/docs/response
    const req = https.request(options, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        body = JSON.parse(body);
        resolve({
          summary: body.currently.summary,
          apparentTemperature: body.currently.apparentTemperature,
          emoji: iconEmoji[body.currently.icon]
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function sendMessage(message) {
  const parts = url.parse(process.env.WEBHOOK);
  const options = {
    hostname: parts.host,
    path: parts.path,
    method: 'POST'
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });

    req.on('error', reject);
    req.write(JSON.stringify(message));
    req.end();
  });
}