require("@babel/register")({
  presets: ["@babel/preset-env"],
  ignore: ['node_modules', '.next'],
});

require('dotenv').config();

module.exports = require('./server.js');
