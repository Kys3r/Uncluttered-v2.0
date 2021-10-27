'use strict';
module.exports = (sequelize, DataTypes) => {
  const Languages = sequelize.define('Languages', {
    name: DataTypes.STRING,
    alpha_code: DataTypes.STRING
  }, {});
  Languages.associate = function(models) {
    Languages.hasMany(models.Users, {as: 'users', foreignKey: 'language_id', sourceKey: 'id'});
  };
  return Languages;
};
