'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment_methods = sequelize.define('Payment_methods', {
    name: DataTypes.STRING
  }, {});
  Payment_methods.associate = function(models) {
    Payment_methods.hasMany(models.Premium_transactions, {as: 'paymentMethod', foreignKey: 'payment_method_id', sourceKey: 'id'})
  };
  return Payment_methods;
};
