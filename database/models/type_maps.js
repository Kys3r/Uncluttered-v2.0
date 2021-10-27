'use strict';
module.exports = (sequelize, DataTypes) => {
  const Type_maps = sequelize.define('Type_maps', {
    name: DataTypes.STRING
  }, {});
  Type_maps.associate = function(models) {
	  Type_maps.hasMany(models.Maps, {as: 'map', foreignKey: 'type_id', sourceKey: 'id'});
  };
  return Type_maps;
};
