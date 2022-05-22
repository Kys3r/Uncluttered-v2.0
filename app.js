const 	express = require('express'),
		path = require('path'),
		cookieParser = require('cookie-parser'),
		logger = require('morgan'),
		bodyParser = require('body-parser'),
		app = express(),
		cors = require('cors'),
		session = require('express-session'),
		fileUpload = require('express-fileupload'),
		helmet = require('helmet'),
		MongoStore = require('connect-mongo')(session)

// Routes import
const	Index = require('./routes/index'),
		GoogleAuth = require('./routes/auth/googleAuth'),
		TwitterAPI = require('./routes/socials-api/twitterApi'),
		FacebookAuth = require('./routes/auth/facebookAuth'),
		DiscordAuth = require('./routes/auth/discordAuth'),
		Form = require('./routes/form/form'),
		Users = require('./routes/users'),
		Maps = require('./routes/maps'),
		Leaderboard = require('./routes/leaderboard'),
		Servers = require('./routes/servers'),
		Modes = require('./routes/modes'),
		Bot = require('./routes/bot'),
		News = require('./routes/news'),
		Achievements = require('./routes/achievements'),
		Items = require('./routes/items/items'),
		TypesItems = require('./routes/items/types-items'),
		Promotions = require('./routes/promotions'),
		PremiumPurchase = require('./routes/purchase/premium'),
		Search = require('./routes/search'),
		Penalizations = require('./routes/sanctions/penalizations'),
		PenalizationsBans = require('./routes/sanctions/penalizations_bans'),
		PenalizationsReports = require('./routes/sanctions/penalizations_reports'),
		Kicks = require('./routes/sanctions/kicks'),
		Bans = require('./routes/sanctions/bans'),
		Reports = require('./routes/sanctions/reports'),
		UsersRoles = require('./routes/roles/users-roles'),
		PremiumStats = require('./routes/premium/stats'),
		Mailing = require('./routes/mailing/mailing'),
		Times = require('./routes/times')

// AUTH
const	OAuth = require('./routes/auth/auth'),
		Passport = require('passport')

// Database
const db = require('./database/models/index')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser('42101confluence'))
app.use(bodyParser.urlencoded({extended: true, limit: '10mb', parameterLimit: 10000}))
app.use(bodyParser.json({limit: '10mb'}))
app.use(helmet())

if (process.env.NODE_ENV == "production")
{
	app.set('trust proxy', true);
}

app.use(cors())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods: PUT, DELETE, PATCH, POST, GET, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use(session({
    cookie: { maxAge: 36000000, secure: process.env.NODE_ENV == "production" ? true : false },
	store: process.env.NODE_ENV == "production" ? new MongoStore({url: 'mongodb://localhost:27017/token'}) : false,
    	secret: '42101confluence',
	resave: false,
	saveUninitialized: true
}))
app.use(Passport.initialize())
app.use(Passport.session())

// Route Oauth
app.use('/oauth', OAuth)
app.use('/google-auth', GoogleAuth)
app.use('/facebook-auth', FacebookAuth)
app.use('/discord-auth', DiscordAuth)

// Route External Api
app.use('/twitter-api', TwitterAPI)

app.use(fileUpload({
	limits: { fileSize: 10 * 1024 * 1024 }
}))

// Routes
app.use('/', Index)
app.use('/form', Form)
app.use('/users', Users)
app.use('/maps', Maps)
app.use('/leaderboard', Leaderboard)
app.use('/servers', Servers)
app.use('/modes', Modes)
app.use('/news', News)
app.use('/achievements', Achievements)
app.use('/items', Items)
app.use('/types-items', TypesItems)
app.use('/promotions', Promotions)
app.use('/search', Search)
app.use('/penalizations', Penalizations)
app.use('/penalizations-bans', PenalizationsBans)
app.use('/penalizations-reports', PenalizationsReports)
app.use('/kicks', Kicks)
app.use('/bans', Bans)
app.use('/reports', Reports)
app.use('/users-roles', UsersRoles)
app.use('/mailing', Mailing)
app.use('/times', Times)
app.use('/purchase/premium', PremiumPurchase)
app.use('/premium/stats', PremiumStats)
app.use('/bot', Bot)

app.get('/favicon.ico', (req, res) => res.status(204))

const Sub = require('./models/subscribtions')
Sub.isSub(1)

module.exports = app
