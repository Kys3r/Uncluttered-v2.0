'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../../database/models')

const	Jwt = require('jsonwebtoken'),
			Validate = require('validate.js')

// Utils
const	PurchaseM = require('../../models/purchase'),
			Sub = require('../../models/subscribtions'),
			Lib = require('../../lib/lib'),
			Email = require('../../models/email')

// GET

Router.get('/group-mailing', async (req, res) =>
{
	let { token } = req.headers
	let items;
	try {
		await Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
		{
			console.log(decoded.id);
			if (err)
				return res.send('42')
			else if (decoded.roles.indexOf('admin') >= 0)
			{
				Email.groupMail('kawaboog@gmail.com', 'fr') //kawaboog@gmail.com
				res.send('1')
			}
			else
				res.send('42')
		})
	} catch (e) {
		Log("ROUTE mailing/group-mailing :  -> " + e)
		res.send('500')
	}
})


module.exports = Router
