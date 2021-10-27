'user strict'
const	Fs = require('fs'),
			Log = require('log-to-file');

// Database Utils
const	Sequelize = require('sequelize'),
			Op = Sequelize.Op,
			Models = require('../database/models');

// Models
const	StatsM = require('./statistics')

// Utils
const	Validate = require('validate.js')

module.exports =
{
	async majAchievements(userId)
	{
		let nbTypesStatistics = await Models.Types_stats.count({})
		let achievements, counter;
		let user_achievements_points = []
// Feature need to be refactored
		let items,
				bfRankedPlay,
				bfUnrankedPlay,
				bfUnrankedWin,
				bfRankedWin,
				bxf1v1RankedPlay,
				bxf1v1UnrankedPlay,
				bxf1v1UnrankedWin,
				bxf1v1RankedWin,
				rankedBfKills,
				unrankedBfKills,
				rankedBxf1v1Kills,
				unrankedBxf1v1Kills,
				totalKills,
				firstPremium,
				premium12month;

		items = await StatsM.nbItems(userId) // type 1
		bfRankedPlay = await StatsM.nbRankedBfPlay(userId) // type 2
		bfUnrankedPlay = await StatsM.nbUnrankedBfPlay(userId) // type 3
		bfUnrankedWin = await StatsM.nbUnrankedBfWin(userId) // type 4
		bfRankedWin = await StatsM.nbRankedBfWin(userId) // type 5
		bxf1v1RankedPlay = await StatsM.nbRanked1v1BxfPlay(userId) // type 6
		bxf1v1UnrankedPlay = await StatsM.nbUnranked1v1BxfPlay(userId) // type 7
		bxf1v1UnrankedWin = await StatsM.nbUnranked1v1BxfWin(userId) // type 8
		bxf1v1RankedWin = await StatsM.nbRanked1v1BxfWin(userId) // type 9
		messagesChat = await StatsM.nbMessagesChat(userId) // type 10
		totalKills = await StatsM.games1v1Kills(userId) //type 11
		rankedBfKills = await StatsM.nbRankedBfKills(userId) // type 12
		unrankedBfKills = await StatsM.nbUnrankedBfKills(userId) // type 13
		rankedBxf1v1Kills = await StatsM.nbRanked1v1BxfKills(userId) // type 14
		unrankedBxf1v1Kills = await StatsM.nbUnranked1v1BxfKills(userId) // type 15
		isFollower = await Models.Users.count({where: {id: userId, twitter_follower: true}}) //type 16
		firstPremium = await StatsM.nbPremium(userId) // type 17
		premium12month = await StatsM.nbPremiumPlanId(userId, 3) // type 18

		for (let typeStatsId = 1; typeStatsId <= nbTypesStatistics; typeStatsId++)
		{
			switch (typeStatsId)
			{
				case 1:
					counter = items
					break;
				case 2:
					counter = bfRankedPlay
					break;
				case 3:
					counter = bfUnrankedPlay
					break;
				case 4:
					counter = bfUnrankedWin
					break;
				case 5:
					counter = bfRankedWin
					break;
				case 6:
					counter = bxf1v1RankedPlay
					break;
				case 7:
					counter = bxf1v1UnrankedPlay
					break;
				case 8:
					counter = bxf1v1UnrankedWin
					break;
				case 9:
					counter = bxf1v1RankedWin
					break;
				case 10:
					counter = messagesChat
					break;
				case 11:
					counter = totalKills
					break;
				case 12:
					counter = rankedBfKills
					break;
				case 13:
					counter = unrankedBfKills
					break;
				case 14:
					counter = rankedBxf1v1Kills
					break;
				case 15:
					counter = unrankedBxf1v1Kills
					break;
				case 16:
					counter = isFollower
					break;
				case 17:
					counter = firstPremium
					break;
				case 18:
					counter = premium12month
					break;
			}
			if (counter > 0)
			{
				achievements = await Models.Achievements.findAll({ where: {type_id: typeStatsId, points_goal: {[Op.lte]: counter}}, raw: true })
				if (!Validate.isEmpty(achievements))
				{
					for (let i in achievements)
					{
						if (achievements.hasOwnProperty(i))
						{
							await Models.Users_achievements.count({ where: {user_id: userId, achievement_id: achievements[i].id} })
							.then(async res =>
							{
								if (res == 0)
								{
									await Models.Users.increment({ wallet: +achievements[i].coins }, { where: { id: userId }})
									await Models.Users_achievements.create({user_id: userId, achievement_id: achievements[i].id})
								}
							})
							.catch(e => Log("Function majAchievements :  -> " + e))
						}
					}
				}
			}
		}

		return ([
			{
				type: 1,
				data: items
			},
			{
				type: 2,
				data: bfRankedPlay
			},
			{
				type: 3,
				data: bfUnrankedPlay
			},
			{
				type: 4,
				data: bfUnrankedWin
			},
			{
				type: 5,
				data: bfRankedWin
			},
			{
				type: 6,
				data: bxf1v1RankedPlay
			},
			{
				type: 7,
				data: bxf1v1UnrankedPlay
			},
			{
				type: 8,
				data: bxf1v1UnrankedWin
			},
			{
				type: 9,
				data: bxf1v1RankedWin
			},
			{
				type: 10,
				data: messagesChat
			},
			{
				type: 11,
				data: totalKills
			},
			{
				type: 12,
				data: rankedBfKills
			},
			{
				type: 13,
				data: unrankedBfKills
			},
			{
				type: 14,
				data: rankedBxf1v1Kills
			},
			{
				type: 15,
				data: unrankedBxf1v1Kills
			},
			{
				type: 16,
				data: isFollower
			},
			{
				type: 17,
				data: firstPremium
			},
			{
				type: 18,
				data: premium12month
			}
		])
	}
}
