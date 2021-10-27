'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Fs = require('fs'),
			Validate = require("validate.js"),
			Log = require('log-to-file'),
			Randtoken = require('rand-token'),
			Image2base64 = require('image-to-base64')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../../database/models'),
			Users = Models.Users

// Utils
const	Email = require('../../models/email'),
			Sanctions = require('../../models/sanctions')

// Oauth
const	Passport = require('passport'),
			DiscordStrategy = require('passport-discord').Strategy

Passport.initialize()

Passport.use(new DiscordStrategy({
	clientID: process.env.DISCORD_CLIENT_ID,
	clientSecret: process.env.DISCORD_SECRET_KEY,
	callbackURL: String(process.env.DOMAIN + "/discord-auth/auth/callback"),
	authorizationURL: 'https://discordapp.com/api/oauth2/authorize',
	tokenURL: 'https://discordapp.com/api/oauth2/token',
},
	async (accessToken, refreshToken, profile, cb) => {
		if (Validate.isDefined(profile.email) && !Validate.isEmpty(profile.email))
		{
			Models.Users.findOrCreate({
				defaults: { email: profile.email, verified: true, discord_id: profile.id, profil_picture: "PP-" + String(Math.floor(Math.random() * 5) + 1) + ".png" },
				where: { email: profile.email }
			})
			.spread(async (user, created) =>
			{
				if (created == true)
				{
					let user_id = user.id
					await Models.Users_roles.create({user_id})
					cb(null, user)
				}
				else
				{
					await Models.Users.update({ discord_id: profile.id, verified: true }, { where: {email: profile.email} })
					cb(null, user)
				}
			})
		}
		else
			cb(null, null)
	}
))

Passport.serializeUser(function(user, done) { done(null, user) })

Passport.deserializeUser(function(user, done) { done(null, user) })

// Route Auth
Router.get('/auth', Passport.authenticate('discord', {scope: ['email', 'identify']}))

Router.get('/auth/callback', Passport.authenticate('discord', { failureRedirect: '/discord-auth/failure-redirect' }), async (req, res) =>
{
	if (Validate.isDefined(req.user))
	{
		let user = await Models.Users.findOne(
		{
			where: {
				id: req.user.id
			},
			attributes: ['id', 'second_form'],
			include: [
				{
					model: Models.Roles,
					as: 'roles',
					throught: []
				}
			]
		})
		let banned = await Sanctions.isBannedUser(user.id)
		if (banned)
			return res.redirect(process.env.DOMAIN_CLIENT + '/login?banned=true&until='+ banned.until.toString() + "&comment=" + banned.comment + "&reason=" + banned.ban_reason.name_en)
		let roles = new Array()
		for (let i = 0; i < user.roles.length; i++)
		{
			roles.push(user.roles[i].name)
		}
		let privateKey = Fs.readFileSync(__dirname + '/../../privateKeyJWT.pem', 'utf8')
		let token = Jwt.sign({
			"id": String(user.id),
			"roles": roles
		}, process.env.JWT_PRIVATE_KEY, { algorithm: 'HS256' })
		user.second_form == true ? res.redirect(process.env.DOMAIN_CLIENT + '/login?token=' + token + '&secondForm=true&id=' + user.id) : res.redirect(process.env.DOMAIN_CLIENT + '/login?token=' + token + '&secondForm=false&id=' + user.id)
		res.end()
	}
	else
		res.redirect(process.env.DOMAIN_CLIENT + '/failure-redirect')
})

Router.get('/failure-redirect', (req, res) =>
{
	res.writeHead(302, { Location: process.env.DOMAIN_CLIENT + '/login&error=authentificationRejected' })
	res.end()
})

module.exports = Router
