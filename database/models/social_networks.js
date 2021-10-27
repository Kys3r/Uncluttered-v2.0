'use strict';
module.exports = (sequelize, DataTypes) => {
  const Social_network = sequelize.define('Social_networks', {
    name: DataTypes.STRING
  }, {});
  Social_network.associate = function(models) {
    Social_network.belongsToMany(models.Users, {through: 'User_social_networks', as: 'user', foreignKey: 'social_network_id'});
  };
  return Social_network;
};
