'use strict';
module.exports = (sequelize, DataTypes) => {
  const Sponsorships = sequelize.define('Sponsorships', {
    sponsor_id: DataTypes.INTEGER,
    sponsorised_id: DataTypes.INTEGER,
    sponsor_gift: DataTypes.INTEGER,
    sponsorised_gift: DataTypes.INTEGER
  }, {});
  Sponsorships.associate = function(models) {
    Sponsorships.belongsTo(models.Users, { as: 'sponsor', foreignKey: 'sponsor_id', primaryKey: 'id' })
    Sponsorships.belongsTo(models.Users, { as: 'sponsorised', foreignKey: 'sponsorised_id', primaryKey: 'id' })
  };
  return Sponsorships;
};
