'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Validate = require("validate.js"),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../database/models')

// GET

Router.get('/', async (req, res) =>
{
	let { token } = req.headers;
	let tmp;
	try {
		if (Validate.isDefined(token) && !Validate.isEmpty(token))
		{
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				let maps = await Models.Maps.findAll(
				{
					order: [ [ 'createdAt', 'DESC' ] ],
					include: [
						{
							model: Models.Type_maps,
							as: 'type_map',
							attributes: ['name']
						}
					]
				})
				for (let i = 0; i < maps.length; i++)
				{
					tmp = await Models.Liked_maps.count({ where: { map_id: maps[i].id, user_id: decoded.id } })

					maps[i].dataValues = { ...maps[i].dataValues, likes: await Models.Liked_maps.count({ where: { map_id: maps[i].id } })};
					maps[i].dataValues = { ...maps[i].dataValues, like_user: (tmp == 1 ? true : false)};
				}
				res.send(maps)
			})
		}
		else
		{
			let maps = await Models.Maps.findAll(
			{
				order: [ [ 'createdAt', 'DESC' ] ],
				include: [
					{
						model: Models.Type_maps,
						as: 'type_map'
					},
				]
			})
			for (let i = 0; i < maps.length; i++)
			{
				maps[i].dataValues = { ...maps[i].dataValues, likes: await Models.Liked_maps.count({ where: { map_id: maps[i].id } }), like_user: false};
			}
			res.send(maps)
		}
	} catch (e) {
		Log("ROUTE maps/ :  -> " + e)
		res.send('500')
	}
})

Router.get('/:id', async (req, res) =>
{
	let { token } = req.headers;
	let { id } = req.params
	let tmp;
	try {
		if (Validate.isDefined(token) && !Validate.isEmpty(token))
		{
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				let maps = await Models.Maps.findOne(
				{
					where: {
						id: id
					},
					include: [
						{
							model: Models.Type_maps,
							as: 'type_map',
							attributes: ['name']
						}
					]
				})
				tmp = await Models.Liked_maps.count({ where: { map_id: maps.id, user_id: decoded.id } })
				maps.dataValues = { ...maps.dataValues, likes: await Models.Liked_maps.count({ where: { map_id: maps.id } })};
				maps.dataValues = { ...maps.dataValues, like_user: (tmp == 1 ? true : false)};

				res.send(maps)
			})
		}
		else
		{
			let maps = await Models.Maps.findOne(
			{
				where: {
					id: id
				},
				include: [
					{
						model: Models.Type_maps,
						as: 'type_map'
					}
				]
			})
			maps.dataValues = { ...maps.dataValues, likes: await Models.Liked_maps.count({ where: { map_id: maps.id } }), like_user: false};

			res.send(maps)
		}
	} catch (e) {
		Log("ROUTE maps/ :  -> " + e)
		res.send('500')
	}
})

//PUT

Router.put('/like', async (req, res) =>
{
	const { token } = req.headers
	const { id } =req.body
	try {
		if (!Validate.isEmpty(token) && !Validate.isEmpty(id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (err)
					res.send('42')
				else
				{
					Models.Liked_maps.findOne({ where: { user_id: decoded.id, map_id: id } })
					.then(response =>{
						if (!Validate.isEmpty(response))
						{
							Models.Liked_maps.destroy({ where: { user_id: decoded.id, map_id: id } })
							.then(r => res.send('1'))
							.catch(e => {
								Log("ROUTE maps/like, map_id = " + id + ", id user = " + id + " --> " + e)
								res.send('500')
							})
						}
						else
						{
							Models.Liked_maps.create({ user_id: decoded.id, map_id: id })
							.then(r => res.send('1'))
							.catch(e => {
								Log("ROUTE maps/like, map_id = " + id + ", id user = " + id + " --> " + e)
								res.send('500')
							})
						}
					})
					.catch(e => {
						Log("ROUTE maps/like, map_id = " + id + ", id user = " + id + " --> " + e)
						res.send('500')
					})
				}
			})
		}
		else {
			res.send('500')
		}
	} catch (e) {
		Log("ROUTE maps/like :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
