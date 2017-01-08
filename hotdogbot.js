const restify = require('restify');
const builder = require('botbuilder');
// const config = require('./config.js')

const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);

bot.dialog('/', function (session) {
	console.log(session.message.text);
});
