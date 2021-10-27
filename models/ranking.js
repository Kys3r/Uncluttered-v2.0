const	Sequelize = require('sequelize'),
			Models = require('../database/models'),
			Op = Sequelize.Op,
			Randtoken = require('rand-token')

module.exports =
{
	async listChallenger(serverId, modeId, seasonId)
	{
		let leaderboard;
		if (serverId == 0)
		{
			leaderboard = await Models.Seasons_scores.findAll(
			{
				where: {
					season_id: seasonId,
					mode_id: modeId
				},
				limit: 8,
				order: [ [ 'elo', 'DESC' ], [ 'winrate', 'DESC' ] ],
				attributes: ['user_id'],
				raw: true
			})
		}
		else
		{
			leaderboard = await Models.Seasons_scores.findAll(
			{
				where: {
					season_id: seasonId,
					mode_id: modeId,
					server_id: serverId
				},
				limit: 100,
				order: [ [ 'elo', 'DESC' ], [ 'winrate', 'DESC' ] ],
				attributes: ['user_id'],
				raw: true
			})
		}
		return (leaderboard)
	},
	async isChallenger(listChallenger, userId)
	{
		return (listChallenger.findIndex(obj => obj.user_id==userId) >= 0 ? true : false)
	}
}
