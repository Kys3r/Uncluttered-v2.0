'use strict';
module.exports = (sequelize, DataTypes) => {
  const Shop_items = sequelize.define('Shop_items', {
    name_fr: DataTypes.STRING,
    name_en: DataTypes.STRING,
    description_fr: DataTypes.STRING,
    description_en: DataTypes.STRING,
    price: DataTypes.FLOAT,
    nb_purchased: DataTypes.INTEGER,
    path_1: DataTypes.STRING,
    path_2: DataTypes.STRING,
    path_3: DataTypes.STRING
  }, {});
  Shop_items.associate = function(models) {};
  return Shop_items;
};
