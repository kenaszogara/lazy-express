"use strict";

const fs = require("fs");
const path = require("path");

let data = {};

/**
 * The following function will import all generated file in this directory.
 * So you just need to require this file inside <root_dir>/swagger.js,
 * to get all the necessary objects created in this folder :)
 */
fs.readdirSync(__dirname).forEach((file) => {
  const doc = require(path.join(__dirname, file));
  data = { ...data, ...doc };
});

module.exports = data;
