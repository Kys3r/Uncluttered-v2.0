'user strict'
const Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Validate = require("validate.js"),
			Log = require('log-to-file')

// Database Utils
const Sequelize = require('sequelize'),
			Models = require('../database/models'),
			Op = Sequelize.Op

// Utils
const Token = require('../models/token'),
			Lib = require('../lib/lib'),
			SubM = require('../models/subscribtions')

Router.post('/free-sub', async (req, res) => {
	try {
		let { token } = req.headers
		let { name, quantity, plan_id, end_date, only_new_member } = req.body
		if (!Validate.isEmpty(quantity) && !Validate.isEmpty(plan_id) && !Validate.isEmpty(name) && !Validate.isEmpty(end_date) && !Validate.isEmpty(only_new_member)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0) {
						let code = String("bfc-" + name + "-" + Token.generateToken(4)).toLowerCase()
						Models.Free_sub_codes.create(
							{
								code: code,
								quantity: quantity,
								remaining_quantity: quantity,
								plan_id: plan_id,
								end_date: end_date,
								only_new_member: only_new_member
							})
							.then(resp => res.send(code))
							.catch(e => {
								Log("Route /promotions/create -> " + e)
								res.send('500')
							})
					}
					else
						res.send('42')
				} catch (e) {
					Log("ROUTE /promotions/create - id: " + decoded.id)
					res.send('500')
				}
			})
		}
		else {
			Log("ROUTE /promotions/create : object empty or invalid")
			res.send('500')
		}
	} catch (e) {
		Log("ROUTE /promotions/create :  -> " + e)
		res.send('500')
	}
})

Router.put('/free-sub', async (req, res) => {
	try {
		let { token } = req.headers
		let { code } = req.body
		if (!Validate.isEmpty(code)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else {
						let promo = await Models.Free_sub_codes.findOne(
							{
								where: {
									code: code,
									remaining_quantity: {
										[Op.gt]: 0
									},
									end_date: {
										[Op.gte]: new Date()
									}
								},
								attributes: ['id', 'plan_id', 'only_new_member'],
								raw: true
							})
						if (!Validate.isEmpty(promo) && Validate.isDefined(promo)) {
							try {
								let alreadyUse = await Models.Users_free_subs.findOne(
									{
										where: {
											user_id: decoded.id,
											free_sub_id: promo.id
										},
										raw: true
									})
								if (Validate.isEmpty(alreadyUse)) {
									let user = await Models.Users.findOne(
										{
											where: {
												id: decoded.id
											},
											attributes: ['second_form'],
											raw: true
										})
									if (promo.only_new_member == false || (promo.only_new_member == true && user.second_form == false)) {
										await Models.Free_sub_codes.decrement({ remaining_quantity: 1 }, { where: { id: promo.id } })
										let plan = await Models.Plans.findOne(
											{
												where: {
													id: promo.plan_id
												},
												attributes: ['id', 'month'],
												raw: true
											})
										await Models.Users_free_subs.create(
											{
												user_id: decoded.id,
												free_sub_id: promo.id
											})
										await SubM.insertSub(decoded.id, plan.id, plan.month)
										res.send('1')
									}
									else
										res.send('4')
								}
								else
									res.send('3')
							} catch (e) {
								Log("Erreur verif si utilisateur a déjà use un free sub, id: " + decoded.id + " -> " + e)
								res.send('500')
							}
						}
						else
							res.send('2')
					}
				} catch (e) {
					Log("ROUTE /promotions/create - id: " + decoded.id + " -> " + e)
					res.send('500')
				}
			})
		}
		else {
			Log("ROUTE /promotions/free-sub : object empty or invalid")
			res.send('500')
		}
	} catch (e) {
		Log("ROUTE /promotions/free-sub :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
