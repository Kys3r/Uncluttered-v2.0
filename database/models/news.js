'use strict';
module.exports = (sequelize, DataTypes) => {
  const News = sequelize.define('News', {
    title_fr: DataTypes.STRING,
    title_en: DataTypes.STRING,
    section_fr: DataTypes.TEXT,
    section_en: DataTypes.TEXT,
    path_1: DataTypes.STRING,
    path_2: DataTypes.STRING,
    path_3: DataTypes.STRING,
    type_id: DataTypes.INTEGER
  }, {});
  News.associate = function(models) {
	  News.belongsTo(models.Types_news, { as: 'type_news', foreignKey: 'type_id', primaryKey: 'id' });
  };
  return News;
};
