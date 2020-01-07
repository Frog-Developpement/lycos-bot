const DBL = require("dblapi.js");

module.exports = class {
	constructor(client) {
		this.client = client;
	}

	async run() {
		const client = this.client;
		// If the token isn't a bot token the bot will logout.
		if(!client.user.bot) {
			return process.exit(1);
		}

		// Logs some information using the logger file
		console.log(`[Commands] - Loading a total of ${client.commands.size} command(s).`);
		client.logger.log(`${client.user.tag}. On ${client.guilds.size} server(s).`, "ready");

		// Update the game every 20s
		const games = [
			{
				name: `${client.config.prefix}help`,
				type: "STREAMING",
			},
			{
				name: `add me with ${client.config.prefix}invite!`,
				type: "STREAMING",
			},
		];
		let i = 0;

		setInterval(async function() {
			await client.user.setPresence({
				activity: {
					name: games[parseInt(i, 10)].name,
					type: games[parseInt(i, 10)].type,
				}, status: "dnd",
			});
			if(games[parseInt(i + 1)]) {i++;}
			else {i = 0;}
		}, 35000);
		if(client.config.apiTokens.dbl) {
			const dbl = new DBL(client.config.apiTokens.dbl, client);
			setInterval(async () => {
				Promise.all([ await client.shard.broadcastEval("this.guilds.size") ]).then((results) => {
					const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
					// Post DBL stats
					return dbl.postStats(totalGuilds);
				});
			}, 999000);
		}
	}
};