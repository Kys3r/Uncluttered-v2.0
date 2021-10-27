'use strict';
module.exports = (sequelize, DataTypes) => {
  const Platform = sequelize.define('Platforms', {
    name: DataTypes.STRING,
    alpha_code: DataTypes.STRING
  }, {});
  Platform.associate = function(models) {
    Platform.hasMany(models.Users, {as: 'users', foreignKey: 'platform_id', sourceKey: 'id'});
  };
  return Platform;
};
