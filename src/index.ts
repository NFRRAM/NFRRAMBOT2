import { Hono } from 'hono';
import { InteractionResponseType, InteractionType } from 'discord-interactions';
import { COMMAND_LIST } from './commands'; // Modify commands here
import { discordVerify } from './helpers'; // No need to look here
// import { parseBody } from 'hono/utils/body'; // apparently not used
import * as Interfaces from './interfaces';
import * as functions from './functions';
// import { renderToString } from 'hono/jsx/dom/server'; //idk where this came from

type Bindings = {
	DISCORD_APP_ID: string;
	DISCORD_TOKEN: string;
	DISCORD_PUB_KEY: string;
	CLICKUP_TOKEN: string;
};

const DISCORD_BASE_URI = 'https://discord.com/api';

// Consume the environment variables
const app = new Hono<{ Bindings: Bindings }>();

let anime_storage: number = 0;
//we'll use this to store data for any search_anime lookups? maybe?
let INTERACTION_TOKEN: string = '';
// might need to save it pala? i dont fuckin know

app.get('/setup', async (c) => {
	// Grab the secrets from the environment
	const { DISCORD_APP_ID, DISCORD_TOKEN } = c.env;

	// String formatting with variable values. NOTE: tilde instead of quote marks
	const url = `${DISCORD_BASE_URI}/v10/applications/${DISCORD_APP_ID}/commands`;
	//edited URL to change scope to guild commands to see if it updates slash commands faster than application commands -ram
	//old URL (check docs) : `${DISCORD_BASE_URI}/v10/applications/${DISCORD_APP_ID}/commands`

	const req = await fetch(url, {
		method: 'POST',
		/* We have to serialize the COMMANDS JS Object into JSON (JS -> JSON) using JSON.stringify() because it is going outward from our system. 
		We need to serialize into JSON whenever it is going out of our application, and deserialize (parse) into JSON when using it inside the application */
		body: JSON.stringify(COMMAND_LIST),
		headers: {
			Authorization: `Bot ${DISCORD_TOKEN}`,
			'Content-type': 'application/json',
		},
	});

	const body = await req.text();
	return c.text(JSON.stringify(body)); // c.json() handles serialization into JSON for us
	//^ changed to c.text just to show how it works - ram
});

// This is to update the commands instead if we don't need to send a POST request
// note: /update instead of /setup
app.get('/update', async (c) => {
	const { DISCORD_APP_ID, DISCORD_TOKEN } = c.env;
	const url = `${DISCORD_BASE_URI}/v10/applications/${DISCORD_APP_ID}/commands`;

	const req = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify(COMMAND_LIST),
		headers: {
			Authorization: `Bot ${DISCORD_TOKEN}`,
			'Content-type': 'application/json',
		},
	});

	if (!req.ok) {
		const err = await req.json();
		console.error(err);
		return c.text('error 500');
	}

	const body = await req.text();
	return c.text(JSON.stringify(body));
});

app.get('/', (c) => c.json({ msg: 'nfrrambot Interaction API Working' }));

//v moved this line here from line 15 in order to display the working message instead, but should still work(?) - ram -- nevermind it doesnt i moved it back. should look into how to fix the bot showing this
//fixed post-review by jm, also moved the above app.get line, it's only important that this is before the endpoint app.post
// Disregard this, not relevant as of the moment
app.use((c, next) => discordVerify(c, next));
//^

app.post('/', async (c) => {
	const { DISCORD_APP_ID, DISCORD_TOKEN } = c.env;
	// console.log(c);

	// Get the Request object from the Context object (c.req)
	const { req } = c;

	// Deserialize the body from JSON into a JS Object
	const body = await req.json();
	// console.log(body);

	// Take the type field from the body
	const { type, data } = body;

	// This is a one-liner "if" condition, you can use always use a block if you want to
	if (!type) return c.json({ error: 'Missing type' }, { status: 400, headers: { 'Content-type': 'application/json' } });

	/* 
		Appropriate Documentation
		1. https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
		2. https://discord.com/developers/docs/interactions/message-components
	*/

	// Conditional processing based on Discord Interaction request field "type"
	switch (type) {
		case InteractionType.PING: {
			return c.json({
				type: InteractionResponseType.PONG,
			});
		}
		case InteractionType.MESSAGE_COMPONENT: {
			const url = `${DISCORD_BASE_URI}/v10/webhooks/${DISCORD_APP_ID}/${INTERACTION_TOKEN}/messages/@original`;
			// console.log(INTERACTION_TOKEN);
			const { custom_id } = data;
			switch (custom_id) {
				case 'search_anime_yes': {
					// this part tries to use followup messages. doesnt work rn
					// const followup = await fetch(url, {
					// 	// this edits initial response
					// 	method: 'PATCH',
					// 	/* We have to serialize the COMMANDS JS Object into JSON (JS -> JSON) using JSON.stringify() because it is going outward from our system.
					// 			We need to serialize into JSON whenever it is going out of our application, and deserialize (parse) into JSON when using it inside the application */
					// 	body: JSON.stringify(functions.sendMessage(`testing`)),
					// 	headers: {
					// 		Authorization: `Bot ${DISCORD_TOKEN}`,
					// 		'Content-type': 'application/json',
					// 	},
					// });
					// const followup_body = await followup.text();
					// console.log(JSON.stringify(followup_body));
					// return c.json(followup_body);

					// This works, but idt it's a followup message technically
					// const query = new URLSearchParams({ id: `${anime_storage}` });
					const jikanreq = await fetch(`https://api.jikan.moe/v4/anime/${anime_storage}`);
					const anime = (await jikanreq.json()) as Interfaces.JikanSingleAnimePayload; //note this is a different interface
					const anime_name = JSON.stringify(anime.data.title); //gets the title of the anime
					const score = JSON.stringify(anime.data.score); //gets the score of the anime
					let synopsis = anime.data.synopsis; //gets the synopsis of the anime
					const msg = `Title: ${anime_name}. \n\nIt has a score of ${score} on MyAnimeList.\n\nSynopsis: ${synopsis}`;
					return c.json(functions.sendMessage(msg));
				}

				case 'search_anime_see_synopsis': {
					// Not using followup messages yet
					const jikanreq = await fetch(`https://api.jikan.moe/v4/anime/${anime_storage}`);
					const anime = (await jikanreq.json()) as Interfaces.JikanSingleAnimePayload; //note this is a different interface
					const synopsis = anime.data.synopsis; //gets the synopsis of the anime
					const msg = `Synopsis: ${synopsis}\n\nIs this the anime you were looking for?`;
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							tts: false,
							content: msg,
							components: [
								{
									type: 1,
									components: [
										{
											type: 2,
											label: 'Yes',
											style: 3,
											custom_id: 'search_anime_yes',
										},
										{
											type: 2,
											label: 'No',
											style: 4,
											custom_id: 'search_anime_no',
										},
									],
								},
							],
							embeds: [],
							allowed_mentions: { parse: [] },
						},
					});
				}

				case 'search_anime_no': {
					// Not using followup messages yet
					const msg = `Sorry nalang pre`;
					return c.json(functions.sendMessage(msg));
				}
			}
		}
		case InteractionType.APPLICATION_COMMAND: {
			//check command name
			const { name } = data;
			switch (name) {
				case 'test': {
					//send message
					console.log(typeof c);
					const msg = 'Test Successful!';
					return c.json(functions.sendMessage(msg));
				}

				case 'top_anime': {
					//fetches top anime from Jikan (MAL_API)
					const { options } = data;
					const n = functions.findObjValueFromObjList('n', options) ?? 1;
					const jikanreq = await fetch(`https://api.jikan.moe/v4/top/anime`);
					const anime = (await jikanreq.json()) as Interfaces.JikanMultiAnimePayload; // fix this
					const place = (n as number) - 1; //fix this n as number stuff, apparently bad practice, ideally maybe 3 different functions acc to jai
					const topAnime = JSON.stringify(anime.data[place].title_english); //gets the english title of the #n top anime
					const msg = `The number ${n} top anime is ${topAnime}`;
					return c.json(functions.sendMessage(msg));
				}

				case 'search_anime': {
					//testing, this tries to use followup messages. using the other identical case works but assumes the first result is correct.
					const { options } = data;
					const name = functions.findObjValueFromObjList('anime', options) ?? '';
					const query = new URLSearchParams({ q: name as string }); //fix this name as string stuff
					const jikanreq = await fetch(`https://api.jikan.moe/v4/anime?${query}`);
					const anime = (await jikanreq.json()) as Interfaces.JikanMultiAnimePayload; // might need to change this, check
					const closest_anime = JSON.stringify(anime.data[0].title); //gets the title of the closest anime
					const score = JSON.stringify(anime.data[0].score); //gets the score of the closest anime
					anime_storage = anime.data[0].mal_id;
					INTERACTION_TOKEN = body.token;
					const msg = `Did you mean ${closest_anime} with a score of ${score}?`;
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							tts: false,
							content: msg,
							components: [
								{
									type: 1,
									components: [
										{
											type: 2,
											label: 'Yes',
											style: 3,
											custom_id: 'search_anime_yes',
										},
										{
											type: 2,
											label: 'No',
											style: 4,
											custom_id: 'search_anime_no',
										},
										{
											type: 2,
											label: 'See Synopsis',
											style: 2,
											custom_id: 'search_anime_see_synopsis',
										},
									],
								},
							],
							embeds: [],
							allowed_mentions: { parse: [] },
						},
					});
				}

				case 'button': {
					//makes a button that does nothing
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							tts: false,
							components: [
								{
									type: 1,
									components: [
										{
											type: 2,
											label: 'Click me!',
											style: 1,
											custom_id: 'click_one',
										},
									],
								},
							],
							embeds: [],
							allowed_mentions: { parse: [] },
						},
					});
				}

				case 'find_users': {
					//finds available workspaces
					const { options } = data;
					const team_id = functions.findObjValueFromObjList('team_id', options) ?? 0;
					const { CLICKUP_TOKEN } = c.env;
					const req = await fetch('https://api.clickup.com/api/v2/team', {
						method: 'GET',
						headers: {
							Authorization: `${CLICKUP_TOKEN}`,
						},
					});
					const workspaces = (await req.json()) as Interfaces.Workspace;
					const workspace = functions.findObjFromObjList(team_id as number, workspaces.teams);
					const { members } = workspace;
					let msg = `Here are the users we found in the workspace with ID ${team_id}:\n`;
					for (let i = 0; i < members.length; i++) {
						msg = msg.concat(`${members[i].user.username} with ID number: ${members[i].user.id}\n`);
					}
					return c.json(functions.sendMessage(msg));
				}

				case 'find_workspaces': {
					//finds available workspaces
					const { CLICKUP_TOKEN } = c.env;
					const req = await fetch('https://api.clickup.com/api/v2/team', {
						method: 'GET',
						headers: {
							Authorization: `${CLICKUP_TOKEN}`,
						},
					});
					const workspaces = (await req.json()) as Interfaces.Workspace;
					const { teams } = workspaces;
					let msg = 'Here are the workspaces we found using your ClickUp key:\n';
					for (let i = 0; i < teams.length; i++) {
						msg = msg.concat(`${teams[i].name} with ID number ${teams[i].id}\n`);
					}
					return c.json(functions.sendMessage(msg));
				}

				case 'find_spaces': {
					//finds available spaces within a workspace (team)
					const { options } = data;
					const query = new URLSearchParams({ archived: 'false' }).toString();
					const { CLICKUP_TOKEN } = c.env;
					const team_id = functions.findObjValueFromObjList('team_id', options) ?? 0;
					const req = await fetch(`https://api.clickup.com/api/v2/team/${team_id}/space?${query}`, {
						method: 'GET',
						headers: {
							Authorization: `${CLICKUP_TOKEN}`,
						},
					});
					const spacelist = (await req.json()) as Interfaces.Space;
					const { spaces } = spacelist;
					let msg = `Here are the spaces we found inside workspace ID ${team_id}:\n`;
					for (let i = 0; i < spaces.length; i++) {
						msg = msg.concat(`${spaces[i].name} with ID number: ${spaces[i].id}\n`);
					}
					return c.json(functions.sendMessage(msg));
				}

				case 'find_folders': {
					//finds available folders within a space
					const { options } = data;
					const query = new URLSearchParams({ archived: 'false' }).toString();
					const { CLICKUP_TOKEN } = c.env;
					const space_id = functions.findObjValueFromObjList('space_id', options) ?? 0;
					const req = await fetch(`https://api.clickup.com/api/v2/space/${space_id}/folder?${query}`, {
						method: 'GET',
						headers: {
							Authorization: `${CLICKUP_TOKEN}`,
						},
					});
					const folderlist = (await req.json()) as Interfaces.Folder;
					const { folders } = folderlist;
					let msg = `Here are the folders we found inside space ID ${space_id}:\n`;
					for (let i = 0; i < folders.length; i++) {
						msg = msg.concat(`${folders[i].name} with ID number: ${folders[i].id}\n`);
					}
					return c.json(functions.sendMessage(msg));
				}

				case 'find_lists': {
					//finds available lists, either using a folder or a space
					const { options } = data;
					const folderless = functions.findObjValueFromObjList('folderless', options) ?? false;
					if (folderless) {
						// folderless is true
						const query = new URLSearchParams({ archived: 'false' }).toString();
						// This is from ClickUp Example ^
						const { CLICKUP_TOKEN } = c.env;
						const space_id = functions.findObjValueFromObjList('space_id', options) ?? 0;
						const req = await fetch(`https://api.clickup.com/api/v2/space/${space_id}/list?${query}`, {
							method: 'GET',
							headers: {
								Authorization: `${CLICKUP_TOKEN}`,
							},
						});
						const listlist = (await req.json()) as any; // fix this
						const { lists } = listlist;
						let msg = `Here are the folderless lists we found inside space ID ${space_id}:\n`;
						for (let i = 0; i < lists.length; i++) {
							msg = msg.concat(`${lists[i].name} with ID number: ${lists[i].id}\n`);
						}
						return c.json(functions.sendMessage(msg));
					} else {
						// folderless is false
						const query = new URLSearchParams({ archived: 'false' }).toString();
						const { CLICKUP_TOKEN } = c.env;
						const folder_id = functions.findObjValueFromObjList('folder_id', options) ?? 0;
						if (!folder_id) {
						}
						const req = await fetch(`https://api.clickup.com/api/v2/folder/${folder_id}/list?${query}`, {
							method: 'GET',
							headers: {
								Authorization: `${CLICKUP_TOKEN}`,
							},
						});
						const listlist = (await req.json()) as any;
						const { lists } = listlist;
						let msg = `Here are the lists we found inside folder ID ${folder_id}:\n`;
						for (let i = 0; i < lists.length; i++) {
							msg = msg.concat(`${lists[i].name} with ID number: ${lists[i].id}\n`);
						}
						return c.json(functions.sendMessage(msg));
					}
				}

				case 'create_task': {
					//creates task
					const { options } = data;
					const list_id = functions.findObjValueFromObjList('list_id', options);
					console.log(list_id);
					const task_name = functions.findObjValueFromObjList('task_name', options);
					// console.log(task_name)
					const task_desc = functions.findObjValueFromObjList('task_desc', options);
					// console.log(task_desc)
					const { CLICKUP_TOKEN } = c.env;
					/*
					v from ClickUp Docs, need to look up wtf custom task ids are for and
					why i need to put the team id
					oh my god i just realized its probably because it needs to make sure
					that it's the only one in the workspace
					*/
					// const query = new URLSearchParams({
					// 	custom_task_id : 'true',
					// 	team_id : '123'
					// }).toString()
					const assignees = functions.findObjValueFromObjList('assignees', options);
					let assignee_list: Array<string | number> = (assignees as string).split(',');
					for (let i = 0; i < assignee_list.length; i++) {
						assignee_list[0] = Number(assignee_list[0]);
					}
					const due_date = functions.findObjValueFromObjList('due_date', options);
					const due_date_unix = parseInt((new Date(due_date as string).getTime() / 1000).toFixed(0)); // this actually converts to unix timestamp supposedly
					const start_date = functions.findObjValueFromObjList('start_date', options);
					const start_date_unix = parseInt((new Date(start_date as string).getTime() / 1000).toFixed(0)); // this actually converts to unix timestamp supposedly
					const tag_names = functions.findObjValueFromObjList('tag_names', options);
					let tag_list: Array<string | number> = (tag_names as string).split(',');
					for (let i = 0; i < tag_list.length; i++) {
						tag_list[0] = Number(tag_list[0]);
					}
					const status_name = functions.findObjValueFromObjList('status_name', options);
					const priority = functions.findObjValueFromObjList('priority', options);
					const sprint_points = functions.findObjValueFromObjList('sprint_points', options);

					const req = await fetch(
						//`https://api.clickup.com/api/v2/list/${list_id}/task?${query}`
						`https://api.clickup.com/api/v2/list/${list_id}/task`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `${CLICKUP_TOKEN}`,
							},
							body: JSON.stringify({
								// check https://clickup.com/api/developer-portal/tasks/#tasks
								name: task_name ?? '',
								description: task_desc ?? '',
								markdown_description: task_desc ?? '', // not sure what makes this different from description, might need to check that
								// it's for using markdown language for bold and italics and such - ram
								assignees: assignee_list ?? [], // there might be a better way to do this on discord side, but idk. read more docs
								group_assignees: [], // i dont know what this is, ask JM
								tags: tag_list ?? [],
								status: status_name ?? '',
								priority: priority ?? 4,
								due_date: due_date_unix ?? 0,
								due_date_time: false,
								time_estimate: 8640000, // idk wtf this does
								start_date: start_date_unix ?? 0,
								start_date_time: false,
								points: sprint_points ?? 1, // check https://clickup.com/api/clickupreference/operation/CreateTask/
								// we needed to enable a clickup app here specifically. might need to change?
								notify_all: true,
								parent: null,
								links_to: null,
								check_required_custom_fields: false, // do we need to change this idk
								// custom_fields : [
								// 	{
								// 		id: ,
								//		value : 'This is a string of text added to a Custom Field.'
								// 	}
								// ]
							}),
						}
					);
					const response = await req.json();
					console.log(response);
					return c.json(functions.sendMessage('Task Created! Check ClickUp.'));
				}
			}
		}
	}

	return c.json({ msg: 'Default interaction return' }, { headers: { 'Content-type': 'application/json' } });
});

export default app;
