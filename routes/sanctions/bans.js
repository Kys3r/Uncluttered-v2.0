'user strict'
const Express = require('express'),
			Router = Express.Router(),
			Validate = require("validate.js"),
			Log = require('log-to-file'),
			Jwt = require('jsonwebtoken')

// Database Utils
const Sequelize = require('sequelize'),
			Op = Sequelize.Op,
			Models = require('../../database/models')

// GET

Router.get('/:id', async (req, res) => {
	try {
		let { id } = req.params
		let { token } = req.headers
		if (!Validate.isEmpty(token) && !Validate.isEmpty(id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				if (err)
					return res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0 || decoded.roles.indexOf('bot') >= 0) {
					let banned = await Models.Banneds.findOne(
						{
							where: {
								banned_id: id,
								until: { [Op.gte]: new Date() }
							},
							raw: true,
							include: [
								{
									model: Models.Penalization_reasons_bans,
									as: 'ban_reason',
									attributes: ['name_fr', 'name_en']
								},
								{
									model: Models.Users,
									as: 'banisher',
									attributes: ['username']
								}
							]
						})
					res.send(banned)
				}
				else
					res.send('42')
			})
		}
		else
			res.send('500')
	} catch (e) {
		Log("ROUTE post /bans/:id :  -> " + e)
		res.send('500')
	}
})

// POST
Router.post('/', async (req, res) => {
	try {
		let { banned_id, banisher_id, penalization_reason_id, until, comment } = req.body
		let { token } = req.headers

		if (!Validate.isEmpty(token) && !Validate.isEmpty(banned_id) && !Validate.isEmpty(banisher_id) && !Validate.isEmpty(penalization_reason_id) && !Validate.isEmpty(until)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				if (err)
					return res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0 || decoded.roles.indexOf('banisher') >= 0) {
					let newDate = Date.now()
					newDate += Number(until)
					let user = await Models.Users.findOne({
						where: {
							id: banned_id
						},
						attributes: ['id', 'epic_id']
					})
					if (Validate.isEmpty(user))
						return res.send('500')
					await Models.Banneds.create(
						{
							banned_id: banned_id,
							banisher_id: banisher_id,
							penalization_reason_id: penalization_reason_id,
							until: newDate,
							comment: comment,
							epic_id: user.epic_id
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
		Log("ROUTE post /bans :  -> " + e)
		res.send('500')
	}
})


Router.post('/unban', async (req, res) => {
	try {
		let { banned_id } = req.body
		let { token } = req.headers

		if (!Validate.isEmpty(token) && !Validate.isEmpty(banned_id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				if (err)
					return res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0) {
					await Models.Banneds.destroy({ where: { banned_id: banned_id } })
					res.send('1')
				}
				else
					res.send('42')
			})
		}
		else
			res.send('500')
	} catch (e) {
		Log("ROUTE post /bans :  -> " + e)
		res.send('500')
	}
})



module.exports = Router
