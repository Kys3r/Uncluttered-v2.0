'use strict';
module.exports = (sequelize, DataTypes) => {
  const Banneds = sequelize.define('Banneds', {
    banned_id: DataTypes.INTEGER,
    banisher_id: DataTypes.INTEGER,
    penalization_reason_id: DataTypes.INTEGER,
    comment: DataTypes.STRING,
  	until: DataTypes.DATE,
  	epic_id: DataTypes.STRING
  }, {});
  Banneds.associate = function(models) {
  	Banneds.belongsTo(models.Users, { as: 'banned', foreignKey: 'banned_id', primaryKey: 'id' })
  	Banneds.belongsTo(models.Users, { as: 'banisher', foreignKey: 'banisher_id', primaryKey: 'id' })
  	Banneds.belongsTo(models.Penalization_reasons_bans, { as: 'ban_reason', foreignKey: 'penalization_reason_id', primaryKey: 'id' })
  };
  return Banneds;
};
