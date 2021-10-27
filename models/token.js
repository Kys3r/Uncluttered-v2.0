const	Sequelize = require('sequelize'),
			Models = require('../database/models'),
			Randtoken = require('rand-token')

module.exports =
{
	insertToken(id, data, type)
	{
		let user_id = id
		let token = this.generateToken(16)
		return Models.Tokens.create({user_id, token, data, type})
	},
	generateToken(char)
	{
		return Randtoken.generate(char)
	}
}
