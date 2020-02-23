# Core UI

Core UI is a loosely coupled "quick-start" project for NodeJS Web Applications that require:

- Web Server
- Views
- Public Assets
	- Asset Concatenation
- Session Management
- Database Access
- Modular Deploy Capability
- Cluster Capability
- AWS Credential Usage

## Usage/Install ##

Based on your system, you will need to install [NodeJS 8.x + NPM](http://nodejs.org/download/) to handle NodeJS Dependencies.  It is recommended that this project is installed on a Linux/Unix environment and not Windows.

Local Dependencies:

* Redis (for sessions)
* MySQL2 (for database)

Once you checkout the project, you will need to update the *env/local.js* configuration file.

If you use AWS SSM for configuration variables, you can inclue values in your configuration as such:

	module.exports.database = {
		connection: {
			password: 'ssm://some/key/here'
		}
	}

The *prestart.js* file will replace those values with the appropriate information as long as you have
an available *AWS_PROFILE* set in *~/.aws/credentials*.

Once setup as such, you should be able to install all dependencies.

Within the project root directory, run:

	npm install

All assets from components will be copied to the *public* directory.  Any assets configured within  *config/assets.js* will be simply concactenated into a single file in the same *public* directory.

To run the application, use:

	AWS_PROFILE=[profile] NODE_ENV=local npm start

To cluster, pass the cluster flag:

	AWS_PROFILE=[profile] NODE_ENV=local npm start -- --cluster=true

## Understanding Components
In a cloud environment, you might not want to run all code in a single container instance. Therefore, each component can be loaded individually. If you want to deploy different parts your project in Docker containers or individual PM2 applications, this structure will work for you.

To create a new component with default settings, run:

	node bin/component --action=create --name=MyName

To remove a component with default settings, run:

	node bin/component --action=remove --name=MyName

To run the application loading only certain components, use:

	AWS_PROFILE=[profile] NODE_ENV=local npm start -- --components=Core,Main

If you want to view the application in a web browser, simply navigate to [localhost:8080](http://localhost:80807) and you should see the welcome page.
