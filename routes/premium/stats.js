'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Validate = require("validate.js"),
			Log = require('log-to-file'),
			Bcrypt = require('bcrypt')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../../database/models'),
			Op = Sequelize.Op

Router.get('/total-result-euros', async (req, res) =>
{
	try {
		let { token } = req.headers
		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
		{
			if (err)
				return res.send('42')
			else if (decoded.roles.indexOf('admin') >= 0)
			{
				let total = await Models.Premium_transactions.findAll({
					where: {
						success: true
					},
					attributes: [
						[Sequelize.fn('sum', Sequelize.col('amount')), 'total_amount'],
					]
				})
				res.send(total)
			}
			else
				res.send('42')
		})
	} catch (e) {
		Log("ROUTE GET /premium/total-result-euros :  -> " + e)
		res.send('500')
	}
})

Router.get('/total-pass-used', async (req, res) =>
{
	try {
		let { token } = req.headers
		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
		{
			if (err)
				return res.send('42')
			else if (decoded.roles.indexOf('admin') >= 0)
			{
				let total = await Models.Subscriptions.count({})
				res.send(String(total))
			}
			else
				res.send('42')
		})
	} catch (e) {
		Log("ROUTE GET /premium/total-pass-used/:id :  -> " + e)
		res.send('500')
	}
})

Router.get('/total-pass-used/:id', async (req, res) =>
{
	try {
		let { token } = req.headers
		let { id } = req.params
		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
		{
			if (err)
				return res.send('42')
			else if (decoded.roles.indexOf('admin') >= 0)
			{
				let total = await Models.Subscriptions.count({
					where: {
						plan_id: id
					}
				})
				res.send(String(total))
			}
			else
				res.send('42')
		})
	} catch (e) {
		Log("ROUTE GET /premium/total-pass-used/:id :  -> " + e)
		res.send('500')
	}
})

Router.get('/total-pass-using/:id', async (req, res) =>
{
	try {
		let { token } = req.headers
		let { id } = req.params
		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
		{
			if (err)
				return res.send('42')
			else if (decoded.roles.indexOf('admin') >= 0)
			{
				let total = await Models.Subscriptions.count({
					where: {
						plan_id: id,
						end_date: {
							[Op.gte]: new Date()
						}
					}
				})
				res.send(String(total))
			}
			else
				res.send('42')
		})
	} catch (e) {
		Log("ROUTE GET /premium/total-pass-used/:id :  -> " + e)
		res.send('500')
	}
})

Router.get('/total-pass-using/:id', async (req, res) =>
{
	try {
		let { token } = req.headers

		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
		{
			if (err)
				return res.send('42')
			else if (decoded.roles.indexOf('admin') >= 0)
			{
				let total = await Models.Subscriptions.count({
					where: {
						end_date: {
							[Op.gte]: new Date()
						}
					}
				})
				res.send(String(total))
			}
			else
				res.send('42')
		})
	} catch (e) {
		Log("ROUTE GET /premium/total-pass-used/:id :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
