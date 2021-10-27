'use strict';
module.exports = (sequelize, DataTypes) => {
  const Penalization_reasons_bans = sequelize.define('Penalization_reasons_bans', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING,
    time_id: DataTypes.INTEGER
  }, {});
  Penalization_reasons_bans.associate = function(models) {
    Penalization_reasons_bans.hasMany(models.Banneds, {as: 'ban_reason', foreignKey: 'penalization_reason_id', sourceKey: 'id'});
    Penalization_reasons_bans.belongsTo(models.Times, {as: 'times_bans', foreignKey: 'time_id', sourceKey: 'id'});
  };
  return Penalization_reasons_bans;
};
