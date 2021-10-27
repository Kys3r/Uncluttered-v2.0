'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ranks_items = sequelize.define('Ranks_items', {
    name: DataTypes.STRING,
    price: DataTypes.INTEGER
  }, {});
  Ranks_items.associate = function(models) {
      Ranks_items.hasMany(models.Items, {as: 'rank_item', foreignKey: 'rank_item_id', sourceKey: 'id'});
  };
  return Ranks_items;
};
