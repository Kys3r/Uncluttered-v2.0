'use strict';
module.exports = (sequelize, DataTypes) => {
  const Free_sub_codes = sequelize.define('Free_sub_codes', {
    code: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    remaining_quantity: DataTypes.INTEGER,
    end_date: DataTypes.DATE,
    only_new_member: DataTypes.BOOLEAN,
    plan_id: DataTypes.INTEGER
  }, {});
  Free_sub_codes.associate = function(models) {
    Free_sub_codes.belongsTo(models.Plans, { as: 'subCode', foreignKey: 'plan_id', primaryKey: 'id' })
    Free_sub_codes.belongsToMany(models.Users, { through: 'Users_free_subs', as: 'free_sub', foreignKey: 'free_sub_id' })
  };
  return Free_sub_codes;
};
