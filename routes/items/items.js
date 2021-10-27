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

Router.get('/', async (req, res) =>
{
	let { token } = req.headers
	try {
			await Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (!err)
				{
					let items = await Models.Items.findAll(
					{
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
					let user_items = await Models.Users_items.findAll(
					{
						where: { user_id: decoded.id },
						attributes: ['item_id']
					})
					res.send({items, user_items})
				}
				else
				{
					let items = await Models.Items.findAll(
					{
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
					res.send(items)
				}
			})
	} catch (e) {
		Log("ROUTE /items/ :  -> " + e)
		res.send('500')
	}
})

Router.get('/:id', async (req, res) =>
{
	let { token } = req.headers
	let { id } = req.params
	try {
		if (!Validate.isEmpty(id) && Validate.isDefined(id))
		{
			await Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (!err)
				{
					let item = await Models.Items.findOne(
					{
						where: { id: id },
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
					let user_item = await Models.Users_items.findOne(
					{
						where: { user_id: decoded.id, item_id: id },
						attributes: ['item_id']
					})
					user_item = Validate.isEmpty(user_item) ? false : true
					res.send({item, user_item})
				}
				else
				{
					let item = await Models.Items.findOne(
					{
						where: { id: id },
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
					res.send(item)
				}
			})
		}
		else
		{
			Log("ROUTE /items/:id :  -> id manquant")
			res.send('500')
		}
	} catch (e) {
		Log("ROUTE /items/:id :  -> " + e)
		res.send('500')
	}
})

// PUT

Router.put('/purchase/:id', async (req, res) =>
{
	let { token } = req.headers
	let { id } = req.params
	try {
		if (!Validate.isEmpty(id) && Validate.isDefined(id) && !Validate.isEmpty(token) && Validate.isDefined(token))
		{
			await Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (err)
					res.send('42')
				else
				{
					let user_wallet = await Models.Users.findOne(
					{
						where: { id: decoded.id },
						attributes: ['wallet'],
						raw: true
					})
					let item = await Models.Items.findOne(
					{
						where: {
							id: id,
							premium_only: false
						},
						attributes: ['price']
					})
					if (!Validate.isEmpty(user_wallet) && !Validate.isEmpty(item))
					{
						if (user_wallet.wallet >= item.price)
						{
							await Models.Users_items.findOrCreate({
								defaults: { user_id: decoded.id, item_id: id },
								where: { user_id: decoded.id, item_id: id }
							})
							.spread(async (user_item, created) =>
							{
								if (created)
								{
									await Models.Users.decrement({ wallet: item.price }, { where: { id: decoded.id }})
									await Models.Users.increment({ spent_points: item.price }, { where: { id: decoded.id }})
									res.send('1')
								}
								else
									res.send('500')
							})
						}
						else
							res.send('2')
					}
					else
						res.send('500')
				}
			})
		}
		else
		{
			Log("ROUTE /purchase/:id :  -> id ou token manquant")
			res.send('500')
		}
	} catch (e) {
		Log("ROUTE /purchase/:id :  -> " + e)
		res.send('500')
	}
})



module.exports = Router
