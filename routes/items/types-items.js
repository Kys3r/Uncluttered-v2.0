'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../../database/models')

const	Jwt = require('jsonwebtoken'),
			Validate = require('validate.js')

// GET

Router.get('/:id', async (req, res) =>
{
	let { id } = req.params
	try {
		if (Validate.isEmpty(id))
			return res.send()
		let ret = await Models.Items.findAll(
		{
			where: { type_id: id },
			include: [
				{
					model: Models.Types_items,
					as: 'type_item',
					attributes: ['id', 'name']
				},
				{
					model: Models.Ranks_items,
					as: 'rank_item',
					attributes: ['id', 'name']
				}
			]
		})
		res.send(ret)
	} catch (e) {
		Log("ROUTE /types-items/:id :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
