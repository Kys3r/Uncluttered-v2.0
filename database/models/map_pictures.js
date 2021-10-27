'use strict';
module.exports = (sequelize, DataTypes) => {
  const Map_pictures = sequelize.define('Map_pictures', {
    map_id: DataTypes.INTEGER,
    picture_id: DataTypes.INTEGER
  }, {});
  Map_pictures.associate = function(models) {};
  return Map_pictures;
};
