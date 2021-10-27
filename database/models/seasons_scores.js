'use strict';
module.exports = (sequelize, DataTypes) => {
  const Seasons_scores = sequelize.define('Seasons_scores', {
    user_id: DataTypes.INTEGER,
    mode_id: DataTypes.INTEGER,
    server_id: DataTypes.INTEGER,
    season_id: DataTypes.INTEGER,
    elo: {
        type: DataTypes.INTEGER,
        defaultValue: 1099
    },
    winrate: {
        type: DataTypes.FLOAT,
        defaultValue: 0.00
    },
  }, {});
  Seasons_scores.associate = function(models) {
	  Seasons_scores.belongsTo(models.Users, { as: 'user', foreignKey: 'user_id', primaryKey: 'id' })
	  Seasons_scores.belongsTo(models.Modes, { as: 'mode', foreignKey: 'mode_id', primaryKey: 'id' })
	  Seasons_scores.belongsTo(models.Servers, { as: 'server', foreignKey: 'server_id', primaryKey: 'id' })
	  Seasons_scores.belongsTo(models.Seasons, { as: 'seasons', foreignKey: 'season_id', primaryKey: 'id' })
  };
  return Seasons_scores;
};
