const Command = require("../../base/Command.js");

class Role extends Command {
	constructor(client) {
		super(client, {
			name: "role",
			description: (language) => language.get("ROLE_DESCRIPTION"),
			usage: (language, prefix) => language.get("ROLE_USAGE", prefix),
			examples: (language, prefix) => language.get("ROLE_EXAMPLES", prefix),
			dirname: __dirname,
			enabled: true,
			guildOnly: true,
			permLevel: "Server Moderator",
			botPermissions: ["MANAGE_ROLES"],
			nsfw: false,
			adminOnly: false,
			cooldown: 1000,
		});
	}

	run(message, args) {
		try {
			if (!args[0]) {
				return message.channel.send(message.language.get("ROLE_INFO", message.settings.prefix));
			}
			const searchArgs = args[1];
			let { member } = message;
			if (args[0] === "add") {
				if (!args[1]) {return message.channel.send(message.language.get("ERROR_SPECIFY_USER"))}
				else {
					if (message.mentions.members.size > 0) {
						member = message.mentions.members.first();
					}
					else if (searchArgs) {
						member = message.bot.functions.fetchMembers(message.guild, searchArgs);
						if (member.size === 0) {message.channel.send(message.language.get("ERROR_NOUSER_FOUND"));}
						else if (member.size === 1) {member = member.first();}
						else {return message.channel.send(message.language.get("ERROR_MUCH_USERS_FOUND"));}
					}

					const role = message.guild.roles.find((r) => r.name === args.slice(2).join(" "));
					if (!role) {
						return message.channel.send(message.language.get("ERROR_ROLE_INVALID"));
					}
					else {
						return member.roles.add(role)
							.then(message.channel.send(message.language.get("ROLE_GIVE", member, role)))
							.catch((error) => message.channel.send(message.language.get("ERROR", error)));
					}
				}
			}
			if (args[0] === "remove") {
				if (!args[1]) {return message.channel.send(message.language.get("ERROR_SPECIFY_USER"))}
				else {
					if (message.mentions.members.size > 0) {
						member = message.mentions.members.first();
					}
					else if (searchArgs) {
						member = message.bot.functions.fetchMembers(message.guild, searchArgs);
						if (member.size === 0) return message.channel.send(message.language.get("ERROR_NOUSER_FOUND"));
						else if (member.size === 1) member = member.first();
						else return message.channel.send(message.language.get("ERROR_MUCH_USERS_FOUND"));
					}

					const role = message.guild.roles.find((r) => r.name === args.slice(2).join(" "));
					if (!role) {
						return message.channel.send(message.language.get("ERROR_ROLE_INVALID"));
					}
					else {
						return member.roles.remove(role)
							.then(message.channel.send(message.language.get("ROLE_REMOVE", member, role)))
							.catch((error) => message.channel.send(message.language.get("ERROR", error)));
					}
				}
			}
		}
		catch (error) {
			console.error(error);
			return message.channel.send(message.language.get("ERROR", error));
		}
	}
}

module.exports = Role;