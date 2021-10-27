'use strict';
module.exports = (sequelize, DataTypes) => {
  const Maps = sequelize.define('Maps', {
    title: DataTypes.STRING,
    code_map: DataTypes.STRING,
    description_fr: DataTypes.TEXT,
    description_en: DataTypes.TEXT,
    link_trailer: DataTypes.STRING,
    path_1: DataTypes.STRING,
    path_2: DataTypes.STRING,
    path_3: DataTypes.STRING,
    patch: DataTypes.STRING,
    type_id: DataTypes.INTEGER
  }, {});
  Maps.associate = function(models) {
	  Maps.belongsTo(models.Type_maps, { as: 'type_map', foreignKey: 'type_id', primaryKey: 'id' });
	  Maps.belongsToMany(models.Users, { through: 'Liked_maps', as: 'liked_map', foreignKey: 'map_id' })
	  Maps.hasMany(models.Liked_maps, {as: 'nbLikes', foreignKey: 'map_id', sourceKey: 'id'});
  };
  return Maps;
};
