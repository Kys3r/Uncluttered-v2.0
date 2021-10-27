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
	async epicAlreadyExist(epic_id)
	{
		let exist = await Models.Users.findOne({
			where: {
				epic_id: epic_id
			},
			attributes: ['id'],
			raw: true
		})
		return (Validate.isDefined(exist) ? true : false)
	},
	async isOwnEpicId(id, epic_id)
	{
		let own = await Models.Users.findOne({
			where: {
				id: id,
				epic_id: epic_id
			},
			attributes: ['id'],
			raw: true
		})
		return (Validate.isDefined(own) ? true : false)
	},
}
