'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../database/models')

// Utils
const	SeasonM = require('../models/seasons')

/* GET home page. */
Router.get('/', async (req, res, next) =>
{
	let headline;
	const id_season = await SeasonM.getCurrentSeasonId()

	try {
		let ret = await Models.Headlines.findOne({})

		if (ret.type_article == "maps")
			headline = await Models.Maps.findOne(
			{
				where:
				{
					id: ret.article_id
				},
				attributes: ['id', 'title', 'path_1']
			})
		else
			headline = await Models.News.findOne(
				{
					where:
					{
						id: ret.article_id
					},
					attributes: ['id', 'title_fr', 'path_1', 'title_en']
				})
		headline.dataValues = { ...headline.dataValues, type_article: ret.type_article};

		let maps = await Models.Maps.findAll({
			limit: 6,
			order: [ [ 'createdAt', 'DESC' ] ],
			attributes: ['id', 'title', 'patch', 'path_1', 'createdAt', 'updatedAt'],
			include: [
				{
					model: Models.Type_maps,
					as: 'type_map',
					attributes: ['name']
				}
			]
		})

		let news = await Models.News.findAll({
			limit: 6,
			order: [ [ 'createdAt', 'DESC' ] ],
			attributes: ['id', 'title_fr', 'title_en', 'path_1', 'createdAt', 'updatedAt']
		})

		let top3Bf = await Models.Seasons_scores.findAll(
		{
			where: {
				season_id: id_season,
				mode_id: 1
			},
			limit: 3,
			order: [ [ 'elo', 'DESC' ], [ 'winrate', 'DESC' ] ],
			attributes: ['elo', 'winrate', 'mode_id', 'server_id'],
			include: [
				{
					model: Models.Users,
					as: 'user',
					attributes: ['id', 'username', 'color_pseudo', 'profil_picture'],
					include: [
						{
							model: Models.Countries,
							as: 'country',
							attributes: ['alpha_code', 'name']
						}
					]
				}
			]
		})

		let top3Bxf1v1 = await Models.Seasons_scores.findAll(
		{
			where: {
				season_id: id_season,
				mode_id: 2
			},
			limit: 3,
			order: [ [ 'elo', 'DESC' ], [ 'winrate', 'DESC' ] ],
			attributes: ['elo', 'winrate', 'mode_id', 'server_id'],
			include: [
				{
					model: Models.Users,
					as: 'user',
					attributes: ['id', 'username', 'color_pseudo', 'profil_picture'],
					include: [
						{
							model: Models.Countries,
							as: 'country',
							attributes: ['alpha_code', 'name']
						}
					]
				}
			]
		})
		for (var i = 0; i < top3Bf.length; i++)
		{
			let image = top3Bf[i].user.profil_picture.split('.')
			top3Bf[i].user.profil_picture = await { path: image[0], type: image[1] }
		}
		for (var i = 0; i < top3Bxf1v1.length; i++)
		{
			let image = top3Bxf1v1[i].user.profil_picture.split('.')
			top3Bxf1v1[i].user.profil_picture = await { path: image[0], type: image[1] }
		}

		res.send({headline, maps, news, top3Bf, top3Bxf1v1})
	} catch (e) {
		Log("ROUTE index :  -> " + e)
		res.send('500')
	}
});

module.exports = Router
