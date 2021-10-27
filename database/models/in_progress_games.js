'use strict';
module.exports = (sequelize, DataTypes) => {
  const in_progress_games = sequelize.define('In_progress_games', {
    game_id: DataTypes.INTEGER,
    player_a_id: DataTypes.INTEGER,
    player_b_id: DataTypes.INTEGER
  }, {});
  in_progress_games.associate = function(models) {};
  return in_progress_games;
};
