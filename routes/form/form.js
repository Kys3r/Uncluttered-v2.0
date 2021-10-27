'user strict'
const Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Validate = require("validate.js"),
			Log = require('log-to-file'),
			Bcrypt = require('bcrypt')

// Database Utils
const Sequelize = require('sequelize'),
			Models = require('../../database/models');

// Utils
const SaltRounds = 8,
			Lib = require('../../lib/lib'),
			Token = require('../../models/token'),
			Email = require('../../models/email'),
			SeasonsScores = require('../../models/seasons_scores'),
			Seasons = require('../../models/seasons'),
			Sanctions = require('../../models/sanctions'),
			UsersM = require('../../models/users')

// Platformes retourné par Fortnite
const Platform = {
	'WINDOWS': 1,
	'MAC': 1,
	'PLAYSTATION': 2,
	'PLAYSTATION_4': 2,
	'PLAYSTATION_5': 2,
	'XBOX': 2,
	'XBOX_ONE': 2,
	'XBOX_X': 2,
	'SWITCH': 4,
	'IOS': 3,
	'ANDROID': 3
}

// Routes

Router.put('/second-form', async (req, res) => {
	let { country, server, language, sponsorship_code } = req.body
	const token = req.headers.token
	if (Validate.isEmpty(token))
		res.send('42')
	else {
		try {
			if (!Validate.isEmpty(country) && !Validate.isEmpty(server) && !Validate.isEmpty(language)) {
				const countryVerif = await Models.Countries.findOne({ where: { alpha_code: country } })
				const serverVerif = await Models.Servers.findOne({ where: { alpha_code: server } })
				const languageVerif = await Models.Languages.findOne({ where: { alpha_code: language } })
				if (!Validate.isEmpty(countryVerif) && !Validate.isEmpty(serverVerif) && !Validate.isEmpty(languageVerif)) {
					Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
						if (err)
							res.send('42')
						else {
							if (!Validate.isEmpty(sponsorship_code)) {
								let sponsor = await Models.Users.findOne(
									{
										where: {
											sponsorship_code: sponsorship_code
										},
										raw: true,
										attributes: ['id']
									})
								if (Validate.isEmpty(sponsor))
									return res.send('3')
								else {
									Models.Sponsorships.create(
										{
											sponsor_id: sponsor.id,
											sponsorised_id: decoded.id,
											sponsor_gift: process.env.WALLET_SPONSOR_GIFT,
											sponsorised_gift: process.env.WALLET_SPONSORISED_GIFT
										})
									let nbAlreadySponsored = await Models.Sponsorships.findAll({
										where: {
											sponsor_id: sponsor.id
										},
										attributes: [
											[Sequelize.fn('sum', Sequelize.col('sponsor_gift')), 'total_gift'],
										],
										raw: true
									})
									if (nbAlreadySponsored[0].total_gift < process.env.LIMIT_SPONSOR_GIFT)
										Models.Users.increment({ wallet: process.env.WALLET_SPONSOR_GIFT }, { where: { id: sponsor.id } })
									Models.Users.increment({ wallet: process.env.WALLET_SPONSORISED_GIFT }, { where: { id: decoded.id } })
								}
							}
							let user = await Models.Users.findOne({ where: { id: decoded.id } })
							if (!Validate.isEmpty(user) && user.second_form == false) {
								if (user.epic_id != null) {
									Models.Users.update(
										{
											country_id: countryVerif.id,
											server_id: serverVerif.id,
											language_id: languageVerif.id,
											second_form: true
										},
										{ returning: true, where: { id: user.id } }
									)
										.then(async response => {
											Models.Seasons_scores.findOrCreate(
												{
													where: {
														user_id: user.id,
														mode_id: 1,
														server_id: serverVerif.id,
														season_id: await Seasons.getCurrentSeasonId()
													},
												})
											Models.Seasons_scores.findOrCreate(
												{
													where: {
														user_id: user.id,
														mode_id: 2,
														server_id: serverVerif.id,
														season_id: await Seasons.getCurrentSeasonId()
													},
												})
											res.send('1')
										})
										.catch(err => {
											Log("Route /second-form/ user = " + user.id + " erreur ->  " + err)
											res.send('0')
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
					res.send('500')
			}
			else
				res.send('500')
		} catch (e) {
			Log("ROUTE second-form :  -> " + e)
			res.send('500')
		}
	}
})

// Si le mail de confirmation n'a pas été envoyé

Router.post('/recheck-email', async (req, res) => {
	let { email } = req.body
	try {
		if (Validate.isDefined(email)) {
			let user = await Models.Users.findOne({ where: { email: email } })

			if (Validate.isDefined(user) && user.verified == false) {
				let ret = await Token.insertToken(user.id, email, 'email')
				let language = Validate.isDefined(user.language) ? user.language : 'en'
				Validate.isDefined(ret) == true ? (Email.confirmAccountMail(email, ret.token, language) == true ? res.send('1') : res.send('500')) : res.send('500')
			}
			else
				res.send('2')
		}
		else
			res.send('0')
	} catch (e) {
		Log("ROUTE recheck-email -> " + e)
		res.send('500')
	}
})

Router.post('/reset-password', async (req, res) => {
	let { email } = req.body
	try {
		if (Validate.isDefined(email)) {
			let user = await Models.Users.findOne({ where: { email: email } })

			if (Validate.isDefined(user)) {
				let ret = await Token.insertToken(user.id, email, 'password')
				let language = Validate.isDefined(user.language) ? user.language : 'en'
				Validate.isDefined(ret) == true ? (Email.resetPasswordMail(email, ret.token, language) == true ? res.send('1') : res.send('500')) : res.send('500')
			}
			else
				res.send('2')
		}
		else
			res.send('0')
	} catch (e) {
		Log("ROUTE reset-password -> " + e)
		res.send('500')
	}
})

Router.put('/new-password', async (req, res) => {
	try {
		let { password, token } = req.body

		if (!Validate.isEmpty(password) && Lib.isPassword(password) && !Validate.isEmpty(token)) {
			let ret = await Models.Tokens.findOne({ where: { token: token } })
			if (Validate.isDefined(ret))
				Bcrypt.hash(password, SaltRounds, (err, hash) => {
					if (err) {
						Log("Route new-password - probleme password hash -> " + e)
						res.send('500')
					}
					else {
						Models.Tokens.destroy({ where: { data: ret.dataValues.data, type: 'password' } })
						Models.Users.update({ password: hash }, { where: { email: ret.dataValues.data } })
							.then(response => res.send('1'))
							.catch(e => {
								if (e.name == 'SequelizeValidationError')
									res.send('0')
								else {
									Log("Route /update/password - User id : " + decoded.id + " -> " + e)
									res.send('500')
								}
							})
					}
				})
			else
				res.send('2')
		}
		else
			res.send('0')
	}
	catch {
		Log("ROUTE /update/password -> " + e)
		res.send('500')
	}
})

Router.put('/bot-info-user', async (req, res) => {
	let { id, username, platform, epic_id } = req.body
	let { token } = req.headers
	try {
		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
			try {
				if (err)
					return res.send('42')
				else if (decoded.roles.indexOf('bot') >= 0 && !Validate.isEmpty(id) && Validate.isDefined(id) && !Validate.isEmpty(platform) && Validate.isDefined(platform) && !Validate.isEmpty(epic_id) && Validate.isDefined(epic_id) && !Validate.isEmpty(username) && Validate.isDefined(username)) {
					try {
						if (!(platform in Platform))
							platform = 'WINDOWS'
						/*
						let banned = await Sanctions.isBannedEpic(epic_id)
						if (banned)
							return res.send('3')
						let isOwnEpicId = await UsersM.isOwnEpicId(id, epic_id)
						let epicIdExist = await UsersM.epicAlreadyExist(epic_id)
						if (isOwnEpicId == false && epicIdExist == true)
							return res.send('2')
						*/
						let sponsorship_code = "bfc-" + +id + String(Token.generateToken(4))
						await Models.Users.update(
							{
								username: username,
								platform_id: Platform[platform],
								epic_id: epic_id,
								sponsorship_code: sponsorship_code
							},
							{
								where: { id: id }
							})
						res.send('1')

					} catch (e) {
						Log("ROUTE /form/bot-info-user - user id -> " + e)
						res.send('500')
					}
				}
				else
					res.send('42')
			} catch (e) {
				Log("ROUTE /form/bot-info-user -> " + e)
				res.send('500')
			}
		})
	} catch (e) {
		Log("ROUTE /form/bot-info-user - user -> " + e)
		res.send('500')
	}
})

Router.put('/epic', async (req, res) => {
	let { epic_id, id } = req.body
	let { token } = req.headers
	try {
		Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
			try {
				if (err)
					return res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0 && !Validate.isEmpty(epic_id) && Validate.isDefined(epic_id) && !Validate.isEmpty(id) && Validate.isDefined(id)) {
					try {
						await Models.Users.update(
							{
								epic_id: epic_id,
							},
							{
								where: { id: id }
							})
						res.send('1')

					} catch (e) {
						Log("ROUTE /form/epic - user id -> " + e)
						res.send('500')
					}
				}
				else
					res.send('42')
			} catch (e) {
				Log("ROUTE /form/epic -> " + e)
				res.send('500')
			}
		})
	} catch (e) {
		Log("ROUTE /form/epic - user -> " + e)
		res.send('500')
	}
})

module.exports = Router
