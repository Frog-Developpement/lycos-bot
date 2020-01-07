const Command = require("../../base/Command.js");
const moment = require("moment-timezone");
moment.locale('fr');
class ServerInformation extends Command {
	constructor(client) {
		super(client, {
			name: "server-info",
			description: (language) => language.get("SERVERINFO_DESCRIPTION"),
			usage: (language) => language.get("SERVERINFO_USAGE"),
			examples: (language) => language.get("SERVERINFO_EXAMPLES"),
			dirname: __dirname,
			enabled: true,
			guildOnly: true,
			aliases: ["serverinfo", "si"],
			botPermissions: ["EMBED_LINKS"],
			nsfw: false,
		});
	}

	run(message) {
		try {
			const verificationLevels = [
				"None",
				"Low",
				"Medium",
				"(╯°□°）╯︵  ┻━┻",
				"┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻",
			];
			const region = {
				"brazil": message.language.get("SERVERINFO_REGIONS")[0],
				"eu-central": message.language.get("SERVERINFO_REGIONS")[1],
				"singapore": message.language.get("SERVERINFO_REGIONS")[2],
				"us-central": message.language.get("SERVERINFO_REGIONS")[3],
				"sydney": message.language.get("SERVERINFO_REGIONS")[4],
				"us-east": message.language.get("SERVERINFO_REGIONS")[5],
				"us-south": message.language.get("SERVERINFO_REGIONS")[6],
				"us-west": message.language.get("SERVERINFO_REGIONS")[7],
				"eu-west": message.language.get("SERVERINFO_REGIONS")[8],
				"vip-us-east": message.language.get("SERVERINFO_REGIONS")[9],
				"london": message.language.get("SERVERINFO_REGIONS")[10],
				"amsterdam": message.language.get("SERVERINFO_REGIONS")[11],
				"hongkong": message.language.get("SERVERINFO_REGIONS")[12],
				"russia": message.language.get("SERVERINFO_REGIONS")[13],
				"southafrica": message.language.get("SERVERINFO_REGIONS")[14],
			};
			return message.channel.send({
				embed: {
					"color": message.config.embed.color,
					"author": {
						"name": message.language.get("SERVERINFO_PROFIL"),
						"icon_url": message.guild.iconURL,
					},
					"thumbnail": {
						"url": message.guild.iconURL,
					},
					"fields": [{
						"name": message.language.get("SERVERINFO_TITLES")[0],
						"value": message.guild.name,
						"inline": true,
					},
					{
						"name": message.language.get("SERVERINFO_TITLES")[1],
						"value": `${moment(message.channel.guild.createdAt.toUTCString()).format("LLLL")} (${message.bot.functions.checkDays(message.channel.guild.createdAt)}`,
						"inline": true,
					},
					{
						"name": message.language.get("SERVERINFO_TITLES")[2],
						"value": `${message.guild.members.size} | ${message.guild.members.filter((member) => !member.user.bot).size} | ${message.guild.members.filter((member) => member.user.bot).size}`,
						"inline": true,
					},
					{
						"name": message.language.get("SERVERINFO_TITLES")[3],
						"value": message.guild.channels.size,
						"inline": true,
					},
					{
						"name": message.language.get("SERVERINFO_TITLES")[4],
						"value": message.guild.id,
						"inline": true,
					},
					{
						"name": message.language.get("SERVERINFO_TITLES")[5],
						"value": `${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}`,
						"inline": true,
					},
					{
						"name": message.language.get("SERVERINFO_TITLES")[6],
						"value": region[message.guild.region],
						"inline": true,
					},
					{
						"name": message.language.get("SERVERINFO_TITLES")[7],
						"value": verificationLevels[message.guild.verificationLevel],
						"inline": true,
					},
					],
					"timestamp": new Date(),
					"footer": {
						"text": message.config.embed.footer,
					},
				},
			});
		}
		catch (error) {
			console.error(error);
			return message.channel.send(message.language.get("ERROR", error));
		}
	}
}

module.exports = ServerInformation;
