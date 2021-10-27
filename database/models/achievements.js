'use strict';
module.exports = (sequelize, DataTypes) => {
  const Achievements = sequelize.define('Achievements', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING,
    description_fr: DataTypes.STRING,
    description_en: DataTypes.STRING,
    rank_id: DataTypes.INTEGER,
  	points_goal: DataTypes.INTEGER,
  	coins: DataTypes.INTEGER,
  	path_picture: DataTypes.STRING,
  	type_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER
  }, {});
  Achievements.associate = function(models) {
  	Achievements.belongsToMany(models.Users, {through: 'Users_achievements', as: 'user', foreignKey: 'achievement_id'})
  	Achievements.belongsTo(models.Ranks, { as: 'rank_achievement', foreignKey: 'rank_id', primaryKey: 'id' })
    Achievements.belongsTo(models.Achievements_categories, { as: 'category', foreignKey: 'category_id', primaryKey: 'id' })
  	Achievements.belongsTo(models.Types_stats, { as: 'type', foreignKey: 'type_id', primaryKey: 'id' })
  };
  return Achievements;
};
