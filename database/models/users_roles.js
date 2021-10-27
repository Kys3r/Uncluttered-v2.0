'use strict';
module.exports = (sequelize, DataTypes) => {
  const Users_roles = sequelize.define('Users_roles', {
	  user_id: {
  		type: DataTypes.INTEGER,
  		allowNull: false,
  		references: {
  			model: 'Users',
  			key: 'id'
  		},
  		onUpdate: 'CASCADE',
  		onDelete: 'SET NULL',
  	},
  	role_id: {
  		type: DataTypes.INTEGER,
		defaultValue: 4,
  		references: {
  			model: 'Roles',
  			key: 'id'
  		},
  		onUpdate: 'CASCADE',
  		onDelete: 'SET NULL',
  	}
  }, {});
  Users_roles.associate = function(models) {};
  return Users_roles;
};
