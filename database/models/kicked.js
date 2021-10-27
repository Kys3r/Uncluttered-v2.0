'use strict';
module.exports = (sequelize, DataTypes) => {
  const Kickeds = sequelize.define('Kickeds', {
    kicked_id: DataTypes.INTEGER,
    kicker_id: DataTypes.INTEGER,
    penalization_reason_id: DataTypes.INTEGER,
    comment: DataTypes.STRING,
    until: DataTypes.DATE
  }, {});
  Kickeds.associate = function(models) {
	  Kickeds.belongsTo(models.Users, { as: 'kicked', foreignKey: 'kicked_id', primaryKey: 'id' })
	  Kickeds.belongsTo(models.Users, { as: 'kicker', foreignKey: 'kicker_id', primaryKey: 'id' })
    Kickeds.belongsTo(models.Penalization_reasons, { as: 'kick_reason', foreignKey: 'penalization_reason_id', primaryKey: 'id' })
  };
  return Kickeds;
};
