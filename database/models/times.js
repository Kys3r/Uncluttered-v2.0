'use strict';
module.exports = (sequelize, DataTypes) => {
  const Times = sequelize.define('Times', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING,
    time: DataTypes.INTEGER
  }, {});
  Times.associate = function(models) {
    Times.hasMany(models.Penalization_reasons, { as: 'times', foreignKey: 'time_id', primaryKey: 'id' })
    Times.hasMany(models.Penalization_reasons_reports, { as: 'times_reports', foreignKey: 'time_id', primaryKey: 'id' })
    Times.hasMany(models.Penalization_reasons_bans, { as: 'times_bans', foreignKey: 'time_id', primaryKey: 'id' })
  };
  return Times;
};
