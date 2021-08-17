const fs = require("fs");

const params = process.argv;
const BASE_PATH = params[1];
const PARAMS_1 = params[2];
console.log(params);

function createModel(a) {
  if (a == undefined) return console.log("error");

  try {
    let output = "";
    const modelName = a.charAt(0).toUpperCase() + a.slice(1);
    const tableName = a.toLowerCase();
    const filename = `${tableName}_model.js`;
    const destination = `${__dirname}/src/models/${filename}`;

    const data = fs.readFileSync("./lib/template/model", "utf8");

    // mysql_db_connection
    output = data.replace("$$MODEL_SELECTION$$", "./../../lib/mysql_model");

    // model_name
    output = output.replace("$$MODEL_NAME$$", modelName);
    output = output.replace("$$MODEL_NAME$$", modelName);

    // table_name
    output = output.replace("$$TABLE_NAME$$", tableName);

    // write model file
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`src > models > ${filename}`);
    });

    console.log(output);
  } catch (err) {
    console.error(err);
  }
}

function createController(a) {
  if (a == undefined) return console.log("error");

  try {
    let output = "";
    const modelName = a.charAt(0).toUpperCase() + a.slice(1);
    const tableName = a.toLowerCase();
    const filename = `${tableName}_controller.js`;
    const destination = `${__dirname}/src/controllers/${filename}`;

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
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`src > controllers > ${filename}`);
    });

    console.log(output);
  } catch (err) {
    console.error(err);
  }
}

function createRoute(a) {
  if (a == undefined) return console.log("error");

  try {
    let output = "";
    const modelName = a.charAt(0).toUpperCase() + a.slice(1);
    const tableName = a.toLowerCase();
    const filename = `${tableName}_route.js`;
    const destination = `${__dirname}/src/routes/${filename}`;

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
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`src > routes > ${filename}`);
    });

    console.log(output);
  } catch (err) {
    console.error(err);
  }
}

createModel(PARAMS_1);
createController(PARAMS_1);
createRoute(PARAMS_1);
