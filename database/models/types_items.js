'use strict';
module.exports = (sequelize, DataTypes) => {
  const Types_items = sequelize.define('Types_items', {
    name: DataTypes.STRING
  }, {});
  Types_items.associate = function(models) {
    Types_items.hasMany(models.Items, {as: 'type_item', foreignKey: 'type_id', sourceKey: 'id'});
  };
  return Types_items;
};
