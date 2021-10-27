'use strict';
module.exports = (sequelize, DataTypes) => {
  const Achievements_categories = sequelize.define('Achievements_categories', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING
  }, {});
  Achievements_categories.associate = function(models) {
    Achievements_categories.hasMany(models.Achievements, {as: 'category', foreignKey: 'category_id', sourceKey: 'id'})
  };
  return Achievements_categories;
};
