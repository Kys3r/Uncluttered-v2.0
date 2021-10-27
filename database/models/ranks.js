'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ranks = sequelize.define('Ranks', {
    name: DataTypes.STRING
  }, {});
  Ranks.associate = function(models) {
	  Ranks.hasMany(models.Achievements, {as: 'rank_achievement', foreignKey: 'rank_id', sourceKey: 'id'})
  };
  return Ranks;
};
