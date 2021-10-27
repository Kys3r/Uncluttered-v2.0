'use strict'

module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('Users', {
		username:
		{
			type: DataTypes.STRING,
			validate: {
				len: [3, 16],
				// is: /^(?!.*([ ._-])\1)[A-Za-z0-9 ._-]+$/i
			}
		},
		country_id: DataTypes.INTEGER,
		platform_id: DataTypes.INTEGER,
		language_id: DataTypes.INTEGER,
		server_id: DataTypes.INTEGER,
		profil_picture: DataTypes.STRING,
		color_pseudo: {
			type: DataTypes.STRING,
			defaultValue: "#FFFFFF"
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		wallet: DataTypes.INTEGER,
		spent_points: DataTypes.INTEGER,
		connection_status: DataTypes.DATE,
		connection_time: DataTypes.INTEGER,
		verified: DataTypes.BOOLEAN,
		password: {
			type: DataTypes.STRING,
			validate: {
				len: [60]
			}
		},
		second_form: DataTypes.BOOLEAN,
		epic_id: DataTypes.STRING,
		discord_id: DataTypes.STRING,
		twitter_id: DataTypes.STRING,
		facebook_id: DataTypes.STRING,
		google_id: DataTypes.STRING,
		visits: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		messages_chat: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		twitter_follower: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		sponsorship_code: {
			type: DataTypes.STRING,
			allowNull: true
		},
		watchtime: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		ban_warned: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
	}, {})
	User.associate = function(models) {
		User.belongsTo(models.Servers, { as: 'server', foreignKey: 'server_id', primaryKey: 'id' })
		User.belongsTo(models.Countries, { as: 'country', foreignKey: 'country_id', primaryKey: 'id' })
		User.belongsTo(models.Platforms, { as: 'platform', foreignKey: 'platform_id', primaryKey: 'id' })
		User.belongsTo(models.Languages, { as: 'language', foreignKey: 'language_id', primaryKey: 'id' })
		User.hasMany(models.Tokens, { foreignKey: 'user_id' })
		User.belongsToMany(models.Achievements, { through: 'Users_achievements', as: 'achievement', foreignKey: 'user_id' }),
		User.belongsToMany(models.Social_networks, { through: 'User_social_networks', as: 'socialNetwork', foreignKey: 'user_id' })
		User.belongsToMany(models.Items, { through: 'Users_items', as: 'item', foreignKey: 'user_id' })
		User.belongsToMany(models.Roles, { through: 'Users_roles', as: 'roles', foreignKey: 'user_id' })
		User.belongsToMany(models.Plans, { through: 'Subscriptions', as: 'subscription', foreignKey: 'user_id' })
		User.hasMany(models.Games_1v1_histories, { as: 'winner', foreignKey: 'winner_id' })
		User.hasMany(models.Games_1v1_histories, { as: 'playerA', foreignKey: 'player_a_id' })
		User.hasMany(models.Games_1v1_histories, { as: 'playerB', foreignKey: 'player_b_id' })
		User.belongsToMany(models.Maps, { through: 'Liked_maps', as: 'liked_map', foreignKey: 'user_id' })
		User.hasMany(models.Seasons_scores, { as: 'score', foreignKey: 'user_id', sourceKey: 'id' })
		User.hasMany(models.Sponsorships, { as: 'sponsor', foreignKey: 'sponsor_id', sourceKey: 'id' })
		User.hasMany(models.Sponsorships, { as: 'sponsorised', foreignKey: 'sponsorised_id', sourceKey: 'id' })
		User.hasMany(models.Premium_transactions, { as: 'users', foreignKey: 'user_id', primaryKey: 'id' })
		User.belongsToMany(models.Plans, { through: 'Subscriptions', as: 'plans', foreignKey: 'user_id' })
		User.belongsToMany(models.Free_sub_codes, { through: 'Users_free_subs', as: 'free_sub', foreignKey: 'user_id' })
		// Penalization
		User.hasMany(models.Reports, { as: 'reporter', foreignKey: 'reporter_id', primaryKey: 'id' })
		User.hasMany(models.Reports, { as: 'reported', foreignKey: 'reported_id', primaryKey: 'id' })
		User.hasMany(models.Kickeds, { as: 'kicker', foreignKey: 'kicker_id', primaryKey: 'id' })
		User.hasMany(models.Kickeds, { as: 'kicked', foreignKey: 'kicked_id', primaryKey: 'id' })
		User.hasMany(models.Banneds, { as: 'banisher', foreignKey: 'banisher_id', primaryKey: 'id' })
		User.hasMany(models.Banneds, { as: 'banned', foreignKey: 'banned_id', primaryKey: 'id' })
		User.hasMany(models.Subscriptions, { as: 'user_subs', foreignKey: 'user_id', primaryKey: 'id' })
	}
	return User
}
