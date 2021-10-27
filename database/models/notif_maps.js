'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notif_maps = sequelize.define('Notif_maps', {
    user_id: DataTypes.INTEGER,
    map_id: DataTypes.INTEGER
  }, {});
  Notif_maps.associate = function(models) {};
  return Notif_maps;
};
