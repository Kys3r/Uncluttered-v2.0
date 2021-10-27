'use strict';
module.exports = (sequelize, DataTypes) => {
	const User_achievements = sequelize.define('Users_achievements', {
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Users',
				key: 'id'
			},
			onUpdate: 'CASCADE',
			onDelete: 'SET NULL',
		},
		achievement_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Achievements',
				key: 'id'
			},
			onUpdate: 'CASCADE',
			onDelete: 'SET NULL',
		},
		is_notified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {});
	User_achievements.associate = function(models) {};
	return User_achievements;
};
