'use strict';
module.exports = (sequelize, DataTypes) => {
  const Penalization_reasons_reports = sequelize.define('Penalization_reasons_reports', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING,
    time_id: DataTypes.INTEGER
  }, {});
  Penalization_reasons_reports.associate = function(models) {
    Penalization_reasons_reports.hasMany(models.Reports, {as: 'report_reason', foreignKey: 'penalization_reason_id', sourceKey: 'id'});
    Penalization_reasons_reports.belongsTo(models.Times, {as: 'times_reports', foreignKey: 'time_id', sourceKey: 'id'});
  };
  return Penalization_reasons_reports;
};
