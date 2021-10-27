'use strict';
module.exports = (sequelize, DataTypes) => {
  const Seasons = sequelize.define('Seasons', {
    chapter: DataTypes.INTEGER,
    season: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN,
  }, {});
  Seasons.associate = function(models) {
    Seasons.hasMany(models.Seasons_scores, {as: 'seasons', foreignKey: 'season_id', sourceKey: 'id'})
  };
  return Seasons;
};
