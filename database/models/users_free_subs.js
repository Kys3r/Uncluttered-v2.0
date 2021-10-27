'use strict';
module.exports = (sequelize, DataTypes) => {
  const Users_free_subs = sequelize.define('Users_free_subs', {
    user_id: DataTypes.INTEGER,
    free_sub_id: DataTypes.INTEGER
  }, {});
  Users_free_subs.associate = function(models) {};
  return Users_free_subs;
};
