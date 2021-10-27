'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Validate = require("validate.js"),
			Log = require('log-to-file'),
			Fs = require('fs')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../database/models'),
			Op = Sequelize.Op

// Utils
const	Lib = require('../lib/lib'),
			SubM = require('../models/subscribtions'),
			SeasonM = require('../models/seasons'),
			GamesM = require('../models/games_1v1_histories')

const Platform = {
	'WINDOWS': 1,
	'MAC': 1,
	'PLAYSTATION': 2,
	'XBOX': 2,
	'IOS': 3,
	'ANDROID': 3,
	'SWITCH': 4
}

// GET

Router.get('/user-infos/:id/:modeId', async (req, res) =>
{
	try {
		let { token } = req.headers
		let { id, modeId } = req.params
		if (!Validate.isEmpty(token) && !Validate.isEmpty(id) && !Validate.isEmpty(modeId))
		{
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (err)
					res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0 || decoded.roles.indexOf('bot') >= 0)
				{
					const idSeason = await SeasonM.getCurrentSeasonId()
					const isSub = await SubM.isSub(id)
					let user = await Models.Users.findOne(
					{
						where: { id: id },
						attributes: ['id', 'username', 'profil_picture', 'color_pseudo', 'epic_id', 'second_form', 'platform_id'],
						include: [
							{
								model: Models.Countries,
								as: 'country',
								attributes: ['id', 'alpha_code', 'name']
							},
							{
								model: Models.Servers,
								as: 'server',
								attributes: ['id', 'name']
							},
							{
								model: Models.Kickeds,
								as: 'kicked',
								attributes: ['kicked_id', 'until', 'comment'],
								limit: 1,
								order: [ [ 'until', 'DESC' ] ],
								include: [
									{
										model: Models.Penalization_reasons,
										as: 'kick_reason',
										attributes: ['id', 'name_fr', 'name_en']
									}
								]
							},
							{
								model: Models.Banneds,
								as: 'banned',
								attributes: ['banned_id', 'until', 'comment'],
								limit: 1,
								order: [ [ 'until', 'DESC' ] ],
								include: [
									{
										model: Models.Penalization_reasons_bans,
										as: 'ban_reason',
										attributes: ['id', 'name_fr', 'name_en']
									}
								]
							}
						]
					})
					if (!Validate.isEmpty(user))
					{
						if (user.dataValues.second_form == false)
						{
							user.dataValues = { ...user.dataValues, seasonScore: false, isSub: isSub}
							let image = user.dataValues.profil_picture.split('.')
							user.dataValues.profil_picture = await { path: image[0], type: image[1] }
							return res.send(user)
						}
						else
						{
							try {
								let mode_id,
									season_score;

								if (modeId == 1 || modeId == 3)
								{
									season_score = await Models.Seasons_scores.findOrCreate(
									{
										where: { user_id: id, season_id: idSeason, mode_id: 1, server_id: user.server.id }
									})
									await Models.Seasons_scores.findOrCreate(
									{
										where: { user_id: id, season_id: idSeason, mode_id: 2, server_id: user.server.id }
									})
								}
								else
								{
									season_score = await Models.Seasons_scores.findOrCreate(
									{
										where: { user_id: id, season_id: idSeason, mode_id: 2, server_id: user.server.id }
									})
									await Models.Seasons_scores.findOrCreate(
									{
										where: { user_id: id, season_id: idSeason, mode_id: 1, server_id: user.server.id }
									})
								}
								user.dataValues = { ...user.dataValues, seasonScore: season_score, isSub: isSub}
								let image = user.dataValues.profil_picture.split('.')
								user.dataValues.profil_picture = await { path: image[0], type: image[1] }
								return res.send(user)
							} catch (e) {
								Log("ROUTE /bot/user-infos: " + e)
								res.send('500')
							}
						}
					}
					else
					{
						Log("Routes /bot/user-infos, id utilisateurs introuvable")
						res.send('500')
					}
				}
				else {
					Log("ROUTE /bot/user-infos - id: " + decoded.id)
					res.send('500')
				}
			})
		}
		else
		{
			Log("ROUTE /bot/user-infos : object empty or invalid")
			res.send('500')
		}
	} catch (e) {
		Log("ROUTE /bot/user-infos :  -> " + e)
		res.send('500')
	}
})

Router.get('/generate-token', async (req, res) =>
{
	try {
		let { token } = req.headers
		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
		{
			if (err)
				return res.send('42')
			else if (decoded.roles.indexOf('admin') >= 0 || decoded.roles.indexOf('bot') >= 0)
			{
				let privateKey = Fs.readFileSync(__dirname + '/../privateKeyJWT.pem', 'utf8')
				let token = Jwt.sign({
					"id": 0,
					"roles": 'bot'
				}, process.env.JWT_PRIVATE_KEY, { algorithm: 'HS256' })
				res.send(token)
			}
			else {
				Log("ROUTE /bot/generate-token - id: " + decoded.id)
				res.send('500')
			}
		})
	} catch (e) {
		Log("ROUTE /bot/generate-token :  -> " + e)
		res.send('500')
	}
})

// POST

Router.post('/insert-game-1v1', async (req, res) =>
{
	const { token } = req.headers
	const { id_player_a, id_player_b, winner_id, mode_id, server_id, elo_player_a, elo_player_b, score_player_a, score_player_b, epic_name_player_a, epic_name_player_b, platform_player_a, platform_player_b } = req.body
	try {
		if (!Validate.isEmpty(token) && Validate.isDefined(token) && mode_id < 5)
		{
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
			{
				if (err)
					res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0 || decoded.roles.indexOf('bot') >= 0)
				{
					if (!Validate.isEmpty(winner_id) && Validate.isDefined(winner_id) && winner_id != null)
					{
						let season_id = await SeasonM.getCurrentSeasonId()
						if (epic_name_player_a != null)
							await Models.Users.update({ username: epic_name_player_a },{ where: { id: id_player_a } })
						if (epic_name_player_b != null)
							await Models.Users.update({ username: epic_name_player_b },{ where: { id: id_player_b } })
						if (platform_player_a != null)
							await Models.Users.update({ platform_id: Platform[platform_player_a] },{ where: { id: id_player_a } })
						if (platform_player_b != null)
							await Models.Users.update({ platform_id: Platform[platform_player_b] },{ where: { id: id_player_b } })
						Models.Games_1v1_histories.create(
						{
							winner_id: winner_id,
							season_id: season_id,
							mode_id: mode_id,
							player_a_id: id_player_a,
							player_b_id: id_player_b,
							elo_player_a: elo_player_a,
							elo_player_b: elo_player_b,
							score_player_a: score_player_a,
							score_player_b: score_player_b,
							username_player_a: epic_name_player_a,
							username_player_b: epic_name_player_b
						})
						.then(async response =>
						{
							if (mode_id == 1 || mode_id == 2 && Validate.isDefined(winner_id)) // Ranked BF / BxF modes
							{
								// Rewards
								if (score_player_a != 0 || score_player_b != 0)
								{
									let rewardA = winner_id == id_player_a ? +score_player_a + +process.env.RANKED_PLAYED_REWARD + +process.env.RANKED_WIN_REWARD : +score_player_a + +process.env.RANKED_PLAYED_REWARD
									let rewardB = winner_id == id_player_b ? +score_player_b + +process.env.RANKED_PLAYED_REWARD + +process.env.RANKED_WIN_REWARD : +score_player_b + +process.env.RANKED_PLAYED_REWARD
									rewardA = await SubM.isSub(id_player_a) == true ? rewardA *= 2 : rewardA
									rewardB = await SubM.isSub(id_player_b) == true ? rewardB *= 2 : rewardB
									Models.Users.increment({ wallet: rewardA }, { where: { id: id_player_a }})
									Models.Users.increment({ wallet: rewardB }, { where: {id: id_player_b } })
								}
								// Seasons scores maj

								// PLAYER A
								let winrate_player_a = Lib.getWinRate(await GamesM.nbMatch1v1SeasonX(id_player_a, season_id, mode_id), await GamesM.nbWin1v1SeasonX(id_player_a, season_id, mode_id))
								await Models.Seasons_scores.update({ winrate: winrate_player_a, elo: elo_player_a }, { where: { user_id: id_player_a, mode_id: mode_id, season_id: season_id, server_id: server_id } })

								// PLAYER B
								let winrate_player_b = Lib.getWinRate(await GamesM.nbMatch1v1SeasonX(id_player_b, season_id, mode_id), await GamesM.nbWin1v1SeasonX(id_player_b, season_id, mode_id))
								Models.Seasons_scores.update({ winrate: winrate_player_b, elo: elo_player_b }, { where: { user_id: id_player_b, mode_id: mode_id, season_id: season_id, server_id: server_id } })
								res.send('1')
							}
							else if (mode_id == 3 || mode_id == 4 && Validate.isDefined(winner_id)) // Unranked BF / BxF modes
							{
								if (score_player_a == 0 && score_player_b == 0)
									return res.send('1')
								// Rewards
								let rewardA = +process.env.UNRANKED_PLAYED_REWARD
								let rewardB = +process.env.UNRANKED_PLAYED_REWARD
								rewardA = await SubM.isSub(id_player_a) == true ? rewardA *= 2 : rewardA
								rewardB = await SubM.isSub(id_player_b) == true ? rewardB *= 2 : rewardB
								Models.Users.increment({ wallet: rewardA }, { where: { id: id_player_a }})
								Models.Users.increment({ wallet: rewardB }, { where: { id: id_player_b } })
								return res.send('1')
							}
							else
								return res.send('1')
						})
						.catch(e =>
						{
							Log("ROUTE /bot/insert-game-1v1 Probleme insertion game:  -> " + e)
							res.send('500')
						})
					}
					else
						return res.send('1')
				}
				else {
					Log("ROUTE /bot/insert-game-1v1 Probleme role - id: " + decoded.id + " :  -> ACCES INTERDIT")
					res.send('500')
				}
			})
		}
		else
		{
			Log("ROUTE /bot/insert-game-1v1 -> token manquant ou mode id > 4")
			res.send('500')
		}
	} catch (e) {
		Log("ROUTE /bot/insert-game-1v1 :  -> " + e)
		res.send('500')
	}
})



module.exports = Router
