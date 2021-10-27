'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rewards = sequelize.define('Rewards', {
    name: DataTypes.STRING,
    reward: DataTypes.INTEGER
  }, {});
  Rewards.associate = function(models) {};
  return Rewards;
};
