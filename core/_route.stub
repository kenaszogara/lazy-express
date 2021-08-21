"use strict";

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

/**
 * Login Authentication: we declare the login api to sign Users with token.
 * check auth/auth.js to understand the simple token signing.
 * To protect a route with token signing, simply add verifyToken function from auth/auth.js
 * in the router function.
 *
 * Ex:
 * -----------------------------------------------------------------
 * const { verifyToken } = require("../auth/auth");
 * router.post("/", verifyToken, create);
 * -----------------------------------------------------------------
 *
 * If you don't want to use this auth login, just simply ignore it or comment the below declaration.
 */
const { login } = require("../auth/auth");
router.post("/login", login);

/**
 * Routes Declaration: The following function will import all generated route
 * from src/routes/*.js and require them to be used with route.use(), with the
 * file name as the name of the route.
 *
 * If for instance you want to declare you own route then feel free to require them here
 * and put it below as shown in example:
 *
 * ------------------------------------------------------
 * const myUserRoute = require('./my_route_file');
 * router.use('/my_route_name', myUserRoute);
 * ------------------------------------------------------
 *
 * the above route will be exposed to http://localhost:5000/api/v1/<my_route_name>
 */
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== "index.js" && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const routes = require(path.join(__dirname, file));
    router.use(`/${file.replace(".js", "")}`, routes);
  });

module.exports = router;
