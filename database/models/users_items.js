'use strict';
module.exports = (sequelize, DataTypes) => {
  const Users_items = sequelize.define('Users_items', {
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
	  item_id: {
		  type: DataTypes.INTEGER,
		  allowNull: false,
		  references: {
			  model: 'Items',
			  key: 'id'
		  },
		  onUpdate: 'CASCADE',
		  onDelete: 'SET NULL',
	  }
  }, {});
  Users_items.associate = function(models) {
  };
  return Users_items;
};
