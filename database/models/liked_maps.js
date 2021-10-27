'use strict';
module.exports = (sequelize, DataTypes) => {
  const Liked_maps = sequelize.define('Liked_maps', {
    user_id: DataTypes.INTEGER,
    map_id: DataTypes.INTEGER
  }, {});
  Liked_maps.associate = function(models) {
    Liked_maps.belongsTo(models.Maps, { as: 'nbLikes', foreignKey: 'map_id', primaryKey: 'id' })
  };
  return Liked_maps;
};
