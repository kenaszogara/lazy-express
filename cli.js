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

const SWAGGER_DOC_PATHS_DESTINATION = `${process.cwd()}/docs/paths`;
const SWAGGER_DOC_SCHEMAS_DESTINATION = `${process.cwd()}/docs/schemas`;

const AUTH_FOLDER_DESTINATION = `${process.cwd()}/auth`;

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

const AUTH_TEMPLATE = `${__dirname}/core/auth/auth.stub`;

// manual
const INIT_HELP = `${__dirname}/core/manual/help.stub`;
const MANUAL_HELP = `${__dirname}/core/manual/help.stub`;
const GENERATE_HELP = `${__dirname}/core/manual/generate_api_help.stub`;
const GENERATE_MODEL_HELP = `${__dirname}/core/manual/generate_model_help.stub`;
const GENERATE_ROUTE_HELP = `${__dirname}/core/manual/generate_route_help.stub`;
const GENERATE_SWAGGER_HELP = `${__dirname}/core/manual/generate_swagger_help.stub`;
const GENERATE_CONTROLLER_HELP = `${__dirname}/core/manual/generate_controller_help.stub`;

// console.log(params);

/**
 * DATA TYPES
 */
const DATA_TYPES = {
  ARRAY: "array",
  BIGINT: "bigint",
  BLOB: "blob",
  BOOLEAN: "boolean",
  CHAR: "char",
  CIDR: "cidr",
  CITEXT: "citext",
  DATE: "date",
  DATEONLY: "dateonly",
  DECIMAL: "decimal",
  DOUBLE: "double",
  ENUM: "enum",
  FLOAT: "float",
  GEOGRAPHY: "geography",
  GEOMETRY: "geometry",
  HSTORE: "hstore",
  INET: "inet",
  INTEGER: "integer",
  JSON: "json",
  JSONB: "jsonb",
  JSONTYPE: "jsontype",
  MACADDR: "macaddr",
  MEDIUMINT: "mediumint",
  NOW: "now",
  NUMBER: "number",
  RANGE: "range",
  REAL: "real",
  SMALLINT: "smallint",
  STRING: "string",
  TEXT: "text",
  TIME: "time",
  TINYINT: "tinyint",
  UUID: "uuid",
  VIRTUAL: "virtual",
  // below is swagger setup
  EMAIL: "email",
  PASSWORD: "password",
  FILE: "file",
};

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
 * Generator Auth
 */

function initializeAuth() {
  mkdirIfNotExist(AUTH_FOLDER_DESTINATION);
  const authTarget = `${AUTH_FOLDER_DESTINATION}/auth.js`;
  const authData = fs.readFileSync(AUTH_TEMPLATE, "utf8");
  if (!fs.existsSync(authTarget)) {
    fs.writeFile(authTarget, authData, function (err) {
      if (err) return console.log(err);
      console.log("Initialize Auth: auth > auth.js");
    });
  }

  const model = "users";
  const fields = ["username:string", "email:string", "password:string"];
  parseModelMigrationFields(fields);
  createSequelizeModel(model);
  createSequelizMigration(model);
  createSequelizeController(model);
  createSequelizeRoute(model);
  generateSwaggerPaths(model, fields);
  generateSwaggerSchemas(model, fields);
}

/**
 * Generator Swagger
 */
const SWAGGER_OPTIONS = {
  LIST: ["--help", "-n", "-m", "-t", "-f", "-r", "--force"],
  HELP: "--help",
  NAME: "-n",
  MODEL: "-m",
  FIELDS: "-f",
  TABLE: "-t",
  ROUTE: "-r",
  FORCE: "--force",
};

let _SWAGGER_FILE_NAME;
let _SWAGGER_MODEL_NAME;
let _SWAGGER_TABLE_NAME;
let _SWAGGER_ROUTE_NAME;
let _SWAGGER_FIELDS;
let _SWAGGER_FORCE = false;

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
        _SWAGGER_FIELDS = params[index + 1].toString().split(",");
        break;

      case SWAGGER_OPTIONS.TABLE:
        _SWAGGER_TABLE_NAME = params[index + 1];
        break;

      case SWAGGER_OPTIONS.ROUTE:
        _SWAGGER_ROUTE_NAME = params[index + 1];
        break;

      case SWAGGER_OPTIONS.FORCE:
        _SWAGGER_FORCE = true;
        break;

      default:
        break;
    }
  });

  if (_SWAGGER_MODEL_NAME === undefined) throw Error("model name is a must");
  if (_SWAGGER_FIELDS === undefined) throw Error("fields is a must");

  console.log(`Generating Swagger Docs:`);

  generateSwaggerPaths(_SWAGGER_MODEL_NAME, _SWAGGER_FIELDS);
  generateSwaggerSchemas(_SWAGGER_MODEL_NAME, _SWAGGER_FIELDS);
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

function parseSwaggerFields(fields) {
  let schemaFields = "";

  fields.forEach((item, index) => {
    let field = item.split(":");
    let name = field[0];
    let type = field[1];
    let dataTypes;
    let format = "";

    switch (type) {
      case DATA_TYPES.INTEGER:
        dataTypes = `type: "${DATA_TYPES.INTEGER}",`;
        format = 'format: "int64",';
        break;

      case DATA_TYPES.STRING:
        dataTypes = `type: "${DATA_TYPES.STRING}",`;
        break;

      case DATA_TYPES.DATE:
        dataTypes = `type: "${DATA_TYPES.STRING}",`;
        format = `format: "${DATA_TYPES.DATE}",`;
        break;

      case DATA_TYPES.BOOLEAN:
        dataTypes = `type: "${DATA_TYPES.BOOLEAN}",`;
        break;

      case DATA_TYPES.EMAIL:
        dataTypes = `type: "${DATA_TYPES.STRING}",`;
        format = `format: "${DATA_TYPES.EMAIL}",`;
        break;

      case DATA_TYPES.PASSWORD:
        dataTypes = `type: "${DATA_TYPES.STRING}",`;
        format = `format: "${DATA_TYPES.PASSWORD}",`;
        break;

      case DATA_TYPES.FILE:
        dataTypes = `type: "${DATA_TYPES.STRING}",`;
        format = 'format: "byte",';
        break;

      case DATA_TYPES.FLOAT:
        dataTypes = `type: "${DATA_TYPES.NUMBER}",`;
        format = `format: "${DATA_TYPES.FLOAT}",`;
        break;

      case DATA_TYPES.DOUBLE:
        dataTypes = `type: "${DATA_TYPES.NUMBER}",`;
        format = `format: "${DATA_TYPES.DOUBLE}",`;
        break;

      case DATA_TYPES.DECIMAL:
        dataTypes = `type: "${DATA_TYPES.NUMBER}",`;
        format = `format: "${DATA_TYPES.DECIMAL}",`;
        break;

      default:
        dataTypes = `type: "string",`;
        break;
    }

    schemaFields == ""
      ? (schemaFields = name + ": { " + dataTypes + " " + format + " },")
      : (schemaFields =
          schemaFields +
          "\n\t\t\t" +
          name +
          ": { " +
          dataTypes +
          " " +
          format +
          " },");
  });

  return schemaFields;
}

function generateSwaggerPaths(model, fields) {
  if (model === undefined) return console.log("error");

  try {
    const modelName =
      _SWAGGER_MODEL_NAME !== undefined
        ? _SWAGGER_MODEL_NAME
        : model.charAt(0).toUpperCase() + model.slice(1);
    const tableName =
      _SWAGGER_TABLE_NAME != undefined
        ? _SWAGGER_TABLE_NAME
        : model.toLowerCase();
    const routeName =
      _SWAGGER_ROUTE_NAME != undefined
        ? _SWAGGER_ROUTE_NAME
        : model.toLowerCase();
    const filename =
      _SWAGGER_FILE_NAME != undefined
        ? `${_SWAGGER_FILE_NAME}.js`
        : `${modelName.toLowerCase()}.js`;
    const destination = `${SWAGGER_DOC_PATHS_DESTINATION}/${filename}`;

    let data = fs.readFileSync(SWAGGER_DOC_PATHS_TEMPLATE, "utf8");

    for (let i = 0; i < 2; i++) {
      data = data.replace("$$ROUTE_NAME$$", routeName);
    }

    for (let i = 0; i < 27; i++) {
      data = data.replace("$$MODEL_NAME$$", modelName);
    }

    for (let i = 0; i < 5; i++) {
      data = data.replace("$$TABLE_NAME$$", tableName);
    }

    let schemaFields = parseSwaggerFields(fields);

    for (let i = 0; i < 2; i++) {
      data = data.replace("$$SCHEMA_FIELDS$$", schemaFields);
    }

    // write model file
    mkdirIfNotExist(SWAGGER_DOC_PATHS_DESTINATION);

    if (fs.existsSync(destination) && !_SWAGGER_FORCE)
      throw Error(
        `Docs file in ${destination} already exists. To overwrite use --force`
      );

    fs.writeFile(destination, data, function (err) {
      if (err) return console.log(err);
      console.log(`Created: docs > paths > ${filename}`);
    });
  } catch (error) {
    console.log(error);
  }
}

function generateSwaggerSchemas(model, fields) {
  if (model === undefined) return console.log("error");

  try {
    const modelName =
      _SWAGGER_MODEL_NAME != undefined
        ? _SWAGGER_MODEL_NAME
        : model.charAt(0).toUpperCase() + model.slice(1);
    const filename =
      _SWAGGER_FILE_NAME != undefined
        ? `${_SWAGGER_FILE_NAME}.js`
        : `${modelName.toLowerCase()}.js`;
    const destination = `${SWAGGER_DOC_SCHEMAS_DESTINATION}/${filename}`;

    let data = fs.readFileSync(SWAGGER_DOC_SCHEMAS_TEMPLATE, "utf8");

    data = data.replace("$$MODEL_NAME$$", modelName);

    let schemaFields = parseSwaggerFields(fields);

    data = data.replace("$$SCHEMA_FIELDS$$", schemaFields);

    // write model file
    mkdirIfNotExist(SWAGGER_DOC_SCHEMAS_DESTINATION);
    if (fs.existsSync(destination) && !_SWAGGER_FORCE)
      throw Error(
        `Doc file in ${destination} already exists. To overwrite use --force`
      );

    fs.writeFile(destination, data, function (err) {
      if (err) return console.log(err);
      console.log(`Created: docs > schemas > ${filename}`);
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
  LIST: ["--help", "-m", "-f", "-t", "-n", "--force"],
  HELP: "--help",
  MODEL: "-m",
  FIELD: "-f",
  TABLE: "-t",
  FILE_NAME: "-n",
  FORCE: "--force",
};

let MODEL_NAME;
let MODEL_FIELD;
let MIGRATION_FIELD;
let MODEL_TABLE_NAME;
let MODEL_FILE_NAME;
let MODEL_FORCE = false;

function getModelOptions() {
  // show help
  params.forEach((o) => {
    const option = MODEL_OPTIONS.LIST.includes(o) ? o : "";
    switch (option) {
      case MODEL_OPTIONS.HELP:
        showHelp(GENERATE_MODEL_HELP);
        break;
      default:
        break;
    }
  });

  params.forEach((o, index) => {
    const option = MODEL_OPTIONS.LIST.includes(o) ? o : "";

    switch (option) {
      case MODEL_OPTIONS.MODEL:
        MODEL_NAME = params[index + 1].toString();
        break;

      case MODEL_OPTIONS.FIELD:
        const fields = params[index + 1].toString().split(",");
        // ["name:string", "number:integer", "date:date", "uuid:uuid", "boolean:boolean"]

        parseModelMigrationFields(fields);
        break;

      case MODEL_OPTIONS.TABLE:
        MODEL_TABLE_NAME = params[index + 1].toString();
        break;

      case MODEL_OPTIONS.FILE_NAME:
        MODEL_FILE_NAME = params[index + 1].toString();
        break;

      case MODEL_OPTIONS.FORCE:
        MODEL_FORCE = true;
        break;

      default:
        // console.log("no options");
        break;
    }
  });

  console.log(`Generating Model:`);

  createSequelizeModel(MODEL_NAME);
  createSequelizMigration(MODEL_NAME);
}

function parseModelMigrationFields(fields) {
  let modelField = "";
  let migrationField = "";

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
      ? (modelField = name + ": " + dataType + ",")
      : (modelField = modelField + "\n\t\t\t" + name + ": " + dataType + ",");

    migrationField == ""
      ? (migrationField = name + ": { type: " + seqType + " },")
      : (migrationField =
          migrationField + "\n\t\t\t" + name + ": { type: " + seqType + " },");
  });

  MODEL_FIELD = modelField;
  MIGRATION_FIELD = migrationField;
}

const CONTROLLER_OPTIONS = {
  LIST: ["--help", "-m", "-n", "-t", "--force"],
  HELP: "--help",
  MODEL: "-m",
  FILE_NAME: "-n",
  TABLE_NAME: "-t",
  FORCE: "--force",
};

let CONTROLLER_MODEL_NAME;
let CONTROLLER_FILE_NAME;
let CONTROLLER_TABLE_NAME;
let CONTROLLER_FORCE = false;

function getControllerOptions() {
  // show help
  params.forEach((o) => {
    const option = CONTROLLER_OPTIONS.LIST.includes(o) ? o : "";
    switch (option) {
      case CONTROLLER_OPTIONS.HELP:
        showHelp(GENERATE_CONTROLLER_HELP);
        break;
      default:
        break;
    }
  });

  params.forEach((o, index) => {
    const option = CONTROLLER_OPTIONS.LIST.includes(o) ? o : "";

    switch (option) {
      case CONTROLLER_OPTIONS.MODEL:
        CONTROLLER_MODEL_NAME = params[index + 1].toString();
        break;

      case CONTROLLER_OPTIONS.FILE_NAME:
        CONTROLLER_FILE_NAME = params[index + 1].toString();
        break;

      case CONTROLLER_OPTIONS.TABLE_NAME:
        CONTROLLER_TABLE_NAME = params[index + 1].toString();
        break;

      case CONTROLLER_OPTIONS.FORCE:
        CONTROLLER_FORCE = true;
        break;

      default:
        // console.log("no options");
        break;
    }
  });

  console.log(`Generating Controller:`);

  createSequelizeController(CONTROLLER_MODEL_NAME);
}

const ROUTE_OPTIONS = {
  LIST: ["--help", "-r", "-c", "--force"],
  HELP: "--help",
  FILE_NAME: "-r",
  CONTROLLER_NAME: "-c",
  FORCE: "--force",
};

let ROUTE_FILE_NAME;
let ROUTE_CONTROLLER_NAME;
let ROUTE_FORCE = false;

function getRouteOptions() {
  // show help
  params.forEach((o) => {
    const option = ROUTE_OPTIONS.LIST.includes(o) ? o : "";
    switch (option) {
      case ROUTE_OPTIONS.HELP:
        showHelp(GENERATE_ROUTE_HELP);
        break;
      default:
        break;
    }
  });

  params.forEach((o, index) => {
    const option = ROUTE_OPTIONS.LIST.includes(o) ? o : "";

    switch (option) {
      case ROUTE_OPTIONS.FILE_NAME:
        ROUTE_FILE_NAME = params[index + 1].toString();
        break;

      case ROUTE_OPTIONS.CONTROLLER_NAME:
        ROUTE_CONTROLLER_NAME = params[index + 1].toString();
        break;

      case ROUTE_OPTIONS.FORCE:
        ROUTE_FORCE = true;
        break;

      default:
        // console.log("no options");
        break;
    }
  });

  console.log(`Generating Route:`);

  createSequelizeRoute(ROUTE_FILE_NAME);
}

function createSequelizeModel(name) {
  if (name == undefined) throw Error("required Model name");

  try {
    let output = "";
    const modelName =
      MODEL_NAME != undefined
        ? MODEL_NAME
        : name.charAt(0).toUpperCase() + name.slice(1);
    const tableName =
      MODEL_TABLE_NAME != undefined ? MODEL_TABLE_NAME : name.toLowerCase();
    const filename =
      MODEL_FILE_NAME != undefined
        ? `${MODEL_FILE_NAME}.js`
        : `${name.toLowerCase()}.js`;
    const destination = `${MODEL_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync(MODEL_TEMPLATE, "utf8");

    output = data;

    // model_name
    for (let i = 0; i < 4; i++) {
      output = output.replace("$$MODEL_NAME$$", modelName);
    }

    // table_name
    output = output.replace("$$TABLE_NAME$$", tableName);

    // -f option (required)
    if (MODEL_FIELD == undefined) {
      throw Error(
        'Field value is required. Define field value with "-f" options'
      );
    }

    output = output.replace("$$MODEL_FIELDS$$", MODEL_FIELD);

    // -a option
    // output = output.replace("$$MODEL_ASSOCIATION$$", ASSOCITION_OPTION);

    // write model file
    mkdirIfNotExist(MODEL_FOLDER_DESTINATION);

    if (fs.existsSync(destination) && !MODEL_FORCE)
      throw Error(
        `Model File at ${destination} already exists. To overwrite use --force`
      );

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

function createSequelizMigration(name) {
  if (name == undefined) throw Error("required Migration name");

  try {
    let output = "";
    const date = new Date()
      .toISOString()
      .split(".")[0]
      .replace(/[^\d]/gi, "")
      .toString();
    const tableName =
      MODEL_TABLE_NAME != undefined ? MODEL_TABLE_NAME : name.toLowerCase();
    const filename =
      MODEL_FILE_NAME != undefined
        ? `${MODEL_FILE_NAME}.js`
        : `${date}-create-${name.toLowerCase()}.js`;
    const destination = `${MIGRATION_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync(MIGRATION_TEMPLATE, "utf8");

    output = data;

    // table name
    for (let i = 0; i < 2; i++) {
      output = output.replace("$$TABLE_NAME$$", tableName);
    }

    // -f option (required)
    if (MIGRATION_FIELD == undefined) {
      throw Error("field flag is required");
    }

    output = output.replace("$$MIGRATION_FIELD$$", MIGRATION_FIELD);

    // write model file
    mkdirIfNotExist(MIGRATION_FOLDER_DESTINATION);

    if (fs.existsSync(destination) && !MODEL_FORCE)
      throw Error(
        `Migration File at ${destination} already exists. To overwrite use --force`
      );

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

function createSequelizeController(name) {
  if (name == undefined) throw Error("required Controller name");

  try {
    let output = "";
    const modelName =
      CONTROLLER_MODEL_NAME != undefined
        ? CONTROLLER_MODEL_NAME
        : name.charAt(0).toUpperCase() + name.slice(1);
    const tableName =
      CONTROLLER_TABLE_NAME != undefined
        ? CONTROLLER_TABLE_NAME
        : name.toLowerCase();
    const filename =
      CONTROLLER_FILE_NAME != undefined
        ? `${CONTROLLER_FILE_NAME}.js`
        : `${name.toLowerCase()}.js`;
    const destination = `${CONTROLLER_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync(CONTROLLER_TEMPLATE, "utf8");
    output = data;

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

    if (fs.existsSync(destination) && !CONTROLLER_FORCE)
      throw Error(
        `Controller File at ${destination} already exists. To overwrite use --force`
      );

    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`Created: src > controllers > ${filename}`);
    });

    // console.log(output);
  } catch (err) {
    console.error(err);
  }
}

function createSequelizeRoute(name) {
  if (name == undefined) throw Error("required Route name");

  try {
    let output = "";
    const controllerName =
      ROUTE_CONTROLLER_NAME != undefined
        ? ROUTE_CONTROLLER_NAME
        : name.toLowerCase();
    const filename =
      ROUTE_FILE_NAME != undefined
        ? `${ROUTE_FILE_NAME}.js`
        : `${name.toLowerCase()}.js`;
    const destination = `${ROUTE_FOLDER_DESTINATION}/${filename}`;

    const data = fs.readFileSync(ROUTE_TEMPLATE, "utf8");
    output = data;

    // controller_name
    output = output.replace("$$CONTROLLER_NAME$$", controllerName);

    // write model file
    mkdirIfNotExist(ROUTE_FOLDER_DESTINATION);

    if (fs.existsSync(destination) && !ROUTE_FORCE)
      throw Error(
        `Route File at ${destination} already exists. To overwrite use --force`
      );

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
 * GENERATE API COMMANDS
 */
const API_OPTIONS = {
  LIST: ["--help", "-m", "-f", "-t", "-n", "-r", "--force"],
  HELP: "--help",
  MODEL: "-m", //required
  FIELD: "-f", //required
  TABLE_NAME: "-t",
  FILE_NAME: "-n",
  ROUTE_NAME: "-r",
  FORCE: "--force",
};

let API_NAME;
let API_FIELDS;

function getAPIOptions() {
  // show help
  params.forEach((o) => {
    const option = API_OPTIONS.LIST.includes(o) ? o : "";
    switch (option) {
      case API_OPTIONS.HELP:
        showHelp(GENERATE_HELP);
        break;
      default:
        break;
    }
  });

  params.forEach((o, index) => {
    const option = API_OPTIONS.LIST.includes(o) ? o : "";

    switch (option) {
      case API_OPTIONS.MODEL:
        API_NAME = params[index + 1].toString();
        break;

      case API_OPTIONS.FIELD:
        API_FIELDS = params[index + 1].toString().split(",");
        parseModelMigrationFields(API_FIELDS);
        break;

      case API_OPTIONS.TABLE_NAME:
        const tableName = params[index + 1].toString();
        MODEL_TABLE_NAME = tableName;
        _SWAGGER_TABLE_NAME = tableName;
        CONTROLLER_TABLE_NAME = tableName;
        break;

      case API_OPTIONS.ROUTE_NAME:
        const routeName = params[index + 1].toString();
        _SWAGGER_ROUTE_NAME = routeName;
        ROUTE_FILE_NAME = routeName;
        console.log(routeName);
        break;

      case API_OPTIONS.FORCE:
        MODEL_FORCE = true;
        CONTROLLER_FORCE = true;
        ROUTE_FORCE = true;
        _SWAGGER_FORCE = true;
        break;

      default:
        // console.log("no options");
        break;
    }
  });

  console.log(`Generating Model/Migration/Controller/Route/SwaggerAPI:`);

  createSequelizeModel(API_NAME);
  createSequelizMigration(API_NAME);
  createSequelizeController(API_NAME);
  createSequelizeRoute(API_NAME);
  generateSwaggerPaths(API_NAME, API_FIELDS);
  generateSwaggerSchemas(API_NAME, API_FIELDS);
}

/**
 * MAIN COMMAND
 */
const COMMAND = {
  LIST: [
    "--help",
    "init",
    "generate:api",
    "generate:model",
    "generate:controller",
    "generate:route",
    "generate:swagger",
  ],
  HELP: "--help",
  INIT: "init",
  GENERATE_API: "generate:api",
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
      initializeAuth();
      break;

    case COMMAND.GENERATE_API:
      checkConfig();
      getAPIOptions();
      break;

    case COMMAND.GENERATE_MODEL:
      getModelOptions();
      break;

    case COMMAND.GENERATE_CONTROLLER:
      getControllerOptions();
      break;

    case COMMAND.GENERATE_ROUTE:
      getRouteOptions();
      break;

    case COMMAND.GENERATE_SWAGGER:
      getSwaggerOptions();
      break;

    default:
      console.log("ERROR: Unkown Command pls refer to --help");
      showHelp(MANUAL_HELP);
      exit();
  }
}

/**
 *  Start of main
 *
 */
main(PARAMS_1);
