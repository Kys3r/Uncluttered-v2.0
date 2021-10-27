'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../database/models')

// GET

Router.get('/', async (req, res) =>
{
	try {
		let servers = await Models.Servers.findAll({
			attributes: ['id','alpha_code', 'name']
		})
		res.send(servers)
	} catch (e) {
		Log("ROUTE /servers/ :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
