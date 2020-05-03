const Command = require("../../base/Command.js");

class Report extends Command {
	constructor(client) {
		super(client, {
			name: "report",
			description: (language) => language.get("AVATAR_DESCRIPTION"),
			usage: (language, prefix) => language.get("AVATAR_USAGE", prefix),
			examples: (language, prefix) => language.get("AVATAR_EXAMPLES", prefix),
			dirname: __dirname,
			enabled: true,
			guildOnly: false,
			permLevel: "User",
            botPermissions: ["EMBED_LINKS"],
            aliases: ["signal"],
			nsfw: false,
			adminOnly: false,
			cooldown: 50000,
		});
	}

	async run(message, args) {
		try {
            const g = await message.bot.functions.getDataGuild(message.guild);
            if (g.channels.reports === null){
                return message.channel.send(message.language.get("REPORT_NOT_SET"))
            }
            const searchArgs = args[0];
            if(!searchArgs){
                return message.reply(message.language.get("REPORT_ERRORARGS"))
            }
            let member;
			if (message.mentions.members.size > 0) {member = message.mentions.members.first();}
			else if (searchArgs) {
				member = message.bot.functions.fetchMembers(message.guild, searchArgs);
				if (member.size === 0) return message.channel.send(message.language.get("ERROR_NOUSER_FOUND"));
				else if (member.size === 1) member = member.first();
				else return message.channel.send(message.language.get("ERROR_MUCH_USER_FOUND"));
            }
            if (member === message.member) return message.channel.send(message.language.get("REPORT_SAMEUSER"))
            let reason = args.slice(1).join(" ");
            if (!reason) {
                return message.channel.send(message.language.get("REPORT_NOREASON"))
            }
            message.delete();
            return message.guild.channels.cache.find(c => c.id === g.channels.reports).send({
                embed: {
                    color: message.config.embed.color,
                    author: {
						name: message.language.get("REPORT_TITLE") + message.author.username,
                        icon_url: message.author.displayAvatarURL({format: "png", dynamic: true}),
                    },
                    thumbnail: {
                        url: member.user.displayAvatarURL(),
                    },
                    fields: [
                        {
                            name: message.language.get("REPORT_NAME", member),
                            value: reason
                        },
                    ],
                }
            })
		}
		catch (error) {
			console.error(error);
			return message.channel.send(message.language.get("ERROR", error));
		}
	}
}

module.exports = Report;