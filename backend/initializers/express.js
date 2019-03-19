const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

async function init() {
  app.use(cors());

  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  return app;
}

module.exports = init();
