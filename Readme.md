# Vynl an MVC Generator for Express JS

## What's Inside

A boilerplate generator for Express.js. It uses MVC architecture, and will generate Sequelize Models, its respectives Controllers and Routes, while also generating Swagger documentations for you. All under a single command line :)

## Initialize Project

Start by creating our project with VYNL init. The following command will create our project structure, generating folders in our project where our Models, Controllers, Routes, and Documentations will reside in.

```
$ vynl init
```

Our project directory after

```
.
|--auth
|    └──auth.js
|--config
|    └──config.json
|--docs
|    |--paths
|    |    |--index.js
|    |    └──users.js
|    └──schemas
|         |--index.js
|         └──users.js
|--migrations
|--models
|--routes
|--app.js
└──swagger.js
```

- /auth: Contains our login and verifyToken logic to secure routes using [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken/ "jsonwebtoken")
- /config: Database config. Following sequelize-cli format
- /migrations: Our Migrations files. Following sequelize-cli format
- /models: Our Models files. Following sequelize-cli format
- /controllers: Our Controllers files. Following sequelize-cli format
- /docs/paths: Where we define our [Swagger Paths](https://swagger.io/docs/specification/paths-and-operations/ "Swagger Paths")
- /docs/schemas: Where we define our [Swagger Schemas Components](https://swagger.io/docs/specification/components/ "Swagger Schemas Components")

## Generating Commands

### generate:api

Generate Model, Controller, Route, Swagger Doc for the model specified.

required: _model_name_ and _fields_

```
$ vynl generate:api -m <model_name> -f <fields>
```

### generate:model

Generate Model only.

required: model_name, fields

```
$ vynl generate:model -m <model_name> -f <fields>
```

### generate:controller

Generate Controller only.

required: model_name

```
$ vynl generate:controller -m <model_name>
```

### generate:route

Generate Route only.

required: route_name

```
$ vynl generate:route -r <route_name>
```

### generate:swagger

Generate Swagger only.

required: model_name, fields

```
$ vynl generate:swagger -m <model_name> -f <fields>
```

## Manual

```
VYNL CLI

vynl [command]

Commands:
  vynl init                             Initializes project
  vynl generate:api                     Generates Model/Migration/Controller/Route/SwaggerDoc
  vynl generate:model                   Generates Model/Migration
  vynl generate:controller              Generates Controllers
  vynl generate:route                   Generates Routes
  vynl generate:swagger                 Generates Swagger Documentation

Options:
  --help      Show help
```
