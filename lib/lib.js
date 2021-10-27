module.exports = {
	isPassword(password)
	{
		return /^(?=(.*\d){2})(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*+-\\]{8,16}$/i.test(password)
	},

	subDays(date, days)
	{
		let tmp = date
		let newDate = tmp
		newDate.setDate(newDate.getDate() - days)
		return newDate
	},

	getWinRate(match, win)
	{
		return (Number((win / (match / 100)).toFixed(2)))
	},
	
	addMonths(date, months)
	{
		let tmp = date
		let d = tmp.getDate()
		tmp.setMonth(tmp.getMonth() + +months)
		if (tmp.getDate() != d)
			tmp.setDate(0)
		return tmp
	},

	subHours(date, hours)
	{
		let tmp = date
		let d = tmp.getDate()
		tmp.setHours(tmp.getHours() - hours);
		if (tmp.getDate() != d)
			tmp.setDate(0)
		return tmp
	}
}
