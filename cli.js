#!/usr/bin/env node

"use strict";

const fs = require("fs");
const { exit } = require("process");

const params = process.argv;
const BASE_PATH = params[1];
const PARAMS_1 = params[2];
const PARAMS_2 = params[3];

// destination target
const CONFIG_FOLDER_DESTINATION = `${process.cwd()}/config`;
const MODEL_FOLDER_DESTINATION = `${process.cwd()}/models`;
const CONTROLLER_FOLDER_DESTINATION = `${process.cwd()}/controllers`;
const ROUTE_FOLDER_DESTINATION = `${process.cwd()}/routes`;
const MIGRATION_FOLDER_DESTINATION = `${process.cwd()}/migrations`;

const SWAGGER_DOC_FOLDER_DESTINATION = `${process.cwd()}/docs`;
const SWAGGER_DOC_PATHS_DESTINATION = `${process.cwd()}/docs/paths`;
const SWAGGER_DOC_SCHEMAS_DESTINATION = `${process.cwd()}/docs/schemas`;

// template
const MIGRATION_TEMPLATE = `${__dirname}/core/sequelize/template/migration.stub`;
const MODEL_TEMPLATE = `${__dirname}/core/sequelize/template/model.stub`;
const CONTROLLER_TEMPLATE = `${__dirname}/core/sequelize/template/controller.stub`;
const ROUTE_TEMPLATE = `${__dirname}/core/sequelize/template/route.stub`;
const CONFIG_TEMPLATE = `${__dirname}/core/sequelize/template/config.stub`;
const MODEL_INDEX_TEMPLATE = `${__dirname}/core/sequelize/template/model_index.stub`;

const _APP_TEMPLATE = `${__dirname}/core/_app.stub`;
const _ROUTE_TEMPLATE = `${__dirname}/core/_route.stub`;
const _SWAGGER_TEMPLATE = `${__dirname}/core/_swagger.stub`;
const APP_USE_API_ROUTE_TEMPLATE = `${__dirname}/core/api/template/app_use.stub`;
const APP_USE_SWAGGER_TEMPLATE = `${__dirname}/core/swagger/template/app_use.stub`;
const SWAGGER_INDEX_TEMPLATE = `${__dirname}/core/swagger/template/doc_index.stub`;
const SWAGGER_DOC_PATHS_TEMPLATE = `${__dirname}/core/swagger/template/doc_paths.stub`;
const SWAGGER_DOC_SCHEMAS_TEMPLATE = `${__dirname}/core/swagger/template/doc_schemas.stub`;

// manual
const MANUAL_HELP = `${__dirname}/core/manual/help.stub`;
const INIT_HELP = `${__dirname}/core/manual/help.stub`;
const GENERATE_HELP = `${__dirname}/core/manual/generate/help.stub`;
const GENERATE_SWAGGER_HELP = `${__dirname}/core/manual/generate/swagger/help.stub`;

// console.log(params);

const DATA_TYPES = {
  INTEGER: "integer",
  STRING: "string",
  TEXT: "text",
  BOOLEAN: "boolean",
  FLOAT: "float",
  REAL: "real",
  DECIMAL: "decimal",
  JSON: "json",
  UUID: "uuid",
  DATE: "date",
  ARRAY: "array",
  OBJECT: "object",
  NUMBER: "number",
};

const COMMAND = {
  LIST: [
    "--help",
    "init",
    "generate",
    "generate:model",
    "generate:controller",
    "generate:route",
    "generate:swagger",
  ],
  HELP: "--help",
  INIT: "init",
  GENERATE: "generate",
  GENERATE_MODEL: "generate:model",
  GENERATE_CONTROLLER: "generate:controller",
  GENERATE_ROUTE: "generate:route",
  GENERATE_SWAGGER: "generate:swagger",
};

function main(c) {
  const command = COMMAND.LIST.includes(c) ? c : "";

  switch (command) {
    case COMMAND.HELP:
      showHelp(MANUAL_HELP);
      break;

    case COMMAND.INIT:
      initializeProject();
      break;

    case COMMAND.GENERATE:
      checkConfig();
      console.log(`Generating Model/Migration/Controller/Route: ${PARAMS_2}`);
      createSequelizeModel(PARAMS_2);
      createSequelizMigration(PARAMS_2);
      createSequelizeController(PARAMS_2);
      createSequelizeRoute(PARAMS_2);
      break;

    case COMMAND.GENERATE_MODEL:
      console.log(`Generating Model: ${PARAMS_2}`);
      createSequelizeModel(PARAMS_2);
      break;

    case COMMAND.GENERATE_CONTROLLER:
      console.log(`Generating Controller: ${PARAMS_2}`);
      createSequelizeController(PARAMS_2);
      break;

    case COMMAND.GENERATE_ROUTE:
      console.log(`Generating Route: ${PARAMS_2}`);
      createSequelizeRoute(PARAMS_2);
      break;

    case COMMAND.GENERATE_SWAGGER:
      console.log(`Generating Swagger Docs:`);
      getSwaggerOptions();
      break;

    default:
      console.log("ERROR: Unkown Command pls refer to --help");
      showHelp(MANUAL_HELP);
      exit();
  }
}

/**
 * Init commands
 */

const INIT_OPTIONS = {
  LIST: ["--help", "--no-swagger", "--no-route"],
  HELP: "--help",
  NO_SWAGGER: "--no-swagger",
  NO_ROUTE: "--no-route",
};

let _NO_SWAGGER = false;
let _NO_ROUTE = false;

function getInitOptions() {
  // show help
  params.forEach((o) => {
    const option = INIT_OPTIONS.LIST.includes(o) ? o : "";
    switch (option) {
      case INIT_OPTIONS.HELP:
        showHelp(INIT_HELP);
        break;
      default:
        break;
    }
  });

  params.forEach((o, index) => {
    const option = INIT_OPTIONS.LIST.includes(o) ? o : "";

    switch (option) {
      case INIT_OPTIONS.NO_SWAGGER:
        _NO_SWAGGER = true;
        break;

      case INIT_OPTIONS.NO_ROUTE:
        _NO_ROUTE = true;
        break;

      default:
        // console.log("no options");
        break;
    }
  });
}

function initializeProject() {
  getInitOptions();
  console.log("Initializing project in current directory ... ");

  // create app.js at directory
  const appTarget = `${process.cwd()}/app.js`;
  let appData = fs.readFileSync(_APP_TEMPLATE, "utf8");

  _NO_ROUTE == true
    ? (appData = appData.replace("$$API_ROUTE_APP_USE$$", ""))
    : (appData = appData.replace(
        "$$API_ROUTE_APP_USE$$",
        fs.readFileSync(APP_USE_API_ROUTE_TEMPLATE, "utf8") + "\n"
      ));

  if (_NO_SWAGGER == true) {
    appData = appData.replace("$$SWAGGER_APP_USE$$", "");
  } else {
    appData = appData.replace(
      "$$SWAGGER_APP_USE$$",
      fs.readFileSync(APP_USE_SWAGGER_TEMPLATE, "utf8") + "\n"
    );
    initializeSwagger();
  }

  if (!fs.existsSync(appTarget)) {
    fs.writeFile(appTarget, appData, function (err) {
      if (err) return console.log(err);
      console.log('Express: Created app.js in "./"');
    });
  }

  // create folders: models, controllers, routes, config, migrations
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
      console.log("Initialize project Config: config > config.json");
    });
  }

  // create models/index.js
  const targetIndex = `${MODEL_FOLDER_DESTINATION}/index.js`;
  const dataIndex = fs.readFileSync(MODEL_INDEX_TEMPLATE, "utf8");
  if (!fs.existsSync(targetIndex)) {
    fs.writeFile(targetIndex, dataIndex, function (err) {
      if (err) return console.log(err);
      console.log("Initialize Models: models > index.js");
    });
  }

  // create route/index.js
  const routeIndex = `${ROUTE_FOLDER_DESTINATION}/index.js`;
  const routeData = fs.readFileSync(_ROUTE_TEMPLATE, "utf8");
  if (!fs.existsSync(routeIndex)) {
    fs.writeFile(routeIndex, routeData, function (err) {
      if (err) return console.log(err);
      console.log("Initialize Route: routes > index.js");
    });
  }
}

function checkConfig() {
  // check config/config.json
  const target = `${CONFIG_FOLDER_DESTINATION}/config.json`;

  if (!fs.existsSync(target)) {
    throw Error(
      "config.json not found. Please initialize project first by with command 'vynl init'"
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
 * Generator Swagger
 */
const SWAGGER_OPTIONS = {
  LIST: ["--help", "-n", "-m", "-t", "-f", "-r"],
  HELP: "--help",
  NAME: "-n",
  MODEL: "-m",
  FIELDS: "-f",
  TABLE: "-t",
  ROUTE: "-r",
};

let _SWAGGER_FILE_NAME;
let _SWAGGER_MODEL_NAME;
let _SWAGGER_TABLE_NAME;
let _SWAGGER_ROUTE_NAME;
let _SWAGGER_FIELDS;

function getSwaggerOptions() {
  // show help
  params.forEach((o) => {
    const option = SWAGGER_OPTIONS.LIST.includes(o) ? o : "";
    switch (option) {
      case SWAGGER_OPTIONS.HELP:
        showHelp(GENERATE_SWAGGER_HELP);
        break;
      default:
        break;
    }
  });

  params.forEach((o, index) => {
    const option = SWAGGER_OPTIONS.LIST.includes(o) ? o : "";

    switch (option) {
      case SWAGGER_OPTIONS.NAME:
        _SWAGGER_FILE_NAME = params[index + 1];
        break;

      case SWAGGER_OPTIONS.MODEL:
        _SWAGGER_MODEL_NAME = params[index + 1];
        break;

      case SWAGGER_OPTIONS.FIELDS:
        _SWAGGER_FIELDS = params[index + 1];
        break;

      case SWAGGER_OPTIONS.TABLE:
        _SWAGGER_TABLE_NAME = params[index + 1];
        break;

      case SWAGGER_OPTIONS.ROUTE:
        _SWAGGER_ROUTE_NAME = params[index + 1];
        break;

      default:
        break;
    }
  });

  if (_SWAGGER_MODEL_NAME === undefined) throw Error("model name is a must");
  if (_SWAGGER_FIELDS === undefined) throw Error("fields is a must");

  const route = _SWAGGER_ROUTE_NAME != undefined ? _SWAGGER_ROUTE_NAME : "";
  const table = _SWAGGER_TABLE_NAME != undefined ? _SWAGGER_TABLE_NAME : "";
  const file = _SWAGGER_FILE_NAME != undefined ? _SWAGGER_FILE_NAME : "";

  generateSwaggerPaths(_SWAGGER_MODEL_NAME, route, table, file);
  generateSwaggerSchemas(_SWAGGER_MODEL_NAME, _SWAGGER_FIELDS, file);
}

function initializeSwagger() {
  console.log("Initializing Swagger ...");
  // create swagger.js in project dir
  const swaggerTarget = `${process.cwd()}/swagger.js`;
  const swaggerData = fs.readFileSync(_SWAGGER_TEMPLATE, "utf8");
  if (!fs.existsSync(swaggerTarget)) {
    fs.writeFile(swaggerTarget, swaggerData, function (err) {
      if (err) return console.log(err);
    });
  }

  // create docs docs/paths and docs/schemas
  // mkdirIfNotExist(SWAGGER_DOC_FOLDER_DESTINATION);
  mkdirIfNotExist(SWAGGER_DOC_PATHS_DESTINATION);
  mkdirIfNotExist(SWAGGER_DOC_SCHEMAS_DESTINATION);

  const data = fs.readFileSync(SWAGGER_INDEX_TEMPLATE, "utf8");

  // create docs/paths/index.js
  const pathsTarget = `${SWAGGER_DOC_PATHS_DESTINATION}/index.js`;
  if (!fs.existsSync(pathsTarget)) {
    fs.writeFile(pathsTarget, data, function (err) {
      if (err) return console.log(err);
    });
  }

  // create docs/schemas/index.js
  const schemasTarget = `${SWAGGER_DOC_SCHEMAS_DESTINATION}/index.js`;
  if (!fs.existsSync(schemasTarget)) {
    fs.writeFile(schemasTarget, data, function (err) {
      if (err) return console.log(err);
    });
  }
}

function generateSwaggerPaths(model, route = "", table = "", file = "") {
  if (model === undefined) return console.log("error");

  try {
    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
    const tableName = table != "" ? table : model.toLowerCase();
    const routeName = route != "" ? route : tableName;
    const filename = file != "" ? file : tableName;
    const destination = `${SWAGGER_DOC_PATHS_DESTINATION}/${filename}.js`;

    let data = fs.readFileSync(SWAGGER_DOC_PATHS_TEMPLATE, "utf8");

    for (let i = 0; i < 2; i++) {
      data = data.replace("$$ROUTE_NAME$$", routeName);
    }

    for (let i = 0; i < 18; i++) {
      data = data.replace("$$MODEL_NAME$$", modelName);
    }

    for (let i = 0; i < 5; i++) {
      data = data.replace("$$TABLE_NAME$$", tableName);
    }

    // write model file
    mkdirIfNotExist(SWAGGER_DOC_PATHS_DESTINATION);
    fs.writeFile(destination, data, function (err) {
      if (err) return console.log(err);
      console.log(`Created: docs > paths > ${filename}.js`);
    });
  } catch (error) {
    console.log(error);
  }
}

function generateSwaggerSchemas(model, fields, file = "") {
  if (model === undefined) return console.log("error");

  try {
    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
    const filename = file != "" ? file : modelName.toLowerCase();
    const destination = `${SWAGGER_DOC_SCHEMAS_DESTINATION}/${filename}.js`;

    let data = fs.readFileSync(SWAGGER_DOC_SCHEMAS_TEMPLATE, "utf8");

    data = data.replace("$$MODEL_NAME$$", modelName);

    let schemaFieldsStr = "";
    let schemaFields = fields.split(",");

    schemaFields.forEach((item, index) => {
      let field = item.split(":");
      let name = field[0];
      let type = field[1];
      let dataTypes;

      switch (type) {
        case DATA_TYPES.INTEGER:
          dataTypes = DATA_TYPES.INTEGER;
          break;

        case DATA_TYPES.STRING:
          dataTypes = DATA_TYPES.STRING;
          break;

        case DATA_TYPES.DATE:
          dataTypes = DATA_TYPES.DATE;
          break;

        case DATA_TYPES.BOOLEAN:
          dataTypes = DATA_TYPES.BOOLEAN;
          break;

        default:
          throw Error("Invalid data types");
      }

      schemaFieldsStr == ""
        ? (schemaFields = "{ " + name + ": '" + dataTypes + "' }, \n")
        : (schemaFields =
            schemaFields + "\t\t\t{ " + name + ": '" + dataTypes + "' }, \n");
    });

    data = data.replace("$$SCHEMA_FIELDS$$", schemaFieldsStr);

    // write model file
    mkdirIfNotExist(SWAGGER_DOC_SCHEMAS_DESTINATION);
    fs.writeFile(destination, data, function (err) {
      if (err) return console.log(err);
      console.log(`Created: docs > schemas > ${filename}.js`);
    });
  } catch (error) {
    console.log(error);
  }
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
        const fields = params[index + 1].toString().split(",");
        // ["name:string", "number:integer", "date:date", "uuid:uuid", "boolean:boolean"]

        fields.forEach((field) => {
          let item = field.split(":");
          let name = item[0];
          let type = item[1];
          let dataType;
          let seqType;

          switch (type) {
            case DATA_TYPES.STRING:
              dataType = "DataTypes.STRING";
              seqType = "Sequelize.STRING";
              break;

            case DATA_TYPES.INTEGER:
              dataType = "DataTypes.INTEGER";
              seqType = "Sequelize.INTEGER";
              break;

            case DATA_TYPES.DATE:
              dataType = "DataTypes.DATE";
              seqType = "Sequelize.DATE";
              break;

            case DATA_TYPES.UUID:
              dataType = "DataTypes.UUID";
              seqType = "Sequelize.UUID";
              break;

            case DATA_TYPES.BOOLEAN:
              dataType = "DataTypes.BOOLEAN";
              seqType = "Sequelize.BOOLEAN";
              break;

            default:
              throw Error("Missing datatype");
          }

          // concat
          modelField == ""
            ? (modelField = name + ": " + dataType + ", \n")
            : (modelField =
                modelField + "\t\t\t" + name + ": " + dataType + ", \n");

          migrationField == ""
            ? (migrationField = name + ": { type: " + seqType + " }, \n")
            : (migrationField =
                migrationField +
                "\t\t\t" +
                name +
                ": { type: " +
                seqType +
                " }, \n");
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
 *
 */
main(PARAMS_1);
