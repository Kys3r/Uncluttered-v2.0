'use strict';
module.exports = (sequelize, DataTypes) => {
  const Platform_video = sequelize.define('Platform_video', {
    name: DataTypes.STRING
  }, {});
  Platform_video.associate = function(models) {};
  return Platform_video;
};
