'user strict'
const Express = require('express'),
			Router = Express.Router(),
			Fs = require('fs'),
			Util = require('util'),
			Jwt = require('jsonwebtoken'),
			Validate = require("validate.js"),
			Log = require('log-to-file'),
			Bcrypt = require('bcrypt'),
			SizeOf = require('image-size'),
			Sharp = require("sharp"),
			Base64ImageToFile = require('base64image-to-file'),
			GifEncoder = require('gif-encoder'),
			GifFrames = require('gif-frames'),
			IsGif = require('is-gif'),
			IsPng = require('is-png'),
			IsJpg = require('is-jpg')

// Database Utils
const Sequelize = require('sequelize'),
			Op = Sequelize.Op,
			Models = require('../database/models')

// Utils
const SaltRounds = 8,
			Lib = require('../lib/lib'),
			Token = require('../models/token'),
			Email = require('../models/email'),
			Sub = require('../models/subscribtions'),
			Season = require('../models/seasons'),
			Achievements = require('../models/achievements'),
			SocialNetwork = require('../models/social_networks'),
			Domains = require('disposable-email-domains'),
			Wildcards = require('disposable-email-domains/wildcard.json'),
			Ranking = require('../models/ranking');

// GET

Router.get('/:id', async (req, res) => {
	try {
		let { id } = req.params
		id = Number(id)
		if (Validate.isEmpty(id) || !Validate.isDefined(id) || id == undefined || !Number.isInteger(id))
			return res.send('500')
		const { token } = req.headers
		const idSeason = await Season.getCurrentSeasonId()
		const isSub = await Sub.isSub(id)
		let seasonScores = []
		let user = await Models.Users.findOne(
			{
				where: { id: id },
				attributes: ['id', 'username', 'color_pseudo', 'profil_picture', 'sponsorship_code', 'connection_status', 'connection_time', 'epic_id'],
				include: [
					{
						model: Models.Countries,
						as: 'country',
						attributes: ['id', 'alpha_code', 'name']
					},
					{
						model: Models.Servers,
						as: 'server',
						attributes: ['id', 'alpha_code', 'name']
					},
					{
						model: Models.Platforms,
						as: 'platform',
						attributes: ['id', 'alpha_code', 'name']
					},
					{
						model: Models.Achievements,
						as: 'achievement',
						attributes: ['name_fr', 'name_en', 'description_fr', 'description_en', 'points_goal', 'path_picture'],
						through: {
							attributes: ['is_notified']
						},
						include: [
							{
								model: Models.Ranks,
								as: 'rank_achievement',
								attributes: ['name']
							}
						]
					},
					{
						model: Models.Social_networks,
						as: 'socialNetwork',
						attributes: ['name'],
						through: {
							attributes: ['link']
						}
					},
					{
						model: Models.Roles,
						as: 'roles',
						attributes: ['name'],
						through: {
							attributes: []
						}
					}
				]
			})
		if (Validate.isEmpty(user))
			return res.send('500')
		else {
			if (user.dataValues.server != null) {
				seasonScores = await Models.Seasons_scores.findAll(
					{
						where: {
							user_id: id,
							server_id: user.dataValues.server.id,
							season_id: idSeason
						},
						attributes: ['elo', 'winrate'],
						include: [
							{
								model: Models.Modes,
								as: 'mode',
								attributes: ['id', 'name']
							},
							{
								model: Models.Servers,
								as: 'server',
								attributes: ['id', 'name']
							},
							{
								model: Models.Seasons,
								as: 'seasons',
								attributes: ['id', 'chapter', 'season'],
								where: {
									isActive: true
								}
							}
						]
					})
			}

			let games = await Models.Games_1v1_histories.findAll(
				{
					where: {
						season_id: idSeason,
						[Op.or]: [{ player_a_id: id }, { player_b_id: id }]
					},
					limit: 10,
					order: [['createdAt', 'DESC']],
					attributes: ['winner_id', 'score_player_a', 'score_player_b', 'createdAt'],
					include: [
						{
							model: Models.Seasons,
							as: 'season',
							attributes: ['id', 'chapter', 'season'],
						},
						{
							model: Models.Modes,
							as: 'mode',
							attributes: ['id', 'name']
						}
					]
				})

			await Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				if ((!err && decoded.id == id) || (!err && decoded.roles.indexOf('admin') >= 0)) {
					await Achievements.majAchievements(id)
					let data = await Models.Users.findOne({ where: { id: id }, attributes: ['email', 'password'] })
					user.dataValues = Validate.isEmpty(data.password) ? { ...user.dataValues, email: data.email, isSetPassword: false } : { ...user.dataValues, email: data.email, isSetPassword: true }
				}
			})
			let image = user.dataValues.profil_picture.split('.')
			user.dataValues.profil_picture = await { path: image[0], type: image[1] }

			let isChallengerBuildfight = false
			let isChallengerBoxfight1v1 = false
			if (user.second_form == true) {
				for (let i = 0; i < seasonScores.length; i++) {
					if (seasonScores[i].dataValues.server.id == user.dataValues.server.id &&
						seasonScores[i].dataValues.mode.id == 1 &&
						seasonScores[i].dataValues.elo >= process.env.MASTER) {
						let listChallengerBf = await Ranking.listChallenger(user.dataValues.server.id, 1, idSeason)
						isChallengerBuildfight = await Ranking.isChallenger(listChallengerBf, id)
					}
					else if (seasonScores[i].dataValues.server.id == user.dataValues.server.id &&
						seasonScores[i].dataValues.mode.id == 2 &&
						seasonScores[i].dataValues.elo >= process.env.MASTER) {
						let listChallengerBxF1v1 = await Ranking.listChallenger(user.dataValues.server.id, 2, idSeason)
						isChallengerBoxfight1v1 = await Ranking.isChallenger(listChallengerBxF1v1, id)
					}
				}
			}
			res.send({ user, seasonScores, games, isSub, isChallengerBuildfight, isChallengerBoxfight1v1 })
		}
	} catch (e) {
		Log("ROUTE /users/:id :  -> " + e)
		res.send('500')
	}
})

Router.post('/all', async (req, res) => {


	try {
		const { token } = req.headers

		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
			try {

				if (decoded.roles.indexOf('admin') >= 0) {
					let user = await Models.Users.findAll(
						{
							limit: 6000,
							where: { server_id: 1 },
							attributes: ['email'],
						})
					return res.send(user)
				}
				else
					res.send(201)
			} catch (e) {
				Log("ROUTE /users/all :  -> " + e)
				res.send(202)
			}
		})
	}
	catch {
		res.send(405)
	}
})


Router.get('/confirm-email/:token', async (req, res) => {
	try {
		let { token } = req.params
		if (!Validate.isEmpty(token) && Validate.isDefined(token)) {
			const user = await Models.Tokens.findOne({ where: { token: token }, attributes: ['user_id', 'token', 'data'] })

			if (Validate.isEmpty(user))
				res.redirect(process.env.DOMAIN_CLIENT)
			else {
				let ret = await Models.Users.update({ email: user.data }, { where: { id: user.user_id } })

				if (ret) {
					await Models.Tokens.destroy({ where: { user_id: user.user_id, type: 'email' } })
					res.redirect(process.env.DOMAIN_CLIENT)
				}
				else {
					Log("Route update-user/confirm-email - update func - User id : " + user.user_id + " token = " + token)
					res.writeHead(302, { Location: process.env.DOMAIN_CLIENT + '/login&error=authentificationRejected' })
				}
			}
		}
		else
			res.send('500')
	} catch (e) {
		Log("ROUTE update-user/confirm-email :  -> " + e)
		res.send('500')
	}
})

Router.get('/emotes-user/:id', async (req, res) => // Emote appartenant a l'user
{
	try {
		let { token } = req.headers
		let { id } = req.params
		let emotes_premium = []

		if (Validate.isEmpty(id))
			return res.send('500')
		let isSub = await Sub.isSub(id)
		let emotes = await Models.Users.findOne(
			{
				where: {
					id: id
				},
				attributes: [],
				include: [
					{
						model: Models.Items,
						as: 'item',
						through: {
							attributes: []
						}
					}
				]
			})
		if (isSub) {
			emotes_premium = await Models.Items.findAll({
				where: {
					premium_only: true
				}
			})
		}
		res.send({ emotes, emotes_premium })
	} catch (e) {
		Log("ROUTE /users/emotes-user/:id :  -> " + e)
		res.send('500')
	}
})

Router.get('/wallet/:id', async (req, res) => {
	try {
		let token = req.headers.token
		let { id } = req.params
		if (Validate.isDefined(id) && !Validate.isEmpty(id) && !Validate.isEmpty(token) && !Validate.isEmpty(token)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
						let ret = await Models.Users.findOne(
							{
								where: {
									id: id
								},
								attributes: ['wallet']
							})
						res.send(ret)
					}
					else
						res.send('42')
				} catch (e) {
					Log("Route /users/wallet/:id -> L'user " + decoded.id + " n'a pas les droits pour faire cette requête. Different d'admin ou token et id different")
					res.send('500')
				}
			})
		}
		else {
			res.send('500')
		}
	}
	catch (e) {
		Log("ROUTE /users/platform -> " + e)
		res.send('500')
	}
})

Router.get('/premium-until/:id', async (req, res) => {
	try {
		let token = req.headers.token
		let { id } = req.params
		if (Validate.isDefined(id) && !Validate.isEmpty(id) && !Validate.isEmpty(token) && !Validate.isEmpty(token)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						return res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
						let ret = await Models.Subscriptions.findAll(
							{
								where: {
									user_id: id
								},
								limit: 1,
								order: [['end_date', 'DESC']],
								attributes: ['end_date']
							})
						res.send(ret)
					}
					else
						return res.send('42')
				} catch (e) {
					Log("Route /users/premium-until")
					res.send('500')
				}
			})
		}
		else {
			res.send('500')
		}
	}
	catch (e) {
		Log("ROUTE /users/platform -> " + e)
		res.send('500')
	}
})

// UPDATE

Router.put('/profil-picture', async (req, res) => {
	try {
		let { picture } = req.files
		let { token } = req.headers
		let pathDirectory = __dirname + '/../public/img/profile-pictures'
		if (Validate.isDefined(picture) && !Validate.isEmpty(picture)) {
			await Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else {
						let token = Token.generateToken(4)
						if (IsGif(picture.data)) {
							if (await Sub.isSub(decoded.id)) {
								GifFrames({ url: picture.data, frames: 'all' })
									.then(async (frameData) => {
										let user = await Models.Users.findOne({
											where: { id: decoded.id },
											attributes: ['profil_picture']
										})
										let imageUser = user.dataValues.profil_picture.split('.')
										let image = "data:image/gif;base64," + picture.data.toString('base64')

										if (imageUser[0] != 'PP-1' && imageUser[0] != 'PP-1'
											&& imageUser[0] != 'PP-2' && imageUser[0] != 'PP-2'
											&& imageUser[0] != 'PP-3' && imageUser[0] != 'PP-3'
											&& imageUser[0] != 'PP-4' && imageUser[0] != 'PP-4'
											&& imageUser[0] != 'PP-5' && imageUser[0] != 'PP-5') {
											if (Fs.existsSync(pathDirectory + "/" + user.profil_picture))
												Fs.unlinkSync(pathDirectory + "/" + user.profil_picture)
											if (Fs.existsSync(pathDirectory + "/" + imageUser[0] + "-small.png"))
												Fs.unlinkSync(pathDirectory + "/" + imageUser[0] + "-small.png")
											if (Fs.existsSync(pathDirectory + "/" + imageUser[0] + "-medium.png"))
												Fs.unlinkSync(pathDirectory + "/" + imageUser[0] + "-medium.png")
										}
										Base64ImageToFile(image, pathDirectory, String(decoded.id + token),
											async (err) => {
												if (err)
													res.send('500')
												else {
													let name = String(decoded.id + token + '.gif')
													await Models.Users.update({ profil_picture: name }, { where: { id: decoded.id } })
													res.send('1')
												}
											}
										)
									})
									.catch(err => res.send('500'))
							}
							else
								res.send('2')
						}
						else if (IsPng(picture.data) || IsJpg(picture.data)) {
							Sharp(picture.data)
								.resize(150, 150, {
									fit: Sharp.fit.cover
								})
								.toFormat('png')
								.toFile(pathDirectory + '/' + String(decoded.id + token) + '-small.png', async (err) => {
									if (err)
										res.send('500')
									else {
										Sharp(picture.data)
											.resize(600, 600, {
												fit: Sharp.fit.cover
											})
											.toFormat('png')
											.toFile(pathDirectory + '/' + String(decoded.id + token) + '-medium.png', async (err) => {
												if (err)
													res.send('500')
												else {
													let user = await Models.Users.findOne({
														where: { id: decoded.id },
														attributes: ['profil_picture']
													})
													let imageUser = user.dataValues.profil_picture.split('.')
													let image = "data:image/gif;base64," + picture.data.toString('base64')

													if (imageUser[0] != 'PP-1' && imageUser[0] != 'PP-1'
														&& imageUser[0] != 'PP-2' && imageUser[0] != 'PP-2'
														&& imageUser[0] != 'PP-3' && imageUser[0] != 'PP-3'
														&& imageUser[0] != 'PP-4' && imageUser[0] != 'PP-4'
														&& imageUser[0] != 'PP-5' && imageUser[0] != 'PP-5') {
														if (Fs.existsSync(pathDirectory + "/" + user.profil_picture))
															Fs.unlinkSync(pathDirectory + "/" + user.profil_picture)
														if (Fs.existsSync(pathDirectory + "/" + imageUser[0] + "-small.png"))
															Fs.unlinkSync(pathDirectory + "/" + imageUser[0] + "-small.png")
														if (Fs.existsSync(pathDirectory + "/" + imageUser[0] + "-medium.png"))
															Fs.unlinkSync(pathDirectory + "/" + imageUser[0] + "-medium.png")
													}
													let name = String(decoded.id + token + '.png')
													await Models.Users.update({ profil_picture: name }, { where: { id: decoded.id } })
													res.send('1')
												}
											})
									}
								})
						}
						else
							res.send('500')
					}
				} catch (e) {
					Log("Route Maj picture user, token erroné -> " + e)
					res.send('500')
				}
			})
		}
	}
	catch (e) {
		Log("ROUTE /profil-picture -> " + e)
		res.send('500')
	}
})

Router.put('/reset-elo', async (req, res) => {
	try {
		let { id, server_id, mode_id, elo } = req.body
		let token = req.headers.token


		if (!Validate.isEmpty(elo) && !Validate.isEmpty(id) && !Validate.isEmpty(mode_id) && !Validate.isEmpty(server_id)) {
			const id_season = await Season.getCurrentSeasonId()
			Log("SEASON =====" + id_season)
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0) {
						await Models.Seasons_scores.update({ elo: elo }, { where: { user_id: id, mode_id: mode_id, season_id: id_season, server_id: server_id } })
							.then(async () => {
								if (elo == 1099)
									await Models.Games_1v1_histories.destroy(
										{
											where: {
												[Op.or]: [{ player_a_id: id }, { player_b_id: id }]
											}
										})
								res.send('1')
							})
							.catch(e => {
								Log("ROUTE /users/reset-elo - decoded id : " + decoded.id + "  -> " + e)
								res.send('500')
							})

					}
					else
						res.send('42')
				} catch (e) {
					Log("Route /users/reset-elo token erroné -> " + e)
					res.send('500')
				}

			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/reset-elo -> " + e)
		res.send('500')
	}
})

Router.put('/wipe-elo', async (req, res) => {
	try {
		let { elo } = req.body
		let token = req.headers.token


		if (!Validate.isEmpty(elo)) {
			const id_season = await Season.getCurrentSeasonId()
			Log("SEASON =====" + id_season)
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0) {
						await Models.Seasons_scores.update({ elo: elo, winrate: 100.00 }, { where: { season_id: id_season } })
							.then(response => {
								Models.Games_1v1_histories.destroy(
									{
										where: {
											season_id: id_season,
										}
									})
								res.send('1')
							})
							.catch(e => {
								Log("ROUTE /users/wipe-elo - decoded id : " + decoded.id + "  -> " + e)
								res.send('500')
							})
					}
					else
						res.send('42')
				} catch (e) {
					Log("Route /users/wipe-elo token erroné -> " + e)
					res.send('500')
				}

			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/wipe-elo -> " + e)
		res.send('500')
	}
})


Router.put('/username', async (req, res) => {
	try {
		let { username, id } = req.body
		let token = req.headers.token

		if (!Validate.isEmpty(username) && !Validate.isEmpty(id)) {
			username = await username.toLowerCase()
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
						await Models.Users.update({ username: username }, { where: { id: id } })
							.then(response => res.send('1'))
							.catch(e => {
								Log("ROUTE /users/username - decoded id : " + decoded.id + "  -> " + e)
								res.send('500')
							})
					}
					else
						res.send('42')
				} catch (e) {
					Log("Route /users/username token erroné -> " + e)
					res.send('500')
				}

			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/username -> " + e)
		res.send('500')
	}
})

Router.put('/email', async (req, res) => {
	try {
		let { email, id } = req.body
		let token = req.headers.token

		if (!Validate.isEmpty(email) && !Validate.isEmpty(id)) {
			email = await email.toLowerCase()
			if (!Domains.includes(email.substring(email.lastIndexOf("@") + 1)) && !Wildcards.includes(email.substring(email.lastIndexOf("@") + 1))) {
				Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
					try {
						if (err)
							res.send('42')
						else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
							try {
								let user = await Models.Users.findOne({ where: { id: decoded.id } })
								let randToken = await Token.insertToken(id, email, 'email')
								if (Email.confirmChangingMail(email, randToken.token, user.language))
									res.send('1')
								else {
									Log("ROUTE /users/email - user id :" + decoded.id + "  -> Probleme d'envoie email")
									res.send('500')
								}
							} catch (e) {
								Log("ROUTE /users/email - user id :" + decoded.id + "  -> " + e)
								res.send('500')
							}
						}
						else
							res.send('42')
					} catch (e) {
						Log("ROUTE /users/email -> " + e)
						res.send('500')
					}
				})
			}
			else
				res.send('3')
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/email -> " + e)
		res.send('500')
	}
})

Router.put('/country', async (req, res) => {
	try {
		let { country, id } = req.body
		let token = req.headers.token

		if (!Validate.isEmpty(country) && !Validate.isEmpty(id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
						let ret = await Models.Countries.findOne({ where: { alpha_code: country }, attributes: ['id'] })
						if (ret) {
							await Models.Users.update({ country_id: ret.id }, { where: { id: id } })
							res.send('1')
						}
						else
							res.send('500')
					}
					else
						res.send('42')
				} catch (e) {
					Log("Route /users/country -> " + e)
					res.send('500')
				}

			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/country -> " + e)
		res.send('500')
	}
})

Router.put('/server', async (req, res) => {
	try {
		let { server, id } = req.body
		let token = req.headers.token

		if (!Validate.isEmpty(server) && !Validate.isEmpty(id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
						let ret = await Models.Servers.findOne({ where: { alpha_code: server }, attributes: ['id'] })
						if (ret) {
							await Models.Users.update({ server_id: ret.id }, { where: { id: id } })
							await Models.Seasons_scores.findOrCreate(
								{
									where: { user_id: decoded.id, mode_id: 1, server_id: ret.id, season_id: await Season.getCurrentSeasonId() }
								})
							await Models.Seasons_scores.findOrCreate(
								{
									where: { user_id: decoded.id, mode_id: 2, server_id: ret.id, season_id: await Season.getCurrentSeasonId() }
								})
							res.send('1')
						}
						else
							res.send('500')
					}
					else
						res.send('42')
				} catch (e) {
					Log("Route /users/servers -> " + e)
					res.send('500')
				}
			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/server -> " + e)
		res.send('500')
	}
})

Router.put('/language', async (req, res) => {
	try {
		let { language, id } = req.body
		let token = req.headers.token

		if (!Validate.isEmpty(language) && !Validate.isEmpty(id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				if (err)
					res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
					let ret = await Models.Languages.findOne({ where: { alpha_code: language }, attributes: ['id'] })
					if (ret) {
						await Models.Users.update({ language_id: ret.id }, { where: { id: id } })
						res.send('1')
					}
					else
						res.send('500')
				}
				else
					res.send('42')
			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/language -> " + e)
		res.send('500')
	}
})

Router.put('/platform', async (req, res) => {
	try {
		let { platform, id } = req.body
		let token = req.headers.token

		if (!Validate.isEmpty(platform) && !Validate.isEmpty(id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
						let ret = await Models.Platforms.findOne({ where: { alpha_code: platform }, attributes: ['id'] })
						if (ret) {
							await Models.Users.update({ platform_id: ret.id }, { where: { id: id } })
							res.send('1')
						}
						else
							res.send('500')
					}
					else
						res.send('42')
				} catch (e) {
					Log("ROUTE /users/platform -> " + e)
					res.send('500')
				}
			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/platform -> " + e)
		res.send('500')
	}
})

Router.put('/password', async (req, res) => {
	try {
		let { password, oldPassword } = req.body
		let token = req.headers.token

		if (!Validate.isEmpty(password) && Lib.isPassword(password)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else {
						let ret = await Models.Users.findOne({ where: { id: decoded.id }, attributes: ['password'] })

						if (!Validate.isEmpty(ret.password) && Validate.isDefined(oldPassword) && !Validate.isEmpty(oldPassword)) {
							let hash = await Bcrypt.compare(oldPassword, ret.password)
							if (hash) {
								Bcrypt.hash(password, SaltRounds, async (err, hash) => {
									if (err) {
										Log("Route /users/password : " + err)
										res.send('500')
									}
									else {
										await Models.Users.update({ password: hash }, { where: { id: decoded.id } })
											.then(response => res.send('1'))
											.catch(e => {
												if (e.name == 'SequelizeValidationError')
													res.send('500')
												else {
													Log("Route /users/password - User id : " + decoded.id + " -> " + e)
													res.send('500')
												}
											})
									}
								})
							}
							else
								res.send('500')
						}
						else {
							Bcrypt.hash(password, SaltRounds, async (err, hash) => {
								if (err) {
									Log("Route update password : " + err)
									res.send('500')
								}
								else {
									await Models.Users.update({ password: hash }, { where: { id: decoded.id } })
										.then(response => res.send('1'))
										.catch(e => {
											if (e.name == 'SequelizeValidationError')
												res.send('500')
											else {
												Log("Route /users/password - User id : " + decoded.id + " -> " + e)
												res.send('500')
											}
										})
								}
							})
						}
					}
				} catch (e) {
					Log("ROUTE /users/password -> " + e)
					res.send('500')
				}
			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/password -> " + e)
		res.send('500')
	}
})

Router.put('/connection-status', async (req, res) => {
	try {
		let token = req.headers.token

		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
			try {
				if (err)
					res.send('42')
				else {
					await Models.Users.update({ connection_status: new Date() }, { where: { id: decoded.id } })
					res.send('1')
				}
			} catch (e) {
				Log(" Route /users/connection-status -> " + e)
			}
		})
	}
	catch (e) {
		Log("ROUTE /users/connection-status -> " + e)
		res.send('500')
	}
})

Router.put('/social-network', async (req, res) => {
	try {
		const { token } = req.headers
		let { id, link, social_id } = req.body
		if (Validate.isDefined(id) && !Validate.isEmpty(id) && Validate.isDefined(link) && !Validate.isEmpty(link) && Validate.isDefined(social_id) && !Validate.isEmpty(social_id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
						if (social_id == 1)
							SocialNetwork.updateSocialNetworkUser(id, social_id, link.replace('https://twitter.com/', ''))
						else if (social_id == 2)
							SocialNetwork.updateSocialNetworkUser(id, social_id, link.replace('https://www.instagram.com/', ''))
						else if (social_id == 3)
							SocialNetwork.updateSocialNetworkUser(id, social_id, link.replace('https://www.twitch.tv/', ''))
						else
							SocialNetwork.updateSocialNetworkUser(id, social_id, link.replace('https://www.youtube.com/channel/', ''))
						res.send('1')
					}
					else
						res.send('42')
				} catch (e) {
					Log("Route /users/social-network -> " + e)
					res.send('500')
				}
			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/social-network -> " + e)
		res.send('500')
	}
})

Router.put('/message-chat-increment', async (req, res) => {
	try {
		let token = req.headers.token
		let { total, id } = req.body
		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
			try {
				if (err)
					res.send('42')
				else {
					if (decoded.roles.indexOf('bot') < 0 && decoded.roles.indexOf('admin') < 0)
						return res.send('42')
					await Models.Users.increment({ messages_chat: total }, { where: { id: id } })
					res.send('1')
				}
			} catch (e) {
				Log("ROUTE /users/message-chat-increment -> " + e)
				res.send('500')
			}
		})
	}
	catch (e) {
		Log("ROUTE /users/message-chat-increment -> " + e)
		res.send('500')
	}
})

Router.put('/color-pseudo', async (req, res) => {
	try {
		const { token } = req.headers
		let { id, color_pseudo } = req.body
		if (Validate.isDefined(id) && !Validate.isEmpty(id) && Validate.isDefined(color_pseudo) && !Validate.isEmpty(color_pseudo)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
						if (await Sub.isSub(decoded.id)) {
							await Models.Users.update(
								{ color_pseudo: color_pseudo },
								{ where: { id: id } }
							)
							return res.send('1')
						}
						else
							return res.send('500')
					}
					else
						res.send('42')
				} catch (e) {
					Log("Route /users/color_pseudo/:id -> " + e)
					res.send('500')
				}
			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE /users/color_pseudo/:id -> " + e)
		res.send('500')
	}
})

// DELETE

Router.delete('/social-network', async (req, res) => {
	try {
		const { token } = req.headers
		let { id, social_id } = req.body
		if (Validate.isDefined(id) && !Validate.isEmpty(id) && Validate.isDefined(social_id) && !Validate.isEmpty(social_id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						res.send('42')
					else if (decoded.roles.indexOf('admin') >= 0 || decoded.id == id) {
						await Models.User_social_networks.destroy({
							where: {
								id: decoded.id,
								social_network_id: social_id
							}
						})
						res.send('1')
					}
					else
						res.send('42')
				} catch (e) {
					Log("Route delete /users/social-network -> " + e)
					res.send('500')
				}
			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE delete /users/social-network -> " + e)
		res.send('500')
	}
})

Router.delete('/', async (req, res) => {
	try {
		const { token } = req.headers
		const { id, password } = req.body
		if (Validate.isDefined(id) && !Validate.isEmpty(id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				try {
					if (err)
						return res.send('42')
					else if (decoded.roles.indexOf('admin') < 0 && !Lib.isPassword(password))
						return res.send('2')
					else if (decoded.roles.indexOf('admin') < 0 && decoded.id != id)
						return res.send('3')
					let user = await Models.Users.findOne({
						where: {
							id: id
						},
						attributes: ['password'],
						raw: true
					})
					const match = await Bcrypt.compare(password, user.password)
					if (!match)
						return res.send('4')
					await Models.Users.update(
						{
							username: null,
							email: null,
							verified: false,
							password: null,
							facebook_id: null,
							twitter_id: null,
							google_id: null
						},
						{
							where: {
								id: id
							}
						}
					)
					await Models.User_social_networks.destroy({
						where: {
							user_id: id
						}
					})
					res.send('1')
				} catch (e) {
					Log("Route delete /users/ -> " + e)
					res.send('500')
				}
			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE delete /users/ -> " + e)
		res.send('500')
	}
})

module.exports = Router
