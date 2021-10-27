'user strict'
const	Fs = require('fs'),
			Log = require('log-to-file');

// Database Utils
const	Sequelize = require('sequelize'),
			Op = Sequelize.Op,
			Models = require('../database/models');

module.exports =
{
	async nbMatch1v1SeasonX(id, season_id, mode_id)
	{
		try {
			let ret = await Models.Games_1v1_histories.count(
			{
				where: {
					season_id: season_id,
					[Op.or]: [{ player_a_id: id },{ player_b_id: id }],
					mode_id: mode_id
				}
			})
			return (ret)
		} catch (e) {
			Log("Function nbMatch1v1SeasonX = " + id + " :  -> " + e)
			return false
		}
	},

	async nbWin1v1SeasonX(id, season_id, mode_id)
	{
		try {
			let ret = await Models.Games_1v1_histories.count(
			{
				where: {
					season_id: season_id,
					winner_id: id,
					mode_id: mode_id
				}
			})
			return (ret)
		} catch (e) {
			Log("Function nbWin1v1SeasonX = " + id + " :  -> " + e)
			return false
		}
	},
}
