'use strict';
module.exports = (sequelize, DataTypes) => {
  const Plans = sequelize.define('Plans', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING,
    month: DataTypes.INTEGER,
    price: DataTypes.FLOAT
  }, {});
  Plans.associate = function(models) {
    Plans.belongsToMany(models.Users, { through: 'Subscriptions', as: 'subscription', foreignKey: 'plan_id' })
    Plans.hasMany(models.Free_sub_codes, {as: 'subCode', foreignKey: 'plan_id', sourceKey: 'id'})
    Plans.belongsToMany(models.Users, { through: 'Subscriptions', as: 'plans', foreignKey: 'plan_id' })
    Plans.hasMany(models.Premium_transactions, {as: 'plan', foreignKey: 'plan_id', sourceKey: 'id'})
  };
  return Plans;
};
