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
		let modes = await Models.Modes.findAll({
			attributes: ['id','is_ranked', 'name']
		})
		res.send(modes)
	} catch (e) {
		Log("ROUTE /modes/ :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
