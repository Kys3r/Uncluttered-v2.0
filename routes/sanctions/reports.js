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

// Utils
const Lib = require('../../lib/lib')

											// GET

Router.get('/:id', async (req, res) =>
{
	try {
		let { id } = req.params
		let { token } = req.headers
		if (!Validate.isEmpty(token) && !Validate.isEmpty(id))
		{
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (err)
					return res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0)
				{
					let reports = await Models.Reports.findAll(
					{
						where: {
							reported_id: id
						},
						raw: true,
						include: [
							{
								model: Models.Penalization_reasons_reports,
								as: 'report_reason',
								attributes: ['name_fr', 'name_en']
							},
							{
								model: Models.Users,
								as: 'reporter',
								attributes: ['username']
							}
						]
					})
					res.send(reports)
				}
				else
					res.send('42')
			})
		}
		else
			res.send('500')
	} catch (e) {
		Log("ROUTE post /report :  -> " + e)
		res.send('500')
	}
})

											// POST
Router.post('/', async (req, res) =>
{
	try {
		let { id, penalization_reason_id, comment } = req.body
		let { token } = req.headers

		if (!Validate.isEmpty(token) && !Validate.isEmpty(id) && !Validate.isEmpty(penalization_reason_id))
		{
			let user = await Models.Users.findOne({
				where: {
					id: id
				},
				attributes: ['id']
			})
			if (Validate.isEmpty(user))
				return res.send('500')
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (err)
					return res.send('42')
				// Trouver la derniére game entre les deux adversaires dans la dernière heure
				let lastGamesBetween = await Models.Games_1v1_histories.findAll(
				{
					where: {
						[Op.or]: [
							{
								player_a_id: decoded.id,
								player_b_id: id
							},
							{
								player_a_id: id,
								player_b_id: decoded.id
							}
						],
						createdAt: {
							[Op.gte]: Lib.subHours(new Date(), 1)
						}
					},
					limit: 1,
					order: [ [ 'createdAt', 'DESC' ] ],
					attributes: ['createdAt'],
					raw: true
				})
				if (Validate.isEmpty(lastGamesBetween))
					return res.send('500')
				//Trouver le dernier report d'un adversaire dans les derniers 24h
				let lastReport = await Models.Reports.findAll(
				{
					where: {
						reported_id: id,
						reporter_id: decoded.id,
						createdAt: {
							[Op.gte]: Lib.subDays(new Date(), 1)
						}
					},
					limit: 1,
					order: [ [ 'createdAt', 'DESC' ] ],
					attributes: ['createdAt'],
					raw: true
				})
				if (!Validate.isEmpty(lastReport))
					return res.send('2')
				Models.Reports.create(
				{
					reported_id: id,
					reporter_id: decoded.id,
					penalization_reason_id: penalization_reason_id,
					comment: comment
				})
				res.send('1')
			})
		}
		else
			res.send('500')
	} catch (e) {
		Log("ROUTE post /reports :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
