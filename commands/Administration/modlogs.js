const Command = require("../../base/Command.js");

class Modlogs extends Command {
	constructor(client) {
		super(client, {
			name: "setmodlogs",
			description: (language) => language.get("SETMODLOGS_DESCRIPTION"),
			usage: (language, prefix) => language.get("SETMODLOGS_USAGE", prefix),
			examples: (language, prefix) => language.get("SETMODLOGS_EXAMPLES", prefix),
			dirname: __dirname,
			enabled: true,
			guildOnly: true,
			permLevel: "Server Admin",
            botPermissions: ["SEND_MESSAGES"],
            aliases: ["modlogs", "setmlogs"],
			nsfw: false,
			adminOnly: true,
			cooldown: 1000,
		});
	}

	async run(message, args) {
		try {
			var sql = `SELECT *
					   FROM Guilds
					   WHERE guild_id="${message.guild.id}"`;
			var g;
			mysqlcon.query(sql, async function (err, result, fields) {
				g = result[0];
				var chan = args[0];
			if (!chan) {
				message.channel.send(message.language.get("SETMODLOGS_NO_ARGS", g)+"\n"+message.language.get("COMMAND_CANCEL"));
				chan = await message.bot.functions.awaitResponse(message);
			}
			if (chan.startsWith(message.prefix)) return;
			if (chan === "stop" || chan === "cancel") return message.channel.send(message.language.get("COMMAND_CANCELLED"));
			let c = message.guild.channels.resolve(chan) || message.guild.channels.resolveID(chan);
			let cid = c.toString().slice(2, c.toString().length -1) || c.id;
			if (isNaN(parseInt(cid)) || !message.guild.channels.cache.find(c => c.id === cid)) return message.channel.send(message.language.get("SETLOGS_ERROR_CHANNEL"));
			if (message.guild.channels.cache.get(`${cid}`).type !== "text") return message.channel.send(message.language.get("SETREPORTS_NOT_TEXT"));
			if (cid === g.modlogs_channel) {
                return message.channel.send(message.language.get("SETMODLOGS_SAME", cid))
            }
            mysqlcon.query("UPDATE Guilds SET modlogs_channel = ? WHERE guild_id = ?", [cid, message.guild.id]);
			return message.channel.send(message.language.get("SETMODLOGS_SUCCESS", cid));
		});
		}
		catch (error) {
			console.error(error);
			return message.channel.send(message.language.get("ERROR", error));
		}
	}
}

module.exports = Modlogs;
