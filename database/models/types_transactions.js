'use strict';
module.exports = (sequelize, DataTypes) => {
  const Types_transactions = sequelize.define('Types_transactions', {
    name: DataTypes.STRING
  }, {});
  Types_transactions.associate = function(models) {
	  Types_transactions.hasMany(models.Premium_transactions, {as: 'type', foreignKey: 'type_id', sourceKey: 'id'})
  };
  return Types_transactions;
};
