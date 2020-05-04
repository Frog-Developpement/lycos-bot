const config = require('../config');
module.exports = class {
	constructor(client) {
		this.client = client;
	}

	async run(guild) {
		var sql = `SELECT *
		FROM Guilds
		WHERE guild_id="${guild.id}"`;
		var settings;
		mysqlcon.query(sql, async function (err, result, fields) {
			if (result.length === 0) {
				sql = `INSERT INTO Guilds (guild_id, guild_name, guild_owner, autorole)
					VALUES ("${guild.id}", "${guild.name}", "${guild.owner.user.tag}", "");`;
				mysqlcon.query(sql, function (err, result) {
					if (err) throw err;
				});
				sql = `SELECT *
				FROM Guilds
				WHERE guild_id="${guild.id}"`;
				mysqlcon.query(sql, function (err, result) {
					if (err) throw err;
					settings = result[0];
				});
			} else {
				settings = result[0];
			}
			const lang = new (require(`../languages/french.js`));
			const verificationLevels = {
				"NONE": "None",
				"LOW": "Low",
				"MEDIUM": "Medium",
				"HIGH": "(╯°□°）╯︵  ┻━┻",
				"VERY_HIGH": "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻",
			};
			const vl = verificationLevels[guild.verificationLevel];
			const regions = {
				"brazil": lang.get("SERVERINFO_REGIONS")[0],
				"eu-central": lang.get("SERVERINFO_REGIONS")[1],
				"singapore": lang.get("SERVERINFO_REGIONS")[2],
				"us-central": lang.get("SERVERINFO_REGIONS")[3],
				"sydney": lang.get("SERVERINFO_REGIONS")[4],
				"us-east": lang.get("SERVERINFO_REGIONS")[5],
				"us-south": lang.get("SERVERINFO_REGIONS")[6],
				"us-west": lang.get("SERVERINFO_REGIONS")[7],
				"eu-west": lang.get("SERVERINFO_REGIONS")[8],
				"vip-us-east": lang.get("SERVERINFO_REGIONS")[9],
				"london": lang.get("SERVERINFO_REGIONS")[10],
				"amsterdam": lang.get("SERVERINFO_REGIONS")[11],
				"hongkong": lang.get("SERVERINFO_REGIONS")[12],
				"russia": lang.get("SERVERINFO_REGIONS")[13],
				"southafrica": lang.get("SERVERINFO_REGIONS")[14],
				"europe": lang.get("SERVERINFO_REGIONS")[15],
			};
			const r = regions[guild.region];
			return guild.client.guilds.cache.get("697368051405815860").channels.cache.get("697379467689066558").send({
				embed: {
					title: lang.get(`LOGS_GUILD_CREATE_TITLE`, guild),
					description: lang.get('LOGS_GUILD_CREATE_DESC', guild, vl, r),
					footer: {
						text: config.embed.footer,
					},
					thumbnail: {
						url: guild.iconURL({ format: "png", dynamic: true }),
					},
					color: 0x21E61B,
				}
			});
		});
	}
};
