'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Validate = require("validate.js"),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../database/models'),
			Op = Sequelize.Op

// Utils
const	Token = require('../models/token'),
			Lib = require('../lib/lib'),
			SubM = require('../models/subscribtions')

Router.get('/profile/:name', async (req, res) =>
{
	try {
		let { name } = req.params

		if (!Validate.isEmpty(name) && (name.length >= 3 && name.length <= 16))
		{
			let list = await Models.Users.findAll(
			{
				where: {
					username: {
						[Op.iLike]: '%' + name + '%'
					}
				},
				raw: true,
				attributes: ['id', 'username', 'profil_picture']
			})
			res.send(list)
		}
		else
			res.send('500')
	} catch (e) {
		Log("ROUTE /search/profile :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
