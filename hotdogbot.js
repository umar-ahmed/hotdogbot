const restify = require('restify');
const builder = require('botbuilder');
const config = require('./config.js');
const menu = require('./menu.js');
const recast = require('recastai');
const recastClient = new recast.Client(config.recast);

//=========================================================
// Bot Setup
//=========================================================

// Connection to Microsoft Bot Framework
const connector = new builder.ChatConnector({
  appId: config.appId,
  appPassword: config.appPassword,
})
const bot = new builder.UniversalBot(connector)

// Server Init
const server = restify.createServer()
server.listen(80)
server.post('/', connector.listen())
/*
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);*/

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {
	// console.log(session.message.text);
	recastClient.textRequest(session.message.text)
		.then(res => {
			const intent = res.intent().slug;
			// console.log("Intent: %s", intent);

			if (intent == "greetings") {
				session.beginDialog('/profile');
			} else if (intent == "food") {
				if (res.get('food')) {
					var food = res.get('food').value;
					session.beginDialog('/food', food);
				} else {
					session.beginDialog('/food');
				}
			} else if (intent == "menu") {
				session.beginDialog('/menu');
			} else if (intent == "help") {
				session.beginDialog('/help');
			} else {
				session.send('Not sure what you mean');
			}
		})
		.catch(() => session.send('That\'s nice.'));
});


// Dialogs

bot.dialog('/help', [
	(session) => {
		var help_msgs = {
		"What\'s on the menu": "/menu",
		"I want food": "/food",
		};

		builder.Prompts.choice(session, "Choose one:", help_msgs);
	},
	(session, results) => {
		console.log(results.response);
	}
]);

bot.dialog('/profile', [
	(session, args, next) => {
		if (!session.userData.name) {
			builder.Prompts.text(session, 'Hi! What is your name?');
		} else {
			next({ response: session.userData.name });
		}
	},
	(session, results) => {
		session.userData.name = results.response;
		session.send('Hi ' +
			session.userData.name +
			". This is HotDogBot, a chat bot for placing orders for Nasir\'s Hot Dog Stand. Type \'help\' to see what I can do.");
		session.endDialog();
	}
]);

bot.dialog('/menu', (session) => {
	menu.forEach( (item) => {
		if (item.types && item.name != 'drinks') {
			item.types.forEach( (type) => { session.send(type + " " + item.name + ": $" + item.price)});
		} else {
			session.send(item.name + ": $" + item.price);
		}
	});
	session.endDialog();
});

bot.dialog('/food', [
	(session, args, next) => {
        if (!args) {
            builder.Prompts.text(session, "What would you like to add to your order?");
        } else {
            next({ response: args });
        }
	},
	(session, results) => {
		if (results.response && results.response != 'hot dog') {
			var item = {
				"name": results.response,
				"price": 0.00
			};
			var order = session.privateConversationData.order = session.privateConversationData.order || [];
			order.push(item);
			console.log(order);
			session.send("Added %s to your order. Would you like anything else?", results.response);
		}
	}
]);