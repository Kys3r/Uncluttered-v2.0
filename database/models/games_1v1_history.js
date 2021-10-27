'use strict'
module.exports = (sequelize, DataTypes) => {
  const Games_history_1v1 = sequelize.define('Games_1v1_histories', {
    winner_id: DataTypes.INTEGER,
    season_id: DataTypes.INTEGER,
    mode_id: DataTypes.INTEGER,
    player_a_id: DataTypes.INTEGER,
    player_b_id: DataTypes.INTEGER,
    score_player_a: DataTypes.INTEGER,
    score_player_b: DataTypes.INTEGER,
    username_player_a: DataTypes.STRING,
    username_player_b: DataTypes.STRING
  }, {})
  Games_history_1v1.associate = function(models) {
    Games_history_1v1.belongsTo(models.Users, {as: 'winner', foreignKey: 'winner_id', sourceKey: 'id'})
    Games_history_1v1.belongsTo(models.Users, {as: 'playerA', foreignKey: 'player_a_id', sourceKey: 'id'})
    Games_history_1v1.belongsTo(models.Users, {as: 'playerB', foreignKey: 'player_b_id', sourceKey: 'id'})
    Games_history_1v1.belongsTo(models.Modes, {as: 'mode', foreignKey: 'mode_id', sourceKey: 'id'})
    Games_history_1v1.belongsTo(models.Seasons, {as: 'season', foreignKey: 'season_id', sourceKey: 'id'})
  }
  return Games_history_1v1
}
