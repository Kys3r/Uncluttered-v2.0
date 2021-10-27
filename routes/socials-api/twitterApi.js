'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Fs = require('fs'),
			Validate = require("validate.js"),
			Log = require('log-to-file'),
			Randtoken = require('rand-token'),
			Twit = require('twit')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../../database/models')

// Oauth
const	Passport = require('passport'),
			TwitterStrategy = require('passport-twitter').Strategy

// Utils

const	SocialNetwork = require('../../models/social_networks')

let tokenMid = function(req, res, next) {
	if (req.query.token) {
		token_user = req.query.token;
	}
    next();
};

// Config Twit module

let T = new Twit({
	consumer_key:         process.env.TWITTER_CONSUMER_PUBLIC,
	consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
	access_token:         process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
	timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

Passport.initialize()

Passport.use(new TwitterStrategy({
		consumerKey: process.env.TWITTER_CONSUMER_PUBLIC,
		consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
		userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json",
		callbackURL: process.env.DOMAIN + '/twitter-api/link/callback'
	},
	(token, tokenSecret, profile, cb) => {
		cb(null, profile._json)
	}
))

Passport.serializeUser(function(user, done) { done(null, user) })

Passport.deserializeUser(function(user, done) { done(null, user) })

// Route Auth
Router.get('/link', tokenMid, Passport.authenticate('twitter'))

Router.get('/link/callback', Passport.authenticate('twitter', { failureRedirect: '/twitter-api/failure-redirect' }), async (req, res) =>
{
	await Jwt.verify(token_user, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
	{
		if (err)
			res.send('42')
		else
		{
			await Models.Users.update({twitter_id: req.user.id_str}, {where: { id: decoded.id }})
			// // await SocialNetwork.updateSocialNetworkUser(decoded.id, 1, req.user.screen_name)
			res.redirect(process.env.DOMAIN_CLIENT + '/allachievements?step=1')
		}
	})
})

// CLAIM achievements

Router.get('/follower', async (req, res) =>
{
	let { token } = req.headers
	await Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
	{
		if (err)
			res.send('42')
		else
		{
			let user = await Models.Users.findOne(
			{
				where: {id: decoded.id},
				attributes: ['twitter_id']
			})
			if (Validate.isDefined(user.twitter_id) && !Validate.isEmpty(user.twitter_id) && user.twitter_id !== null)
			{
				let T = new Twit({
					consumer_key:         process.env.TWITTER_CONSUMER_PUBLIC,
					consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
					access_token:         process.env.TWITTER_ACCESS_TOKEN_KEY,
					access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
					timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
				})
				T.get('friendships/show', { source_id: '1033113504134438913', target_id: user.twitter_id }, async (err, data, response) =>
				{
					if (err)
						res.send('500');
					else
					{
						if (data.relationship.source.followed_by == false)
							res.send('2')
						else
						{
							await Models.Users.update({twitter_follower: true}, {where: { id: decoded.id }})
							res.send('1')
						}
					}
				})
			}
			else
				res.send('500')
		}
	})
})

Router.get('/unlink', async (req, res) =>
{
	let { token } = req.headers
	await Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) =>
	{
		if (err)
			res.send('42')
		else
		{
			await Models.Users.update({ twitter_id: null }, {where: { id: decoded.id }})
			res.send('1')
		}
	})
})

Router.get('/failure-redirect', (req, res) =>
{
	res.writeHead(302, { Location: process.env.DOMAIN_CLIENT + '/login&error=authentificationRejected' })
	res.end()
})

module.exports = Router
