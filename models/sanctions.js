'user strict'
const	Fs = require('fs'),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Op = Sequelize.Op,
			Models = require('../database/models'),
			GamesM = require('./games_1v1_histories')

// Utils
const	Validate = require('validate.js')

module.exports =
{
	async isBannedEpic(epic_id)
	{
		let banned = await Models.Banneds.findAll({
			limit: 1,
			order: [ [ 'createdAt', 'DESC' ] ],
			where: {
				[Op.and]: [
					{ epic_id: epic_id },
					{
						until: {
							[Op.gt]: new Date()
						}
					}
				]
			},
			attributes: ['comment', 'until'],
			include: [
				{
					model: Models.Penalization_reasons_bans,
					as: 'ban_reason',
					attributes: ['name_fr', 'name_en']
				}
			]
		})
		return (Validate.isEmpty(banned) ? false : banned)
	},

	async isBannedUser(id)
	{
		let banned = await Models.Banneds.findOne({
			limit: 1,
			order: [ [ 'createdAt', 'DESC' ] ],
			where: {
				[Op.and]: [
					{ banned_id: id },
					{
						until: {
							[Op.gt]: new Date()
						}
					}
				]
			},
			attributes: ['comment', 'until'],
			include: [
				{
					model: Models.Penalization_reasons_bans,
					as: 'ban_reason',
					attributes: ['name_fr', 'name_en']
				}
			]
		})
		return (Validate.isEmpty(banned) ? false : banned)
	}
}
