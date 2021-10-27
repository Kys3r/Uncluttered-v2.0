'use strict';
module.exports = (sequelize, DataTypes) => {
  const Headline = sequelize.define('Headlines', {
    type_article: DataTypes.STRING,
    article_id: DataTypes.INTEGER
  }, {});
  Headline.associate = function(models) {};
  return Headline;
};
