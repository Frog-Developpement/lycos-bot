module.exports = class {
	constructor(client) {
		this.client = client;
	}

	async run() {
		try {
			const WebHookListener = require('twitch-webhooks').default;
			const TwitchClient = require('twitch').default;
			const portfinder = require('portfinder');
			const client = this.client;
			// If the token isn't a bot token the bot will logout.
			if (!client.user.bot) {
				return process.exit(1);
			}
			// Logs some information using the logger file
			console.log(`[Commands] - Loading a total of ${client.commands.size} command(s).`);
			var guilds = client.shard ? await client.shard.broadcastEval("this.guilds.cache.size") : client.guilds.cache.size;
			if (guilds instanceof Array) {
				guilds = guilds.reduce((sum, val) => sum + val, 0);
			}
			client.logger.log(`${client.user.tag}. On ${guilds} server(s) divided in ${client.shard.count} shards.`, "ready");

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

			setInterval(async function () {
				try {
					await client.user.setPresence({
						activity: {
							name: games[parseInt(i, 10)].name,
							type: games[parseInt(i, 10)].type,
						}, status: "dnd",
					});
					if (games[parseInt(i + 1)]) { i++; }
					else { i = 0; }
				} catch (error) {
					return console.log(error);
				}

			}, 35000);
			client.connection_mysql = require('../utils/connectmysql');
			client.connection_mysql.init();

			setInterval(async () => {
				try {
					var freePort = await portfinder.getPort(function (err, port) {
						return port;
					});
					const clientId = 'TwitchClientID';
					const clientSecret = 'TwitchClientSecret';
					const twitchClient = TwitchClient.withClientCredentials(clientId, clientSecret);
					const listener = await WebHookListener.create(twitchClient, { port: freePort });
					listener.listen();
					var sql = `SELECT *
							   FROM Guilds
							   WHERE guild_id="697368051405815860"`;
					var stock_guild;
					mysqlcon.query(sql, async function (err, result, fields) {
						if (err) throw err;
						stock_guild = result[0];
						const ids = stock_guild.stream_check.split("/");
						const subscriptions = await subscribeToMultipleUsersStreamChanges(ids, listener, async (stream, userId) => {
							try {
								if (stream) {
									console.log(stream);
									sql = `SELECT *
											FROM Streams
											WHERE streamer='${userId}'`;
									mysqlcon.query(sql, async function (err, r, fields) {
										if (err) throw err;
										//if (r[0].state === 0) {
										const game = await twitchClient.helix.games.getGameById(stream._data.game_id);
										var sql = `SELECT *
											   FROM Guilds
											   WHERE streamers_ids LIKE '%${userId}%'`;
										mysqlcon.query(sql, async function (err, result, fields) {
											if (err) throw err;
											try {
												for (let index = 0; index < result.length; index++) {
													var element = result[index].twitch_channel;
													var language = new (require(`../languages/${result[index].language}.js`));
													if (element !== null) {
														var gid = client.channels.cache.get(element).guild.id;
														var g;
														if (gid !== null) {
															g = client.guilds.cache.get(gid);
														}
														if (g === undefined) return console.log("Error ready.js | L.100 --> g === undefined");
														sql = `SELECT *
											   				FROM Streams
											   				WHERE streamer='${userId}'`;
														mysqlcon.query(sql, async function (err, res, fields) {
															if (err) throw err;
															if ((res[0].title === null ? res[0].title : res[0].title.toString()) !== stream._data.title) {
																await mysqlcon.query("UPDATE Streams SET title = ? WHERE streamer = ?", [stream._data.title, userId]);
																if (res[0].state !== 0) {
																	return client.channels.cache.get(element).send(language.get("STREAM_TILTE_CHANGED", stream._data.user_name, stream._data.title));
																}
															}
															if (res[0].game !== game._data.id) {
																await mysqlcon.query("UPDATE Streams SET game = ? WHERE streamer = ?", [game._data.id, userId]);
																if (res[0].state !== 0) {
																	var oldGame = await twitchClient.helix.games.getGameById(res[0].game);
																	return client.channels.cache.get(element).send(language.get("STREAM_GAME_CHANGED", stream._data.user_name, oldGame._data.name, game._data.name));
																}
															}
															if (res[0].state === 0) {
																mysqlcon.query("UPDATE Streams SET state = ? WHERE streamer = ?", [true, userId]);
																var user = await twitchClient.helix.users.getUserById(userId);
																client.channels.cache.get(element).send(result[index].stream_annonce.toString('utf-8').replace("{streamer}", `${stream._data.user_name}`));
																return client.channels.cache.get(element).send({
																	embed: {
																		author: {
																			name: stream._data.user_name,
																			icon_url: user._data.profile_image_url,
																		},
																		title: stream._data.title,
																		url: `https://twitch.tv/${stream._data.user_name.toLowerCase()}`,
																		fields: [
																			{
																				name: language.get("STREAM_EMBED_TITLES")[0],
																				value: game === null ? language.get("STREAM_NO_GAME") : game._data.name,
																				inline: true
																			},
																			{
																				name: language.get("STREAM_EMBED_TITLES")[1],
																				value: stream._data.viewer_count,
																				inline: true
																			},
																			{
																				name: language.get("STREAM_EMBED_TITLES")[2],
																				value: language.get("STREAM_STARTEDAT", stream._data.started_at),
																			},
																		],
																		/*video: {
																			height: 378,
																			url: `https://player.twitch.tv/?channel=leptitmetalleux&player=facebook&autoplay=true&parent=meta.tag`,
																			width: 620,
																		},*/
																		image: {
																			url: stream._data.thumbnail_url.toString().replace("{width}", "1980").replace("{height}", "1080"),
																			width: 1920,
																			height: 1080,
																		},
																		color: 0x6441a5,
																		thumbnail: {
																			url: game === null ? null : game._data.box_art_url.toString().replace("{width}", "188").replace("{height}", "250"),
																			width: 188,
																			height: 250,
																		},
																	}
																});
															}
														});
													};
												}
											} catch (error) {
												return console.log(error);
											}
										});
										//}
									});

								} else {
									// no stream, no display name
									sql = `SELECT *
											FROM Streams
											WHERE streamer='${userId}'`;
									mysqlcon.query(sql, async function (err, res, fields) {
										if (err) throw err;
										if (res[0].state === 1) {
											mysqlcon.query("UPDATE Streams SET state = ? WHERE streamer = ?", [false, userId]);
											const user = await twitchClient.helix.users.getUserById(userId);
											sql = `SELECT *
													FROM Guilds
													WHERE streamers_ids LIKE '%${userId}%'`;
											mysqlcon.query(sql, async function (err, result, fields) {
												if (err) throw err;
												for (let index = 0; index < result.length; index++) {
													var element = result[index].twitch_channel;
													var language = new (require(`../languages/${result[index].language}.js`));
													if (element !== null) client.channels.cache.get(element).send(language.get("STREAM_ENDED", user._data.display_name));
												}
											});
										}
									});

								}
							} catch (error) {
								return console.log(error);
							}

						});
					});
				} catch (error) {
					return console.error(error);
				}

			}, 60000);

			async function subscribeToMultipleUsersStreamChanges(arr, listener, callback) {
				try {
					return Promise.all(
						arr.map((userId, index) => listener.subscribeToStreamChanges(userId, (stream) => callback(stream, userId)))
					).catch(error => {
						return console.error(error);
					});
				} catch (error) {
					return console.error(error);
				}
			}
		} catch (error) {
			return console.log(error);
		}

	}
};
