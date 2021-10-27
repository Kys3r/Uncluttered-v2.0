'user strict'
const Express = require('express'),
			Router = Express.Router(),
			Log = require('log-to-file')

// Database Utils
const Sequelize = require('sequelize'),
			Models = require('../../database/models')

const Jwt = require('jsonwebtoken'),
			Validate = require('validate.js')

// Utils
const PurchaseM = require('../../models/purchase'),
			Sub = require('../../models/subscribtions'),
			Lib = require('../../lib/lib')

// Paypal configuration
const Paypal = require('paypal-rest-sdk')

Paypal.configure({
	'mode': process.env.PAYPAL_MODE, //sandbox or live
	'client_id': process.env.PAYPAL_CLIENT_ID,
	'client_secret': process.env.PAYPAL_SECRET_KEY
});

// PAYPAL
// GET

Router.get('/paypal', async (req, res) => {
	let { plan_id, token } = req.query
	let items;
	try {
		await Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
			if (err)
				res.redirect(process.env.DOMAIN_CLIENT + '/login')
			else {
				if (!Validate.isEmpty(plan_id) && (plan_id == 1 || plan_id == 2 || plan_id == 3)) {
					let user = await Models.Users.findOne(
						{
							where: { id: decoded.id },
							attributes: [],
							raw: true,
							include: [
								{
									model: Models.Languages,
									as: 'language',
									attributes: ['alpha_code']
								}
							]
						})
					let plan = await Models.Plans.findOne({ where: { id: plan_id }, raw: true })
					let name = user['language.alpha_code'] == 'fr' ? String(plan.name_fr) : String(plan.name_en)
					let create_payment_json = PurchaseM.createPaypalJSON(name, String(plan.price))
					Paypal.payment.create(create_payment_json, (error, payment) => {
						if (error) {
							Log("Problème paiement Paypal -> " + error)
							res.redirect(process.env.DOMAIN_CLIENT + "/payment-cancelled")
						}
						else {
							Models.Premium_transactions.create(
								{
									user_id: decoded.id,
									amount: plan.price,
									currency_id: 1,
									payment_method_id: 1,
									plan_id: plan_id,
									payment_id: payment.id,
									type_id: 1
								})
							for (let i = 0; i < payment.links.length; i++) {
								if (payment.links[i].rel == 'approval_url')
									return res.redirect(payment.links[i].href)
							}
						}
					})
				}
			}
		})
	} catch (e) {
		Log("ROUTE purchase/premium/ :  -> " + e)
		res.redirect(process.env.DOMAIN_CLIENT + "/payment-cancelled")
	}
})

Router.get('/success-paypal', async (req, res) => {
	const { paymentId, PayerID } = req.query
	let transaction = await Models.Premium_transactions.findOne(
		{
			where: { payment_id: paymentId },
			attributes: ['user_id', 'amount', 'plan_id'],
			raw: true,
			include: [
				{
					model: Models.Currencies,
					as: 'currency'
				},
				{
					model: Models.Plans,
					as: 'plan'
				}
			]
		})
	let execute_payment_json = {
		"payer_id": PayerID,
		"transactions": [{
			"amount": {
				"currency": 'EUR',
				"total": String(transaction.amount)
			}
		}]
	}

	Paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
		if (error) {
			Log("Erreur reçu de paypal execution paiement | id user: -> " + transaction.user_id + " Erreur = " + error)
			res.redirect(process.env.DOMAIN_CLIENT + "/payment-cancelled")
		}
		else {
			try {
				await Models.Premium_transactions.update(
					{
						firstname: payment.payer.payer_info.first_name,
						lastname: payment.payer.payer_info.last_name,
						success: true
					},
					{
						where: { payment_id: paymentId }
					})
				Sub.insertSub(transaction.user_id, transaction.plan_id, transaction['plan.month'])
				res.redirect(process.env.DOMAIN_CLIENT + "/payment-success")
			}
			catch (e) {
				Log("Problème execution paiement Paypal 3 user id -> " + transaction.user_id + " Erreur = " + e)
				res.redirect(process.env.DOMAIN_CLIENT + "/payment-cancelled")
			}
		}
	})
})

Router.get('/cancelled-paypal', async (req, res) => {
	res.redirect(process.env.DOMAIN_CLIENT + "/payment-cancelled")
})

Router.post('/give-premium', async (req, res) => {
	try {
		let { id, time } = req.body
		let token = req.headers.token

		if (!Validate.isEmpty(id)) {
			Jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
				if (err)
					res.send('42')
				else if (decoded.roles.indexOf('admin') >= 0) {
					var current = new Date();
					var followingDay = new Date(current.getTime() + time);
					await Models.Subscriptions.create(
						{
							user_id: id,
							plan_id: 1,
							start_date: current,
							end_date: followingDay
						})
					res.send('200')
				}
				else
					res.send('42')
			})
		}
		else
			res.send('500')
	}
	catch (e) {
		Log("ROUTE purchase/premium/give-premium :  -> " + e)
		res.send('500')
	}
})


// STRIPE

module.exports = Router
