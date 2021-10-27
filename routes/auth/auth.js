'user strict'
const	Express = require('express'),
			Router = Express.Router(),
			Jwt = require('jsonwebtoken'),
			Fs = require('fs'),
			Validate = require("validate.js"),
			Log = require('log-to-file'),
			Bcrypt = require('bcrypt'),
			Http = require('http'),
			Request = require('request')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../../database/models')

// Utils
const	SaltRounds = 8,
			Lib = require('../../lib/lib'),
			Email = require('../../models/email'),
			Token = require('../../models/token'),
			Sanctions = require('../../models/sanctions'),
			Domains = require('disposable-email-domains'),
			Wildcards = require('disposable-email-domains/wildcard.json');

// Routes

Router.post('/login', async (req, res) =>
{
	let { email, password } = req.body;

	if (!Validate.isEmpty(email) && !Validate.isEmpty(password) && Lib.isPassword(password))
	{
		const user = await Models.Users.findOne(
		{
			where: { email: email },
			include: [
				{
					model: Models.Roles,
					as: 'roles',
					attributes: ['name']
				}
			]
		})
		if (Validate.isEmpty(user) || !Validate.isDefined(user))
			return res.send('500')
		let banned = await Sanctions.isBannedUser(user.dataValues.id)
		if (banned)
			return res.send({banned:true, until: banned.until.toString(), comment: banned.comment, reason: banned.ban_reason.name_en})
	    if(user && user.password)
		{
			if (user.verified == true)
			{
		        const match = await Bcrypt.compare(password, user.password)
				if (match)
				{
					let roles = new Array()
					for (let i = 0; i < user.roles.length; i++)
					{
						roles.push(user.roles[i].name)
					}
					let privateKey = Fs.readFileSync(__dirname + '/../../privateKeyJWT.pem', 'utf8')
					let token = Jwt.sign({
						"id": user.id,
						"roles": roles
					}, process.env.JWT_PRIVATE_KEY, { algorithm: 'HS256' })
					user.second_form == true ? res.send({ id: user.id, token: token, secondForm: true, banned: false }) : res.send({ id: user.id, token: token, secondForm: false })
				}
				else
					res.send({ error: '3' })
			}
			else
				res.send({ error: '4' })
		}
		else
			res.send({ error: '2' })
	}
	else
		res.send({ error: '0' })
})

Router.post('/register', async (req, res) =>
{
	let { email, password } = req.body
	const recaptchaResponse = req.body['g-recaptcha-response']
	let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.RECAPTCHA + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
	Request(verificationUrl, async (err, response, body) =>
	{
		body = JSON.parse(body)
		if (err) {
			res.send('4')
		}
		else if (body.success == true)
		{
			if (!Validate.isEmpty(email) && !Validate.isEmpty(password) && Lib.isPassword(password))
			{
				email = await email.toLowerCase()
				if (!Domains.includes(email.substring(email.lastIndexOf("@") +1)) && !Wildcards.includes(email.substring(email.lastIndexOf("@") +1)))
				{
					const emailVerif = await Models.Users.findAll({ where: { email: email } })
					// si l'email existe déja en bdd
					if (!Validate.isEmpty(emailVerif))
						res.send('2')
					else
					{
						Bcrypt.hash(password, SaltRounds, (err, hash) =>
						{
							if (err)
							{
								Log("Route register - Email User : " + email + " -> " + e)
								res.send('500')
							}
							else
							{
								password = hash
								Models.Users.create({email, password, profil_picture: "PP-" + String(Math.floor(Math.random() * 5) + 1) + ".png"})
								.then(response =>
								{
									let user_id = response.dataValues.id
									return Models.Users_roles.create({user_id})
								})
								.then(response => Token.insertToken(response.dataValues.user_id, null, 'email'))
								.then(response => Email.confirmAccountMail(email, response.dataValues.token, 'en'))
								.then(response => res.send('1'))
								.catch(e =>
								{
									if (e.name == 'SequelizeValidationError')
										res.send('0')
									else {
										Log("Route register - Email User : " + email + " -> " + e)
										res.send('500')
									}
								})
							}
						})
					}
				}
				else
					res.send('3')
			}
			else
				res.send('0')
		}
		else
			res.send('4')
	})
})

Router.get('/confirm-account/:token', async (req, res) =>
{
	let { token } = req.params;
	try {
		if (!Validate.isEmpty(token))
		{
			const user = await Models.Tokens.findOne({ where: { token: token }, attributes: ['user_id'] })

			if (Validate.isEmpty(user))
				res.send('2')
			else
			{
				let ret = await Models.Users.update({ verified: true }, { where: {id: user.user_id} })
				if (ret)
				{
					await Models.Tokens.destroy({where: {user_id: user.user_id, type: 'email'}})
					let privateKey = Fs.readFileSync(__dirname + '/../../privateKeyJWT.pem', 'utf8')
					let tokenJwt = Jwt.sign({
						"id": String(user.user_id)
					}, process.env.JWT_PRIVATE_KEY, { algorithm: 'HS256' })

					res.redirect(process.env.DOMAIN_CLIENT + '/login?token=' + tokenJwt + '&secondForm=false&id=' + +user.user_id)
					res.end()
				}
				else
				{
					Log("Route confirm-account - User id : " + user.user_id + " -> " + e)
					res.writeHead(302, { Location: process.env.DOMAIN_CLIENT + '/login&error=authentificationRjected' })
					res.end()
				}
			}
		}
		else
			res.send('0')
	} catch (e) {
		Log("ROUTE confirm-account :  -> " + e)
		res.writeHead(302, { Location: process.env.DOMAIN_CLIENT + '/login&error=authentificationRjected' })
		res.end()
	}
})

module.exports = Router
