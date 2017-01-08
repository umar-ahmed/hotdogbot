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