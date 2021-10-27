'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Validate = require("validate.js"),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../../database/models'),
			Op = Sequelize.Op

Router.post('/', async (req, res) =>
{
	try {
		const { token } = req.headers
		const { user_id, role_id } = req.body

		if (!Validate.isEmpty(token) && Validate.isDefined(token) && !Validate.isEmpty(user_id) && Validate.isDefined(user_id) && !Validate.isEmpty(role_id) && Validate.isDefined(role_id))
		{
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (err)
					return res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0)
				{
					await Models.Users_roles.create({user_id: user_id, role_id: role_id})
					res.send('1')
				}
				else {
					Log("ROUTE POST /users-roles/ Probleme droit du role - id: " + decoded.id + " :  -> ACCES INTERDIT")
					res.send('500')
				}
			})
		}
		else
		{
			Log("ROUTE POST /users-roles/ -> token manquant ou erroné")
			res.send('500')
		}
	} catch (e) {
		Log("ROUTE POST /users-roles/   -> " + e)
		res.send('500')
	}
})

Router.post('/delete', async (req, res) =>
{
	try {
		const { token } = req.headers
		const { user_id, role_id } = req.body

		if (!Validate.isEmpty(token) && Validate.isDefined(token) && !Validate.isEmpty(user_id) && Validate.isDefined(user_id) && !Validate.isEmpty(role_id) && Validate.isDefined(role_id))
		{
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (err)
					return res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0)
				{
					await Models.Users_roles.destroy({where: {user_id: user_id, role_id: role_id}})
					res.send('1')
				}
				else {
					Log("ROUTE DELETE /users-roles/ Probleme droit du role - id: " + decoded.id + " :  -> ACCES INTERDIT")
					res.send('500')
				}
			})
		}
		else
		{
			Log("ROUTE DELETE /users-roles/ -> token manquant ou erroné")
			res.send('500')
		}
	} catch (e) {
		Log("ROUTE DELETE /users-roles/   -> " + e)
		res.send('500')
	}
})

module.exports = Router
