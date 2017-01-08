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
			} else if (intent == "food") {
				var food = res.get('food').value;
				session.privateConversationData.order = session.privateConversationData.order || [];
				session.beginDialog('/food', food);
			}else if (intent == "help") {
				session.beginDialog('/help');
			} else {
				session.send('Not sure what you mean');
			}
		})
		.catch(() => session.send('Message service not available'))
});


// Dialogs

bot.dialog('/help', (session) => {
	var help_msg = `
	This is HotDogBot, a chat bot for placing
	orders for Nasir's Hot Dog Stand. The
	following is a list of ways you can
	interact with the chat bot:

	Type 'What\'s on the menu' to view the 
	menu.

	Type 'I want [menu item]' to add a menu
	item to your order.

	Type 'What are the specials today' to see 
	the specials.
	`;
	session.send(help_msg);
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

bot.dialog('/food', [
	(session, args, next) => {
        if (!args) {
            builder.Prompts.text(session, "What would you like?");
        } else {
            next({ response: args });
        }
	},
	(session, results) => {
		var item = {
			"name": results.response,
			"price": 0.00
		};
		var order = session.privateConversationData.order;
		order.push(item);
		console.log(order);
	}
]);