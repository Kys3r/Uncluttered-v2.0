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
	async games1v1Played(id, mode_id)
	{
		try {
			let ret = await Models.Games_1v1_histories.count(
			{
				where: {
					[Op.or]: [{ player_a_id: id },{ player_b_id: id }],
					mode_id: mode_id
				}
			})
			return ret;
		} catch (e) {
			Log("Function games1v1Played | id user = " + id + "mode_id = " + mode_id + " ERROR :  -> " + e)
			return false
		}
	},

	async games1v1Win(id, mode_id)
	{
		try {
			let ret = await Models.Games_1v1_histories.count(
			{
				where: {
					winner_id: id,
					mode_id: mode_id
				}
			})
			return ret;
		} catch (e) {
			Log("Function games1v1Win | id user = " + id + "mode_id = " + mode_id + " ERROR :  -> " + e)
			return false
		}
	},

	async games1v1KillsModeId(id, mode_id)
	{
		try {
			let killsA = await Models.Games_1v1_histories.findAll(
			{
				where: {
					player_a_id: id,
					mode_id: mode_id
				},
				attributes: [[Sequelize.fn('sum', Sequelize.col('score_player_a')), 'kills']],
			    group : ['Games_1v1_histories.player_a_id'],
			    raw: true
			})
			let killsB = await Models.Games_1v1_histories.findAll(
			{
				where: {
					player_b_id: id,
					mode_id: mode_id
				},
				attributes: [[Sequelize.fn('sum', Sequelize.col('score_player_a')), 'kills']],
			    group : ['Games_1v1_histories.player_b_id'],
			    raw: true
			})

			if (Validate.isDefined(killsA[0]) && Validate.isDefined(killsB[0]))
				return (+killsA[0].kills + +killsB[0].kills);
			else if (Validate.isDefined(killsA[0]) && !Validate.isDefined(killsB[0]))
				return +killsA[0].kills
			else if (!Validate.isDefined(killsA[0]) && Validate.isDefined(killsB[0]))
				return +killsB[0].kills
			else
				return 0

		} catch (e) {
			Log("Function games1v1KillsModeId | id user = " + id + "mode_id = " + mode_id + " ERROR :  -> " + e)
			return false
		}
	},
	async games1v1Kills(id)
	{
		try {
			let killsA = await Models.Games_1v1_histories.findAll(
			{
				where: {
					player_a_id: id
				},
				attributes: [[Sequelize.fn('sum', Sequelize.col('score_player_a')), 'kills']],
			    group : ['Games_1v1_histories.player_a_id'],
			    raw: true
			})
			let killsB = await Models.Games_1v1_histories.findAll(
			{
				where: {
					player_b_id: id
				},
				attributes: [[Sequelize.fn('sum', Sequelize.col('score_player_a')), 'kills']],
			    group : ['Games_1v1_histories.player_b_id'],
			    raw: true
			})

			if (Validate.isDefined(killsA[0]) && Validate.isDefined(killsB[0]))
				return (+killsA[0].kills + +killsB[0].kills);
			else if (Validate.isDefined(killsA[0]) && !Validate.isDefined(killsB[0]))
				return +killsA[0].kills
			else if (!Validate.isDefined(killsA[0]) && Validate.isDefined(killsB[0]))
				return +killsB[0].kills
			else
				return 0

		} catch (e) {
			Log("Function games1v1KillsModeId | id user = " + id + "mode_id = " + mode_id + " ERROR :  -> " + e)
			return false
		}
	},

// GAMES PLAYED

	async nbRankedBfPlay(id)
	{
		let ret = await this.games1v1Played(id, 1);
		return ret
	},

	async nbUnrankedBfPlay(id)
	{
		let ret = await this.games1v1Played(id, 3);
		return ret
	},

	async nbRanked1v1BxfPlay(id)
	{
		let ret = await this.games1v1Played(id, 2);
		return ret
	},

	async nbUnranked1v1BxfPlay(id)
	{
		let ret = await this.games1v1Played(id, 4);
		return ret
	},

// GAMES WIN

	async nbRankedBfWin(id)
	{
		let ret = await this.games1v1Win(id, 1);
		return ret
	},

	async nbUnrankedBfWin(id)
	{
		let ret = await this.games1v1Win(id, 3);
		return ret
	},

	async nbRanked1v1BxfWin(id)
	{
		let ret = await this.games1v1Win(id, 2);
		return ret
	},

	async nbUnranked1v1BxfWin(id)
	{
		let ret = await this.games1v1Win(id, 4);
		return ret
	},

// Kills

	async nbRankedBfKills(id)
	{
		let ret = await this.games1v1KillsModeId(id, 1);
		return ret
	},

	async nbUnrankedBfKills(id)
	{
		let ret = await this.games1v1KillsModeId(id, 3);
		return ret
	},

	async nbRanked1v1BxfKills(id)
	{
		let ret = await this.games1v1KillsModeId(id, 2);
		return ret
	},

	async nbUnranked1v1BxfKills(id)
	{
		let ret = await this.games1v1KillsModeId(id, 4);
		return ret
	},

// Achat boutique virtuel

	async nbItems(id)
	{
		let ret = await Models.Users_items.count({ where: { user_id: id } })
		return ret
	},

// Chat

	async nbMessagesChat(id)
	{
		let ret = await Models.Users.findOne(
		{
			where: {
				id: id
			},
			attributes: ['messages_chat']
		})
		return ret.messages_chat
	},

//Visites

	async nbVisits(id)
	{
		let ret = await Models.Users.findOne(
		{
			where: {
				id: id
			},
			attributes: ['visits']
		})
		return ret.visits
	},

// Premium

	async nbPremium(id)
	{
		let ret = await Models.Subscriptions.count(
		{
			where: {
				user_id: id
			}
		})
		return (ret)
	},
	async nbPremiumPlanId(id, planId)
	{
		let ret = await Models.Subscriptions.count(
		{
			where: {
				user_id: id,
				plan_id: planId
			}
		})
		return (ret)
	}

}
