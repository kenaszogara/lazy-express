#!/usr/bin/env node

"use strict";

const fs = require("fs");
const { exit } = require("process");

const params = process.argv;
const BASE_PATH = params[1];
const PARAMS_1 = params[2];
const PARAMS_2 = params[3];

const CONFIG_FOLDER_DESTINATION = `${process.cwd()}/config`;
const MODEL_FOLDER_DESTINATION = `${process.cwd()}/models`;
const CONTROLLER_FOLDER_DESTINATION = `${process.cwd()}/controllers`;
const ROUTE_FOLDER_DESTINATION = `${process.cwd()}/routes`;
const MIGRATION_FOLDER_DESTINATION = `${process.cwd()}/migrations`;

// template
const MIGRATION_TEMPLATE = `${__dirname}/core/sequelize/template/migration.stub`;
const MODEL_TEMPLATE = `${__dirname}/core/sequelize/template/model.stub`;
const CONTROLLER_TEMPLATE = `${__dirname}/core/sequelize/template/controller.stub`;
const ROUTE_TEMPLATE = `${__dirname}/core/sequelize/template/route.stub`;
const CONFIG_TEMPLATE = `${__dirname}/core/sequelize/template/config.stub`;
const MODEL_INDEX_TEMPLATE = `${__dirname}/core/sequelize/template/model_index.stub`;

// manual
const MANUAL_HELP = `${__dirname}/core/manual/help.stub`;
const GENERATE_HELP = `${__dirname}/core/manual/generate/help.stub`;

// console.log(params);

/**
 * TODOS:
 *  [X] default: create Model, Migration, Controller, Route for an API endpoint
 *  [X] fields: get all fields
 *  - database: create Controller, Model, Route from all tablename in database
 *  - model: create Model only
 *  - migration: create Migration only
 *  - controller: create Controller only
 *  - route: create Route only
 *  - sync database: using migration files ??
 *  [?] auto generate api documentation using swagger??
 *  [?] scaffold view with simple crud table
 *  [?] env option: choose between mysql or mongoose or sequelize
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

function main(c) {
  const command = COMMAND.LIST.includes(c) ? c : "";

  switch (command) {
    case COMMAND.HELP:
      showHelp(MANUAL_HELP);
      break;

    case COMMAND.INIT:
      initializeProject();
      console.log("Project succesfully initialized");
      break;

    case COMMAND.GENERATE:
      checkConfig();
      console.log(`Generating Model/Migration/Controller/Route: ${PARAMS_2}`);
      createSequelizeModel(PARAMS_2);
      createSequelizMigration(PARAMS_2);
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
  const dataConfig = fs.readFileSync(CONFIG_TEMPLATE, "utf8");

  if (!fs.existsSync(targetConfig)) {
    fs.writeFile(targetConfig, dataConfig, function (err) {
      if (err) return console.log(err);
    });
  }

  // create models/index.js
  const targetIndex = `${MODEL_FOLDER_DESTINATION}/index.js`;
  const dataIndex = fs.readFileSync(MODEL_INDEX_TEMPLATE, "utf8");

  if (!fs.existsSync(targetIndex)) {
    fs.writeFile(targetIndex, dataIndex, function (err) {
      if (err) return console.log(err);
    });
  }
}

function checkConfig() {
  // check config/config.json
  const target = `${CONFIG_FOLDER_DESTINATION}/config.json`;

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

    const data = fs.readFileSync("./core/template/model", "utf8");

    // mysql_db_connection
    // output = data.replace("$$MODEL_SELECTION$$", "./../../core/mysql_model");

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

    const data = fs.readFileSync("./core/template/controller", "utf8");
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

    const data = fs.readFileSync("./core/template/route", "utf8");
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

let MODEL_FIELD;
let MIGRATION_FIELD;
let TABLE_NAME;

function getModelOptions() {
  // show help
  params.forEach((o) => {
    const option = MODEL_OPTIONS.LIST.includes(o) ? o : "";
    switch (option) {
      case MODEL_OPTIONS.HELP:
        showHelp(GENERATE_HELP);
        break;
      default:
        break;
    }
  });

  params.forEach((o, index) => {
    const option = MODEL_OPTIONS.LIST.includes(o) ? o : "";

    switch (option) {
      case MODEL_OPTIONS.FIELD:
        let modelField = "";
        let migrationField = "";
        let n = "\n\t\t\t";
        let t = "\t\t\t";
        const fields = params[index + 1].toString().split(";");
        // ["name:string", "number:integer", "date:date", "uuid:uuid", "boolean:boolean"]

        fields.forEach((field) => {
          let item = field.split(":");
          let name = item[0];
          let type = item[1];
          let dataType;
          let seqType;

          switch (type) {
            case "string":
              dataType = "DataTypes.STRING";
              seqType = "Sequelize.STRING";
              break;

            case "integer":
              dataType = "DataTypes.INTEGER";
              seqType = "Sequelize.INTEGER";
              break;

            case "date":
              dataType = "DataTypes.DATE";
              seqType = "Sequelize.DATE";
              break;

            case "uuid":
              dataType = "DataTypes.UUID";
              seqType = "Sequelize.UUID";
              break;

            case "boolean":
              dataType = "DataTypes.BOOLEAN";
              seqType = "Sequelize.BOOLEAN";
              break;

            default:
              throw Error("Missing datatype");
          }

          // concat
          modelField == ""
            ? (modelField = n + name + ": " + dataType + ",") // first line no tab
            : (modelField = modelField + n + name + ": " + dataType + ","); // add tab after

          migrationField == ""
            ? (migrationField = n + name + ": { type: " + seqType + " },") // first line no tab
            : (migrationField =
                migrationField + n + name + ": { type: " + seqType + " },");
        });

        MODEL_FIELD = modelField;
        MIGRATION_FIELD = migrationField;
        break;

      case MODEL_OPTIONS.TABLE:
        const tableName = params[index + 1].toString();
        TABLE_NAME = tableName;
        break;

      default:
        // console.log("no options");
        break;
    }
  });
}

function createModelIndex() {
  const target = `${MODEL_FOLDER_DESTINATION}/index.js`;
  const data = fs.readFileSync(MODEL_INDEX_TEMPLATE, "utf8");

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

    const data = fs.readFileSync(MODEL_TEMPLATE, "utf8");

    output = data;

    getModelOptions();

    // model_name
    for (let i = 0; i < 4; i++) {
      output = output.replace("$$MODEL_NAME$$", modelName);
    }

    // table_name
    output = output.replace(
      "$$TABLE_NAME$$",
      TABLE_NAME == undefined ? tableName : TABLE_NAME
    );

    // -f option (required)
    if (MODEL_FIELD == undefined) {
      throw Error("field flag is required");
    }
    output = output.replace("$$MODEL_FIELDS$$", MODEL_FIELD);

    // -a option
    // output = output.replace("$$MODEL_ASSOCIATION$$", ASSOCITION_OPTION);

    // write model file
    mkdirIfNotExist(MODEL_FOLDER_DESTINATION);
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

function createSequelizMigration(a) {
  if (a == undefined) throw Error("required variable name");

  try {
    let output = "";
    const date = new Date()
      .toISOString()
      .split(".")[0]
      .replace(/[^\d]/gi, "")
      .toString();
    const tableName = a.toLowerCase();
    const filename = `${date}-create-${tableName}.js`;
    const destination = `${MIGRATION_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync(MIGRATION_TEMPLATE, "utf8");

    output = data;

    getModelOptions();

    // table name
    for (let i = 0; i < 2; i++) {
      output = output.replace(
        "$$TABLE_NAME$$",
        TABLE_NAME == undefined ? tableName : TABLE_NAME
      );
    }

    // -f option (required)
    if (MIGRATION_FIELD == undefined) {
      throw Error("field flag is required");
    }

    output = output.replace("$$MIGRATION_FIELD$$", MIGRATION_FIELD);

    // write model file
    mkdirIfNotExist(MIGRATION_FOLDER_DESTINATION);
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`Created: src > migrations > ${filename}`);
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

    const data = fs.readFileSync(CONTROLLER_TEMPLATE, "utf8");
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

    const data = fs.readFileSync(ROUTE_TEMPLATE, "utf8");
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
main(PARAMS_1);
