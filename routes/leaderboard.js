'user strict'
const Express = require('express'),
			Router = Express.Router(),
			Validate = require("validate.js"),
			Log = require('log-to-file')

// Database Utils
const Sequelize = require('sequelize'),
			Models = require('../database/models'),
			Op = Sequelize.Op

// Utils
const SeasonM = require('../models/seasons'),
			Ranking = require('../models/ranking'),
			Sub = require('../models/subscribtions');

// GET

const cache = {}

Router.get('/:server/:platform/:mode', async (req, res) => {
	let { server, platform, mode } = req.params

	try {
		if (!Validate.isEmpty(server) || !Validate.isEmpty(platform) || !Validate.isEmpty(mode)) {
			const id_season = await SeasonM.getCurrentSeasonId()

			if (cache[server + '-' + platform + '-' + mode] && cache[server + '-' + platform + '-' + mode].date > Date.now() - 300000)
				return res.send(cache[server + '-' + platform + '-' + mode].data)

			if (server > 0 && platform > 0 && (mode >= 1 && mode <= 2)) // Leaderboard filtre server et platform
			{
				let leaderboard = await Models.Seasons_scores.findAll(
					{
						where: {
							season_id: id_season,
							mode_id: mode,
							server_id: server
						},
						limit: 100,
						order: [['elo', 'DESC'], ['winrate', 'DESC']],
						attributes: ['elo', 'winrate', 'mode_id', 'server_id'],
						include: [
							{
								model: Models.Users,
								as: 'user',
								attributes: ['id', 'username', 'color_pseudo', 'profil_picture'],
								where: {
									platform_id: platform
								},
								include: [
									{
										model: Models.Platforms,
										as: 'platform',
										attributes: ['name']
									},
									{
										model: Models.Countries,
										as: 'country',
										attributes: ['id', 'alpha_code']
									}
								]
							},
							{
								model: Models.Servers,
								as: 'server',
								attributes: ['name']
							}
						]
					})
				cache[server + '-' + platform + '-' + mode] = { date: Date.now(), data: leaderboard }
				if (Validate.isEmpty(leaderboard))
					return res.send(leaderboard)
				let listChallenger = await Ranking.listChallenger(server, mode, id_season)
				for (let i = 0; i < leaderboard.length; i++) {
					let image = leaderboard[i].user.profil_picture.split('.')
					if (leaderboard[i].elo >= process.env.MASTER)
						leaderboard[i] = await { ...leaderboard[i].dataValues, isChallenger: await Ranking.isChallenger(listChallenger, leaderboard[i].user.id), isSub: await Sub.isSub(leaderboard[i].user.id) }
					else
						leaderboard[i] = await { ...leaderboard[i].dataValues, isChallenger: false, isSub: await Sub.isSub(leaderboard[i].user.id) }
					leaderboard[i].user.profil_picture = await { path: image[0], type: image[1] }
				}
				cache[server + '-' + platform + '-' + mode] = { date: Date.now(), data: leaderboard }
				res.send(leaderboard)
			}
			else if (server == 0 && platform > 0 && (mode >= 1 && mode <= 2)) // Leaderboard filtre platform
			{
				let leaderboard = await Models.Seasons_scores.findAll(
					{
						where: {
							season_id: id_season,
							mode_id: mode
						},
						limit: 100,
						order: [['elo', 'DESC'], ['winrate', 'DESC']],
						attributes: ['elo', 'winrate', 'mode_id', 'server_id'],
						include: [
							{
								model: Models.Users,
								as: 'user',
								attributes: ['id', 'username', 'color_pseudo', 'profil_picture'],
								where: {
									platform_id: platform
								},
								include: [
									{
										model: Models.Platforms,
										as: 'platform',
										attributes: ['name']
									},
									{
										model: Models.Countries,
										as: 'country',
										attributes: ['id', 'alpha_code']
									}
								]
							},
							{
								model: Models.Servers,
								as: 'server',
								attributes: ['id', 'name']
							}
						]
					})
				cache[server + '-' + platform + '-' + mode] = { date: Date.now(), data: leaderboard }
				if (Validate.isEmpty(leaderboard))
					return res.send(leaderboard)
				let listChallenger = await Ranking.listChallenger(server, mode, id_season)
				for (let i = 0; i < leaderboard.length; i++) {
					let image = leaderboard[i].user.profil_picture.split('.')
					if (leaderboard[i].elo >= process.env.MASTER)
						leaderboard[i] = await { ...leaderboard[i].dataValues, isChallenger: await Ranking.isChallenger(listChallenger, leaderboard[i].user.id) }
					else
						leaderboard[i] = await { ...leaderboard[i].dataValues, isChallenger: false, isSub: await Sub.isSub(leaderboard[i].user.id) }
					leaderboard[i].user.profil_picture = await { path: image[0], type: image[1], isSub: await Sub.isSub(leaderboard[i].user.id) }
				}
				cache[server + '-' + platform + '-' + mode] = { date: Date.now(), data: leaderboard }
				res.send(leaderboard)
			}
			else if (server > 0 && platform == 0 && (mode >= 1 && mode <= 2)) //Leaderboard filtre server
			{
				let leaderboard = await Models.Seasons_scores.findAll(
					{
						where: {
							season_id: id_season,
							mode_id: mode,
							server_id: server
						},
						limit: 100,
						order: [['elo', 'DESC'], ['winrate', 'DESC']],
						attributes: ['elo', 'winrate', 'mode_id', 'server_id'],
						include: [
							{
								model: Models.Users,
								as: 'user',
								attributes: ['id', 'username', 'color_pseudo', 'profil_picture'],
								include: [
									{
										model: Models.Platforms,
										as: 'platform',
										attributes: ['name']
									},
									{
										model: Models.Countries,
										as: 'country',
										attributes: ['id', 'alpha_code']
									}
								]
							},
							{
								model: Models.Servers,
								as: 'server',
								attributes: ['name']
							}
						]
					})
				cache[server + '-' + platform + '-' + mode] = { date: Date.now(), data: leaderboard }
				if (Validate.isEmpty(leaderboard))
					return res.send(leaderboard)
				let listChallenger = await Ranking.listChallenger(server, mode, id_season)
				for (let i = 0; i < leaderboard.length; i++) {
					let image = leaderboard[i].user.profil_picture.split('.')
					if (leaderboard[i].elo >= process.env.MASTER)
						leaderboard[i] = await { ...leaderboard[i].dataValues, isChallenger: await Ranking.isChallenger(listChallenger, leaderboard[i].user.id), isSub: await Sub.isSub(leaderboard[i].user.id) }
					else
						leaderboard[i] = await { ...leaderboard[i].dataValues, isChallenger: false, isSub: await Sub.isSub(leaderboard[i].user.id) }
					leaderboard[i].user.profil_picture = await { path: image[0], type: image[1] }
				}
				cache[server + '-' + platform + '-' + mode] = { date: Date.now(), data: leaderboard }
				res.send(leaderboard)
			}
			else // Aucun filtre
			{
				let leaderboard = await Models.Seasons_scores.findAll(
					{
						where: {
							season_id: id_season,
							mode_id: mode
						},
						limit: 100,
						order: [['elo', 'DESC'], ['winrate', 'DESC']],
						attributes: ['elo', 'winrate', 'mode_id', 'server_id'],
						include: [
							{
								model: Models.Users,
								as: 'user',
								attributes: ['id', 'username', 'color_pseudo', 'profil_picture'],
								include: [
									{
										model: Models.Platforms,
										as: 'platform',
										attributes: ['name']
									},
									{
										model: Models.Countries,
										as: 'country',
										attributes: ['id', 'alpha_code']
									}
								]
							},
							{
								model: Models.Servers,
								as: 'server',
								attributes: ['id', 'name']
							}
						]
					})
				cache[server + '-' + platform + '-' + mode] = { date: Date.now(), data: leaderboard }
				if (Validate.isEmpty(leaderboard))
					return res.send(leaderboard)
				let listChallenger = await Ranking.listChallenger(0, mode, id_season)
				for (let i = 0; i < leaderboard.length; i++) {
					let image = leaderboard[i].user.profil_picture.split('.')
					if (leaderboard[i].elo >= process.env.MASTER)
						leaderboard[i] = await { ...leaderboard[i].dataValues, isChallenger: await Ranking.isChallenger(listChallenger, leaderboard[i].user.id), isSub: await Sub.isSub(leaderboard[i].user.id) }
					else
						leaderboard[i] = await { ...leaderboard[i].dataValues, isChallenger: false, isSub: await Sub.isSub(leaderboard[i].user.id) }
					leaderboard[i].user.profil_picture = await { path: image[0], type: image[1] }
				}
				cache[server + '-' + platform + '-' + mode] = { date: Date.now(), data: leaderboard }
				res.send(leaderboard)
			}
		}
		else
			res.send('0')
	} catch (e) {
		Log("ROUTE leaderboard :  -> " + e)
		res.send('500')
	}
})

module.exports = Router
