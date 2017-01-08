const restify = require('restify');
const builder = require('botbuilder');
const config = require('./config.js')
const recast = require('recastai');
const recastClient = new recast.Client(config.recast)

const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);

bot.dialog('/', function (session) {
	// console.log(session.message.text);
	recastClient.textRequest(session.message.text)
		.then(res => {
			const intent = res.intent().slug;
			// console.log("Intent: %s", intent);

			if (intent == "greetings") {
				session.beginDialog('/profile');
			} else {
				session.send('Not sure what you mean');
			}
		})
		.catch(() => session.send('Message servive not available'))
});


bot.dialog('/profile', [
	function (session) {
		builder.Prompts.text(session, 'Hi! What is you name?');
	},
	function (session, results) {
		session.privateConversationData.name = results.response;
		session.send('Hi %s', session.privateConversationData.name);
		session.endDialog();
	}
]);