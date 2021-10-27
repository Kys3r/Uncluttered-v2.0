'use strict';
module.exports = (sequelize, DataTypes) => {
  const Subscriptions = sequelize.define('Subscriptions', {
    user_id: DataTypes.INTEGER,
    plan_id: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE
  }, {});
  Subscriptions.associate = function(models) {
	   Subscriptions.belongsTo(models.Users, {as: 'user_subs', through: 'Users', foreignKey: 'user_id', targetKey: 'id'});
  };
  return Subscriptions;
};
