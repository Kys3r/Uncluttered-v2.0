'use strict';
module.exports = (sequelize, DataTypes) => {
  const Types_news = sequelize.define('Types_news', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING
  }, {});
  Types_news.associate = function(models) {
    Types_news.hasMany(models.Maps, {as: 'type_news', foreignKey: 'type_id', sourceKey: 'id'});
  };
  return Types_news;
};
