'user strict'
const	Fs = require('fs'),
			Log = require('log-to-file');

// Database Utils
const	Sequelize = require('sequelize'),
			Op = Sequelize.Op,
			Models = require('../database/models');

// Utils
const Seasons = require('./seasons')

module.exports =
{
	async createSeasonScores(userId, serverId, modeId)
	{
		await Models.Seasons_scores.create(
		{
			user_id: userId,
			season_id: await Seasons.getCurrentSeasonId(),
			mode_id: modeId,
			server_id: serverId
		})
	}
}
