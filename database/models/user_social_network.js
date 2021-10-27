'use strict';
module.exports = (sequelize, DataTypes) => {
  const User_social_network = sequelize.define('User_social_networks', {
    user_id: DataTypes.INTEGER,
    social_network_id: DataTypes.INTEGER,
    link: DataTypes.STRING
  }, {});
  User_social_network.associate = function(models) {};
  return User_social_network;
};
