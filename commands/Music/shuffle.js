const Command = require("../../base/Command.js");

class Shuffle extends Command {
    constructor(client) {
        super(client, {
            name: "shuffle",
            description: (language) => language.get("SHUFFLE_DESCRIPTION"),
            usage: (language, prefix) => language.get("SHUFFLE_USAGE", prefix),
            examples: (language, prefix) => language.get("SHUFFLE_EXAMPLES", prefix),
            dirname: __dirname,
            enabled: true,
            guildOnly: true,
            permLevel: "Server Moderator",
            aliases: ["random"],
            cooldown: 2000,
        });
    }

    async run(message) {
        try {
            let trackPlaying = message.bot.player.isPlaying(message.guild.id);
            if (!trackPlaying) {
                return message.channel.send(message.language.get("NOT_PLAYING"));
            }
            message.bot.player.shuffle(message.guild.id).then(() => {
                message.channel.send(message.language.get("SHUFFLED"));
           });
        }
        catch (error) {
            console.error(error);
            return message.channel.send(message.language.get("ERROR", error));
        }
    }
}

module.exports = Shuffle;