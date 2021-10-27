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
				else if (decoded.roles.indexOf('admin') >= 0 || decoded.roles.indexOf('bot') >= 0)
				{
					let kicked = await Models.Kickeds.findOne(
					{
						where: {
							kicked_id: id,
							until: { [Op.gte]: new Date() }
						},
						include: [
							{
								model: Models.Penalization_reasons,
								as: 'kick_reason',
								attributes: ['name_fr', 'name_en'],
								include: [
									{
										model: Models.Times,
										as: 'times'
									}
								]
							}
						]
					})
					res.send(kicked)
				}
				else
					res.send('42')
			})
		}
		else
			res.send('500')
	} catch (e) {
		Log("ROUTE post /kicks/:id :  -> " + e)
		res.send('500')
	}
})

											// POST
Router.post('/', async (req, res) =>
{
	try {
		let { kicked_id, kicker_id, penalization_reason_id, comment } = req.body
		let { token } = req.headers

		if (!Validate.isEmpty(token) && !Validate.isEmpty(kicked_id) && !Validate.isEmpty(kicker_id) && !Validate.isEmpty(penalization_reason_id))
		{
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (err)
					return res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0 || decoded.roles.indexOf('bot') >= 0)
				{
					let penalizations = await Models.Penalization_reasons. findOne({
						where: {
							id: penalization_reason_id
						},
						include: [
							{
								model: Models.Times,
								as: 'times',
								attributes: ['id', 'time']
							}
						],
						raw: true
					})
					if (Validate.isEmpty(penalizations))
						return res.send('500')

					let newDate = Date.now()
					newDate += Number(penalizations['times.time'])
					newDate = new Date(newDate)

					let user = await Models.Users.findOne({
						where: {
							id: kicked_id
						},
						attributes: ['id']
					})
					if (Validate.isEmpty(user))
						return res.send('500')
					if (penalization_reason_id == 9)
					{
						await Models.Users.update(
							{ profil_picture: "PP-1.png" },
							{ where: { id: kicked_id } }
						)
					}
					await Models.Kickeds.create(
					{
						kicked_id: kicked_id,
						kicker_id: kicker_id,
						penalization_reason_id: penalization_reason_id,
						until: newDate,
						comment: comment
					})
					res.send('1')
				}
				else
					res.send('42')
			})
		}
		else
			res.send('500')
	} catch (e) {
		Log("ROUTE post /kicks :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
