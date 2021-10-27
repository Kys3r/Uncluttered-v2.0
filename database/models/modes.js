'use strict';
module.exports = (sequelize, DataTypes) => {
  const Modes = sequelize.define('Modes', {
    name: DataTypes.STRING,
    is_ranked: DataTypes.INTEGER
  }, {});
  Modes.associate = function(models) {
    Modes.hasMany(models.Games_1v1_histories, {as: 'mode', foreignKey: 'mode_id', sourceKey: 'id' })
  };
  return Modes;
};
