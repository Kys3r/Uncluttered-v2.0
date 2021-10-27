'use strict';
module.exports = (sequelize, DataTypes) => {
  const Server = sequelize.define('Servers', {
    name: DataTypes.STRING,
    alpha_code: DataTypes.STRING
  }, {});
  Server.associate = function(models) {
	  Server.hasMany(models.Users, {as: 'users', foreignKey: 'server_id', sourceKey: 'id'});
  };
  return Server;
};
