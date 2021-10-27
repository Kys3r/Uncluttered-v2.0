'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Fs = require('fs'),
			Jwt = require('jsonwebtoken'),
			Validate = require("validate.js"),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Op = Sequelize.Op,
			Models = require('../database/models')

											// GET

Router.get('/', async (req, res) =>
{
	try {
		let times = await Models.Times.findAll({
			attributes: ['id', 'name_fr', 'name_en', 'time'],
			raw: true
		})
		return res.send(times)
	} catch (e) {
		Log("ROUTE /times/:id :  -> " + e)
		res.send('500')
	}
})

Router.get('/:id', async (req, res) =>
{
	try {
		let { id } = req.params
		let time = await Models.Times.findOne({
			where: {
				id: id
			},
			attributes: ['id', 'name_fr', 'name_en', 'time'],
			raw: true
		})
		return res.send(time)
	} catch (e) {
		Log("ROUTE /times/:id :  -> " + e)
		res.send('500')
	}
})



module.exports = Router
