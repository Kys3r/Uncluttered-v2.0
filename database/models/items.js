'use strict';
module.exports = (sequelize, DataTypes) => {
	const Items = sequelize.define('Items', {
		name_fr: DataTypes.STRING,
		name_en: DataTypes.STRING,
		description_fr: DataTypes.STRING,
		description_en: DataTypes.STRING,
		path_picture: DataTypes.STRING,
		options: DataTypes.JSONB,
		type_id: DataTypes.INTEGER,
		rank_item_id: DataTypes.INTEGER,
		premium_only: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		price: DataTypes.INTEGER
	}, {});
	Items.associate = function(models) {
		Items.belongsToMany(models.Users, { through: 'Users_items', as: 'user', foreignKey: 'item_id' });
		Items.belongsTo(models.Types_items, { as: 'type_item', foreignKey: 'type_id', primaryKey: 'id' })
		Items.belongsTo(models.Ranks_items, { as: 'rank_item', foreignKey: 'rank_item_id', primaryKey: 'id' })
	};
	return Items;
};
