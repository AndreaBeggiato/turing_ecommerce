const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

async function init() {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  });

  app.use(limiter);
  app.use(cors());

  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  return app;
}

module.exports = init();
