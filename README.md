# Core UI

Core UI is a loosely coupled "quick-start" project for NodeJS Web Applications that require:

- Logging
- CORS
- Policies for Route Access
- Views
- Public Assets
	- Asset Concatenation
- Session Management
- Database Access
- Modular Deploy Capability
- Cluster Capability
- AWS Credential Usage

There is no ORM.  We use the [Knex](http://knexjs.org/) library for SQL queries which is a lot less code management and does the same job without requiring strict model definitions.

There are also no global variables.  Each `require` must be defined per library or component file.

The implementation is NOT build using full [ES6](https://www.w3schools.com/js/js_es6.asp) features as we also understand backwards compatibility and upgrading can be a challenge.

This software has been tested with NodeJS 8, 10, 12.

## Install ##

Based on your system, you will need to install [NodeJS 8.x + NPM](http://nodejs.org/download/) to handle NodeJS Dependencies.  It is recommended that this project is installed on a Linux/Unix environment and not Windows.

Local Dependencies (loosely coupled - you can swap out if you want):

* Redis (for sessions)
* MySQL2 (for database)

Once you checkout the project, you will need to update the *env/local.js* configuration file.

Within the project root directory, run:

	npm install

## AWS Integration
If you use AWS SSM for configuration variables, you can include values in your configuration as such:

	module.exports.database = {
		connection: {
			password: 'ssm://some/key/here'
		}
	}

## Configuration
Updates to your environment specific configuration file will override any default configurations in your `config` directory.

The *prestart.js* file will replace those values with the appropriate information as long as you have
an available *AWS_PROFILE* set in *~/.aws/credentials*.

## Understanding Components
In a cloud environment, you might not want to run all code in a single container instance. Therefore, each component can be loaded individually. If you want to deploy different parts your project in Docker containers or individual PM2 applications, this structure will work for you.

To create a new component with default settings, run:

	node bin/component --action=create --name=MyName

To remove a component with default settings, run:

	node bin/component --action=remove --name=MyName

To run the application loading only certain components, use:

	AWS_PROFILE=[profile] NODE_ENV=local npm start -- --components=Core,MainAll assets from components will be copied to the *public* directory.  Any assets configured within  *config/assets.js* will be simply concactenated into a single file in the same *public* directory.

To run the application, use:

	AWS_PROFILE=[profile] NODE_ENV=local npm start

To cluster, pass the cluster flag:

	AWS_PROFILE=[profile] NODE_ENV=local npm start -- --cluster=true

All assets from components will be copied to the *public* directory.  Any assets configured within  *config/assets.js* will be simply concactenated into a single file in the same *public* directory.

