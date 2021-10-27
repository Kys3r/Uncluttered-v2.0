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
    async updateSocialNetworkUser(user_id, social_id, link)
    {
        await Models.User_social_networks.findOrCreate({
            defaults: { user_id: user_id, social_network_id: social_id, link: link },
            where: { user_id: user_id, social_network_id: social_id }
        })
        .spread(async (user, created) =>
        {
            if (created == true)
                return (1)
            else
            {
                await Models.User_social_networks.update({ link: link }, { where: { user_id: user_id, social_network_id: social_id } })
                return (1)
            }
        })
    },

	async deleteSocialNetworkUser(user_id, social_id)
	{
		await Models.User_social_networks.destroy(
		{
			where: {
				user_id: user_id,
				social_id: social_id
			}
		})
		return 1
	}
}
