'use strict';
module.exports = (sequelize, DataTypes) => {
  const Currencies = sequelize.define('Currencies', {
    name: DataTypes.STRING,
    alpha_code: DataTypes.STRING
  }, {});
  Currencies.associate = function(models) {
    Currencies.hasMany(models.Premium_transactions, {as: 'currency', foreignKey: 'currency_id', sourceKey: 'id'})
  };
  return Currencies;
};
