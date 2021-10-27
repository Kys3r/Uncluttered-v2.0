'use strict';
module.exports = (sequelize, DataTypes) => {
  const Penalization_reasons = sequelize.define('Penalization_reasons', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING,
    time_id: DataTypes.INTEGER
  }, {});
  Penalization_reasons.associate = function(models) {
  	Penalization_reasons.hasMany(models.Kickeds, {as: 'kick_reason', foreignKey: 'penalization_reason_id', sourceKey: 'id'});
  	Penalization_reasons.belongsTo(models.Times, {as: 'times', foreignKey: 'time_id', sourceKey: 'id'});
  };
  return Penalization_reasons;
};
