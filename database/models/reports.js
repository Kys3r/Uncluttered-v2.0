'use strict';
module.exports = (sequelize, DataTypes) => {
  const Reports = sequelize.define('Reports', {
  	reporter_id: DataTypes.INTEGER,
  	reported_id: DataTypes.INTEGER,
  	comment: DataTypes.STRING,
  	penalization_reason_id: DataTypes.INTEGER
  }, {});
  Reports.associate = function(models) {
	  Reports.belongsTo(models.Users, { as: 'reporter', foreignKey: 'reporter_id', primaryKey: 'id' })
	  Reports.belongsTo(models.Users, { as: 'reported', foreignKey: 'reported_id', primaryKey: 'id' })
	  Reports.belongsTo(models.Penalization_reasons_reports, { as: 'report_reason', foreignKey: 'penalization_reason_id', primaryKey: 'id' })
  };
  return Reports;
};
