'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Validate = require("validate.js"),
			Log = require('log-to-file'),
			Jwt = require('jsonwebtoken')

// Database Utils
const	Sequelize = require('sequelize'),
			Op = Sequelize.Op,
			Models = require('../../database/models')

											// GET

Router.get('/', async (req, res) =>
{
	try {
		let penalizations = await Models.Penalization_reasons.findAll({
			include: [
				{
					model: Models.Times,
					as: 'times'
				}
			]
		})
		res.send(penalizations)
	} catch (e) {
		Log("ROUTE /sanctions/ :  -> " + e)
		res.send('500')
	}
})

Router.get('/:id', async (req, res) =>
{
	try {
		let { id } = req.params
		if (Validate.isEmpty(id))
			return res.send('500')
		let penalizations = await Models.Penalization_reasons.findAll(
		{
			where: {
				id: id
			},
			include: [
				{
					model: Models.Times,
					as: 'times'
				}
			]
		})
		res.send(penalizations)
	} catch (e) {
		Log("ROUTE /sanctions/:id :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
