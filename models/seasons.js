'user strict'
const	Fs = require('fs'),
			Log = require('log-to-file')

// Database Utils
const	Sequelize = require('sequelize'),
			Models = require('../database/models')

module.exports =
{
	async getCurrentSeasonId()
	{
		try {
			let ret = await Models.Seasons.findOne(
			{
				where: {
					isActive: true
				},
				attributes: ['id']
			})
			return ret.id
		} catch (e) {
			Log("Function getCurrentSeason :  -> " + e)
			return false
		}
	}
}
