"use strict";

const fs = require("fs");
const { exit } = require("process");

const params = process.argv;
const BASE_PATH = params[1];
const PARAMS_1 = params[2];
const PARAMS_2 = params[3];

const CONFIG_FOLDER_DESTINATION = `${__dirname}/src/config`;
const MODEL_FOLDER_DESTINATION = `${__dirname}/src/models`;
const CONTROLLER_FOLDER_DESTINATION = `${__dirname}/src/controllers`;
const ROUTE_FOLDER_DESTINATION = `${__dirname}/src/routes`;
const MIGRATION_FOLDER_DESTINATION = `${__dirname}/src/migrations`;

// console.log(params);

/**
 * Generate options:
 *  - default: create Model, Migration, Controller, Route for an API endpoint
 *  - database: create Controller, Model, Route from all tablename in database
 *  - model: create Model only
 *  - fields: get all fields
 *  - migration: create Migration only
 *  - controller: create Controller only
 *  - route: create Route only
 *  - (?) env option: choose between mysql or mongoose
 *
 * @param {-d} databaseName
 * @param {-f} fields
 * @param {-t} tableName
 */

const COMMAND = {
  LIST: [
    "--help",
    "init",
    "generate",
    "generate:model",
    "generate:controller",
    "generate:route",
  ],
  HELP: "--help",
  INIT: "init",
  GENERATE: "generate",
  GENERATE_MODEL: "generate:model",
  GENERATE_CONTROLLER: "generate:controller",
  GENERATE_ROUTE: "generate:route",
};

function getCommand(c) {
  const command = COMMAND.LIST.includes(c) ? c : "";

  switch (command) {
    case COMMAND.HELP:
      showHelp("./lib/manual/help");
      break;

    case COMMAND.INIT:
      initializeProject();
      break;

    case COMMAND.GENERATE:
      checkConfig();
      createSequelizeModel(PARAMS_2);
      createSequelizeController(PARAMS_2);
      createSequelizeRoute(PARAMS_2);
      break;

    default:
      throw Error("Unknown command");
  }
}

function initializeProject() {
  // creat folders: models, controllers, routes, config, migrations
  mkdirIfNotExist(CONFIG_FOLDER_DESTINATION);
  mkdirIfNotExist(MODEL_FOLDER_DESTINATION);
  mkdirIfNotExist(CONTROLLER_FOLDER_DESTINATION);
  mkdirIfNotExist(ROUTE_FOLDER_DESTINATION);
  mkdirIfNotExist(MIGRATION_FOLDER_DESTINATION);

  // create config/config.json
  const targetConfig = `${CONFIG_FOLDER_DESTINATION}/config.json`;
  const dataConfig = fs.readFileSync("./lib/sequelize/template/config", "utf8");

  if (!fs.existsSync(targetConfig)) {
    fs.writeFile(targetConfig, dataConfig, function (err) {
      if (err) return console.log(err);
    });
  }

  // create models/index.js
  const targetIndex = `${MODEL_FOLDER_DESTINATION}/index.js`;
  const dataIndex = fs.readFileSync(
    "./lib/sequelize/template/model_index",
    "utf8"
  );

  if (!fs.existsSync(targetIndex)) {
    fs.writeFile(targetIndex, dataIndex, function (err) {
      if (err) return console.log(err);
    });
  }
}

function checkConfig() {
  // check config/config.json
  const target = `${CONFIG_FOLDER_DESTINATION}/config.json`;
  // const dataConfig = fs.readFileSync("./lib/sequelize/template/config", "utf8");

  if (!fs.existsSync(target)) {
    throw Error(
      "config.json not found. Please initialize project first by with command 'lazy init'"
    );
  }
}

function mkdirIfNotExist(target, ifNotExist = () => {}) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    ifNotExist();
  }
}

function showHelp(target) {
  const data = fs.readFileSync(target, "utf8");
  console.log(data);
  exit();
}

/**
 * Generator basic MySQL
 *
 */
function createMysqlModel(a) {
  if (a == undefined) return console.log("error");

  try {
    let output = "";
    const modelName = a.charAt(0).toUpperCase() + a.slice(1);
    const tableName = a.toLowerCase();
    const filename = `${tableName}_model.js`;
    const destination = `${MODEL_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync("./lib/template/model", "utf8");

    // mysql_db_connection
    // output = data.replace("$$MODEL_SELECTION$$", "./../../lib/mysql_model");

    // model_name
    output = output.replace("$$MODEL_NAME$$", modelName);
    output = output.replace("$$MODEL_NAME$$", modelName);

    // table_name
    output = output.replace("$$TABLE_NAME$$", tableName);

    // write model file
    mkdirIfNotExist(MODEL_FOLDER_DESTINATION);
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`src > models > ${filename}`);
    });

    // console.log(output);
  } catch (err) {
    console.error(err);
  }
}

function createMysqlController(a) {
  if (a == undefined) return console.log("error");

  try {
    let output = "";
    const modelName = a.charAt(0).toUpperCase() + a.slice(1);
    const tableName = a.toLowerCase();
    const filename = `${tableName}_controller.js`;
    const destination = `${CONTROLLER_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync("./lib/template/controller", "utf8");
    output = data;

    // import model

    // model_name
    // output = output.replace("$$MODEL_NAME$$", modelName);
    for (let i = 0; i < 7; i++) {
      output = output.replace("$$MODEL_NAME$$", modelName);
    }

    // table_name
    // output = output.replace("$$TABLE_NAME$$", tableName);
    for (let i = 0; i < 13; i++) {
      output = output.replace("$$TABLE_NAME$$", tableName);
    }

    // write model file
    mkdirIfNotExist(CONTROLLER_FOLDER_DESTINATION);
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`src > controllers > ${filename}`);
    });

    // console.log(output);
  } catch (err) {
    console.error(err);
  }
}

function createMysqlRoute(a) {
  if (a == undefined) return console.log("error");

  try {
    let output = "";
    const modelName = a.charAt(0).toUpperCase() + a.slice(1);
    const tableName = a.toLowerCase();
    const filename = `${tableName}_route.js`;
    const destination = `${ROUTE_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync("./lib/template/route", "utf8");
    output = data;

    // import model

    // model_name
    // output = output.replace("$$MODEL_NAME$$", modelName);
    for (let i = 0; i < 1; i++) {
      output = output.replace("$$MODEL_NAME$$", modelName);
    }

    // table_name
    // output = output.replace("$$TABLE_NAME$$", tableName);
    for (let i = 0; i < 1; i++) {
      output = output.replace("$$TABLE_NAME$$", tableName);
    }

    // write model file
    mkdirIfNotExist(ROUTE_FOLDER_DESTINATION);
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`src > routes > ${filename}`);
    });

    // console.log(output);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Generator with Sequelize
 *
 */

const MODEL_OPTIONS = {
  LIST: ["--help", "-f", "-t"],
  HELP: "--help",
  FIELD: "-f",
  TABLE: "-t",
};

let FIELD_OPTION;
let TABLE_OPTION;

function getModelOptions() {
  params.forEach((o) => {
    const option = MODEL_OPTIONS.LIST.includes(o) ? o : "";
    switch (option) {
      case MODEL_OPTIONS.HELP:
        showHelp("./lib/manual/generate/help");
        break;
      default:
        break;
    }
  });

  params.forEach((o, index) => {
    const option = MODEL_OPTIONS.LIST.includes(o) ? o : "";

    switch (option) {
      case MODEL_OPTIONS.FIELD:
        let data = "";
        let n = "\n\t\t\t";
        let t = "\t\t\t";
        const fields = params[index + 1].toString().split(";");
        // ["name:string", "number:integer", "date:date", "uuid:uuid", "boolean:boolean"]

        fields.forEach((field) => {
          let item = field.split(":");
          let name = item[0];
          let type = item[1];
          let dataType;

          switch (type) {
            case "string":
              dataType = "DataTypes.STRING";
              break;

            case "integer":
              dataType = "DataTypes.INTEGER";
              break;

            case "date":
              dataType = "DataTypes.DATE";
              break;

            case "uuid":
              dataType = "DataTypes.UUID";
              break;

            case "boolean":
              dataType = "DataTypes.BOOLEAN";
              break;

            default:
              dataType = "DataTypes.STRING";
              break;
          }

          // concat
          data == ""
            ? (data = n + name + ": " + dataType + ",") // first line no tab
            : (data = data + n + name + ": " + dataType + ","); // add tab after
        });

        FIELD_OPTION = data;
        break;

      case MODEL_OPTIONS.TABLE:
        const tableName = params[index + 1].toString();
        TABLE_OPTION = tableName;
        break;

      default:
        // console.log("no options");
        break;
    }
  });
}

function createModelIndex() {
  const target = `${MODEL_FOLDER_DESTINATION}/index.js`;
  const data = fs.readFileSync("./lib/sequelize/template/model_index", "utf8");

  if (!fs.existsSync(target)) {
    fs.writeFile(target, data, function (err) {
      if (err) return console.log(err);
      console.log("Created: src > models > index");
    });
  }
}

function createSequelizeModel(a) {
  if (a == undefined) throw Error("required variable name");

  try {
    let output = "";
    const modelName = a.charAt(0).toUpperCase() + a.slice(1);
    const tableName = a.toLowerCase();
    const filename = `${tableName}.js`;
    const destination = `${MODEL_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync("./lib/sequelize/template/model", "utf8");

    output = data;

    getModelOptions();

    // model_name
    for (let i = 0; i < 4; i++) {
      output = output.replace("$$MODEL_NAME$$", modelName);
    }

    // table_name
    output = output.replace(
      "$$TABLE_NAME$$",
      TABLE_OPTION == undefined ? tableName : TABLE_OPTION
    );

    // -f option (required)
    if (FIELD_OPTION == undefined) {
      throw Error("field flag is required");
    }
    output = output.replace("$$MODEL_FIELDS$$", FIELD_OPTION);

    // -a option
    // output = output.replace("$$MODEL_ASSOCIATION$$", ASSOCITION_OPTION);

    // write model file
    mkdirIfNotExist(MODEL_FOLDER_DESTINATION);
    createModelIndex();
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`Created: src > models > ${filename}`);
    });

    // console.log(output);
  } catch (err) {
    console.error(err);
    exit();
  }
}

function createSequelizeController(a) {
  if (a == undefined) throw Error("required variable name");

  try {
    let output = "";
    const modelName = a.charAt(0).toUpperCase() + a.slice(1);
    const tableName = a.toLowerCase();
    const filename = `${tableName}.js`;
    const destination = `${CONTROLLER_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync("./lib/sequelize/template/controller", "utf8");
    output = data;

    // import model

    // model_name
    // output = output.replace("$$MODEL_NAME$$", modelName);
    for (let i = 0; i < 7; i++) {
      output = output.replace("$$MODEL_NAME$$", modelName);
    }

    // table_name
    // output = output.replace("$$TABLE_NAME$$", tableName);
    for (let i = 0; i < 13; i++) {
      output = output.replace("$$TABLE_NAME$$", tableName);
    }

    // write model file
    mkdirIfNotExist(CONTROLLER_FOLDER_DESTINATION);
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`Created: src > controllers > ${filename}`);
    });

    // console.log(output);
  } catch (err) {
    console.error(err);
  }
}

function createSequelizeRoute(a) {
  if (a == undefined) throw Error("required variable name");

  try {
    let output = "";
    const modelName = a.charAt(0).toUpperCase() + a.slice(1);
    const tableName = a.toLowerCase();
    const filename = `${tableName}.js`;
    const destination = `${ROUTE_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync("./lib/sequelize/template/route", "utf8");
    output = data;

    // import model

    // model_name
    // output = output.replace("$$MODEL_NAME$$", modelName);
    for (let i = 0; i < 1; i++) {
      output = output.replace("$$MODEL_NAME$$", modelName);
    }

    // table_name
    // output = output.replace("$$TABLE_NAME$$", tableName);
    for (let i = 0; i < 1; i++) {
      output = output.replace("$$TABLE_NAME$$", tableName);
    }

    // write model file
    mkdirIfNotExist(ROUTE_FOLDER_DESTINATION);
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`Created: src > routes > ${filename}`);
    });

    // console.log(output);
  } catch (err) {
    console.error(err);
  }
}

/**
 *  Start of main
 */
getCommand(PARAMS_1);
