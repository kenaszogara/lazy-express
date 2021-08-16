const fs = require("fs");
const replace = require("buffer-replace");

const params = process.argv;
const BASE_PATH = params[1];
const PARAMS_1 = params[2];
const PARAMS_2 = params[3];

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
    output = data.replace(
      "$$MODEL_SELECTION$$",
      "./../lib/mysql_db_connection"
    );

    // model_name
    output = output.replace("$$MODEL_NAME$$", modelName);
    output = output.replace("$$MODEL_NAME$$", modelName);

    // table_name
    output = output.replace("$$TABLE_NAME$$", tableName);

    // output to src file
    fs.writeFile(destination, output, function (err) {
      if (err) return console.log(err);
      console.log(`src > models > ${filename}`);
    });

    console.log(output);
  } catch (err) {
    console.error(err);
  }
}

createModel(PARAMS_1);
