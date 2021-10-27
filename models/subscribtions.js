'user strict'
const	Fs = require('fs'),
		Validate = require("validate.js"),
		Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
		Op = Sequelize.Op,
		Models = require('../database/models')

// Utils
const Lib = require('../lib/lib')

module.exports =
{
	async isSub(id)
	{
		try {
			let user;
			let isSub = await Models.Subscriptions.findAll(
			{
				where: {
					user_id: id,
					[Op.and]: [
						{
							start_date: {
								[Op.lt]: Date.now()
							}
						},
						{
							end_date: {
								[Op.gt]: Date.now()
							}
						}
					]
				}
			})
			if (Validate.isEmpty(isSub))
			{
				// Verification si l'user est inscrit depuis moins de XXh -> Free premium nouvel inscrit
				user = await Models.Users.findOne({
					where: { id: id },
					attributes: ['profil_picture', 'color_pseudo', 'createdAt'],
					raw: true
				})
				let date = user.createdAt.getTime() + 172800000
				if (date > new Date())
					return true
				else
				{
					if (user.color_pseudo != "#FFFFFF")
						await Models.Users.update( { color_pseudo: "#FFFFFF" }, { where: { id: id } })
					if (user.profil_picture.search(".gif") > -1)
					{
						let str = String("PP-" + String(Math.floor(Math.random() * 5) + 1) + ".png")
						await Models.Users.update( { profil_picture: str }, { where: { id: id } })
						Fs.unlinkSync(__dirname + '/../public/img/profile-pictures/' + user.profil_picture)
					}
					return false
				}
			}
			else
				return (Validate.isEmpty(isSub) ? false : true)
			// return true
		} catch (e) {
			Log("Function isSub id = " + id + " :  -> " + e)
			return false
		}
	},
	async lastSub(id)
	{
		try {
			let lastSub = await Models.Subscriptions.findAll(
			{
				limit: 1,
				where: {
					user_id: id
				},
				order: [ [ 'end_date', 'DESC' ]],
				attributes: ['end_date']
			})
			return (Validate.isEmpty(lastSub) ? false : lastSub[0].end_date)
		} catch (e) {
			Log("Function lastSub id = " + id + " :  -> " + e)
			return false
		}
	},

// Insert
	async insertSub(userId, planId, month)
	{
		let lastSub = await this.lastSub(userId)
		let lastSub2 = await this.lastSub(userId)

		let startDate = (lastSub == false || lastSub < new Date()) ? new Date() : lastSub
		let endDate = (lastSub2 == false || lastSub2 < new Date()) ? Lib.addMonths(new Date(), month) : Lib.addMonths(lastSub2, month)
		await Models.Subscriptions.create(
		{
			user_id: userId,
			plan_id: planId,
			start_date: startDate,
			end_date: endDate
		})
		return true
	},
	
}
