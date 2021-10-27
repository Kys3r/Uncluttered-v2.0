'use strict';
module.exports = (sequelize, DataTypes) => {
  const Types_stats = sequelize.define('Types_stats', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING
  }, {});
  Types_stats.associate = function(models) {
    Types_stats.hasMany(models.Achievements, {as: 'type', foreignKey: 'type_id', sourceKey: 'id'})
  };
  return Types_stats;
};
