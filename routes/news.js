'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../database/models')

// GET

Router.get('/', async (req, res) =>
{
	try {
		let news = await Models.News.findAll({
			include: [
				{
					model: Models.Types_news,
					as: 'type_news',
					attributes: ['id', 'name_fr', 'name_en'],
					throught: []
				}
			]
		})
		res.send(news)
	} catch (e) {
		Log("ROUTE news/ :  -> " + e)
		res.send('500')
	}
})

Router.get('/:id', async (req, res) =>
{
	let { id } = req.params
	try {
		let news = await Models.News.findOne(
		{
			where: {
				id: id
			},
			include: [
				{
					model: Models.Types_news,
					as: 'type_news',
					attributes: ['id', 'name_fr', 'name_en'],
					throught: []
				}
			]
		})
		res.send(news)
	} catch (e) {
		Log("ROUTE news/:id :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
