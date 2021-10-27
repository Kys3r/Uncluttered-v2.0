'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tokens = sequelize.define('Tokens', {
    user_id: DataTypes.INTEGER,
    token: DataTypes.STRING,
    data: DataTypes.STRING,
    type: DataTypes.STRING,
  }, {});
  Tokens.associate = function(models) {
	  Tokens.belongsTo(models.Users, { foreignKey: 'user_id' }, { primaryKey: 'id' })
  };
  return Tokens;
};
