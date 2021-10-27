'user strict'
const	Express = require('express'),
		Router = Express.Router(),
		Log = require('log-to-file'),
		Twit = require('twit')

// Database Utils
const	Sequelize = require('sequelize'),
		Models = require('../database/models')

const	Achievements = require('../models/achievements'),
		Jwt = require('jsonwebtoken'),
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
					await Models.Users_achievements.update({ is_notified: true }, { where: { is_notified: false } })
					let user_stats = await Achievements.majAchievements(decoded.id)
					let achievements = await Models.Achievements.findAll(
					{
						include: [
							{
								model: Models.Achievements_categories,
								as: 'category',
								attributes: ['id', 'name_fr', 'name_en']
							},
							{
								model: Models.Ranks,
								as: 'rank_achievement',
								attributes: ['id', 'name']
							}
						]
					})
					let user_achievements = await Models.Users_achievements.findAll(
					{
						where: { user_id: decoded.id },
						attributes: ['achievement_id', 'is_notified']
					})
					res.send({ achievements, user_achievements, user_stats })
				}
				else
				{
					let achievements = await Models.Achievements.findAll(
					{
						include: [
							{
								model: Models.Achievements_categories,
								as: 'category',
								attributes: ['id', 'name_fr', 'name_en']
							},
							{
								model: Models.Ranks,
								as: 'rank_achievement',
								attributes: ['id', 'name']
							}
						]
					})
					res.send(achievements)
				}
			})
	} catch (e) {
		Log("ROUTE /achievements/ :  -> " + e)
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
					let achievement = await Models.Achievements.findAll(
					{
						where: { id: id },
						include: [
							{
								model: Models.Achievements_categories,
								as: 'category',
								attributes: ['id', 'name_fr', 'name_en']
							},
							{
								model: Models.Ranks,
								as: 'rank_achievement',
								attributes: ['id', 'name']
							}
						]
					})
					let user_achievement = await Models.Users_achievements.findOne(
					{
						where: { user_id: decoded.id, achievement_id: id },
						attributes: ['achievement_id']
					})
					user_achievement = Validate.isEmpty(user_achievement) ? false : true
					res.send({achievement, user_achievement})
				}
				else
				{
					let achievement = await Models.Achievements.findOne(
					{
						where: { id: id },
						include: [
							{
								model: Models.Achievements_categories,
								as: 'category',
								attributes: ['id', 'name_fr', 'name_en']
							},
							{
								model: Models.Ranks,
								as: 'rank_achievement',
								attributes: ['id', 'name']
							}
						]
					})
					res.send(achievement)
				}
			})
		}
	} catch (e) {
		Log("ROUTE /achievements/:id :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
