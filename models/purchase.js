'user strict'
const	Fs = require('fs'),
			Log = require('log-to-file');

// Database Utils
const	Sequelize = require('sequelize'),
			Op = Sequelize.Op,
			Models = require('../database/models');

module.exports =
{
	createPaypalJSON(name, price)
	{
		try {
			let ret =
			{
				"intent": "sale",
				"payer": {
					"payment_method": "paypal"
				},
				"redirect_urls": {
					"return_url": process.env.DOMAIN + "/purchase/premium/success-paypal",
					"cancel_url": process.env.DOMAIN + "/purchase/premium/cancelled-paypal"
				},
				"transactions": [{
					"item_list": {
						"items": [{
							"name": name,
							"price": price,
							"currency": "EUR",
							"quantity": 1
						}]
					},
					"amount": {
						"currency": "EUR",
						"total": price
					},
					"description": "Pass premium Buildfight.com"
				}]
			}
			return (ret)
		} catch (e) {
			Log("Function createPaypalJSON -> " + e)
			return false
		}
	}
}
