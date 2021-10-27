'use strict';
module.exports = (sequelize, DataTypes) => {
  const Countries = sequelize.define('Countries', {
    name: DataTypes.STRING,
    alpha_code: DataTypes.STRING
  }, {});
  Countries.associate = function(models) {
    Countries.hasMany(models.Users, {as: 'users', foreignKey: 'country_id', sourceKey: 'id'});
  };
  return Countries;
};
