'use strict';
module.exports = (sequelize, DataTypes) => {
  const Premium_transactions = sequelize.define('Premium_transactions', {
    user_id: DataTypes.INTEGER,
    amount: DataTypes.FLOAT,
    currency_id: DataTypes.INTEGER,
    payment_method_id: DataTypes.INTEGER,
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    plan_id: DataTypes.INTEGER,
    payment_id: DataTypes.INTEGER,
    success: DataTypes.BOOLEAN
  }, {});
  Premium_transactions.associate = function(models) {
    Premium_transactions.belongsTo(models.Users, {as: 'users', foreignKey: 'user_id', sourceKey: 'id'})
    Premium_transactions.belongsTo(models.Currencies, { as: 'currency', foreignKey: 'currency_id', primaryKey: 'id' })
    Premium_transactions.belongsTo(models.Payment_methods, { as: 'paymentMethod', foreignKey: 'payment_method_id', primaryKey: 'id' })
    Premium_transactions.belongsTo(models.Types_transactions, { as: 'type', foreignKey: 'type_id', primaryKey: 'id' })
    Premium_transactions.belongsTo(models.Plans, { as: 'plan', foreignKey: 'plan_id', primaryKey: 'id' })
  };
  return Premium_transactions;
};
