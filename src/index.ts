import { Hono } from "hono";
import { InteractionResponseType, InteractionType} from "discord-interactions";
import { COMMAND_LIST } from "./commands"; // Modify commands here
import { discordVerify } from "./helpers"; // No need to look here

type Bindings = {
	DISCORD_APP_ID: string;
	DISCORD_TOKEN: string;
	DISCORD_PUB_KEY: string;
	CLICKUP_TOKEN: string;
}

const DISCORD_BASE_URI = "https://discord.com/api";

// Consume the environment variables
const app = new Hono<{ Bindings: Bindings }>()

function findObjValueFromObjList(name : string, list : Array<any>){
	// this function returns the value of the value key from the object
	// with a matching name key from a list containing the objects
	const objlist = list.filter(function(objects : any) {
		return objects.name == `${name}`
	})
	return objlist[0].value
}

function findObjFromObjList(id : number, list : Array<any>){
	// this function returns the object
	// with a matching ID key from a list containing the objects
	const objlist = list.filter(function(objects : any) {
		return objects.id == `${id}`
	})
	return objlist[0]
}

app.get("/setup", async (c) => {
	// Grab the secrets from the environment
	const { DISCORD_APP_ID, DISCORD_TOKEN } = c.env

	// String formatting with variable values. NOTE: tilde instead of quote marks
	const url = `${DISCORD_BASE_URI}/v10/applications/${DISCORD_APP_ID}/commands`
	//edited URL to change scope to guild commands to see if it updates slash commands faster than application commands -ram
	//old URL (check docs) : `${DISCORD_BASE_URI}/v10/applications/${DISCORD_APP_ID}/commands`

	const req = await fetch(url, {
		method: "POST",
		/* We have to serialize the COMMANDS JS Object into JSON (JS -> JSON) using JSON.stringify() because it is going outward from our system. 
		We need to serialize into JSON whenever it is going out of our application, and deserialize (parse) into JSON when using it inside the application */
		body: JSON.stringify(COMMAND_LIST), 
		headers: {
			"Authorization": `Bot ${DISCORD_TOKEN}`,
			"Content-type": "application/json"
		}
	})

	// if (!req.ok) {
	// 	const err = await req.json()
	// 	console.error(err)
	// 	return c.text(JSON.stringify(req))
	// }

	const body = await req.text()
	return c.text(JSON.stringify(body)) // c.json() handles serialization into JSON for us
	//^ changed to c.text just to show how it works - ram
})

// This is to update the commands instead if we don't need to send a POST request
app.get("/update", async (c) => {
	// Grab the secrets from the environment
	const { DISCORD_APP_ID, DISCORD_TOKEN } = c.env

	// String formatting with variable values. NOTE: tilde instead of quote marks
	const url = `${DISCORD_BASE_URI}/v10/applications/${DISCORD_APP_ID}/commands`
	//edited URL to change scope to guild commands to see if it updates slash commands faster than application commands -ram
	//old URL (check docs) : `${DISCORD_BASE_URI}/v10/applications/${DISCORD_APP_ID}/commands`

	const req = await fetch(url, {
		method: "PUT",
		/* We have to serialize the COMMANDS JS Object into JSON (JS -> JSON) using JSON.stringify() because it is going outward from our system. 
		We need to serialize into JSON whenever it is going out of our application, and deserialize (parse) into JSON when using it inside the application */
		body: JSON.stringify(COMMAND_LIST), 
		headers: {
			"Authorization": `Bot ${DISCORD_TOKEN}`,
			"Content-type": "application/json"
		}
	})

	if (!req.ok) {
		const err = await req.json()
		console.error(err)
		return c.text("error 500")
	}

	const body = await req.text()
	return c.text(JSON.stringify(body)) // c.json() handles serialization into JSON for us
	//^ changed to c.text just to show how it works - ram
})

app.get("/", c => c.json({ msg: "nfrrambot Interaction API Working" }))

//v moved this line here from line 15 in order to display the working message instead, but should still work(?) - ram -- nevermind it doesnt i moved it back. should look into how to fix the bot showing this 
//fixed post-review by jm, also moved the above app.get line, it's only important that this is before the endpoint app.post
// Disregard this, not relevant as of the moment
app.use((c, next) => discordVerify(c, next))
//^

app.post("/", async (c) => {
	// console.log(c);
	
	// Get the Request object from the Context object (c.req)
	const { req } = c

	// Deserialize the body from JSON into a JS Object
	const body = await req.json()
	// console.log(body) 

	// Take the type field from the body
	const { type, data } = body

	// This is a one-liner "if" condition, you can use always use a block if you want to
	if (!type) return c.json({ error: "Missing type" }, { status: 400, headers: { "Content-type": "application/json" } })

	/* 
		Appropriate Documentation
		1. https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
		2. https://discord.com/developers/docs/interactions/message-components
	*/

	// Conditional processing based on Discord Interaction request field "type"
	switch (type) {
		case InteractionType.PING: {
			return c.json({
				type: InteractionResponseType.PONG
			})
		}
		case InteractionType.APPLICATION_COMMAND: {
			//check command name
			const { name } = data
			switch ( name ) {
				case ( 'test' ) : {
					//send message
					console.log(data)
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							tts: false,
							content: "Test works!",
							embeds: [],
							allowed_mentions: { parse: [] }
						},
					})
				}

				case ( 'top_anime' ) : {
					//fetches top anime from Jikan (MAL_API)
					const { value } = data.options[0]
					const jikanreq = await fetch(`https://api.jikan.moe/v4/top/anime`)
					const anime = await jikanreq.json() as any
					const topAnime = JSON.stringify(anime.data[value-1].titles[0].title) //gets the default title of the #n top anime
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							tts: false,
							content: `The number ${value} top anime is ${topAnime}`,
							embeds: [],
							allowed_mentions: { parse: [] }
						},
					})
				}
					
				case ( 'button' ) : {
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
											label: "Click me!",
											style: 1,
											custom_id: "click_one"
										}
									]
								}
							],
							embeds: [],
							allowed_mentions: { parse: [] }
						}
					})
				}

				case ( 'find_users' ) : {
					//finds available workspaces
					const { options } = data
					const team_id = findObjValueFromObjList('team_id',options)
					const { CLICKUP_TOKEN } = c.env
					const req = await fetch(
						'https://api.clickup.com/api/v2/team',
						{
							method : 'GET',
							headers : {
								Authorization : `${CLICKUP_TOKEN}`
							}
						}
					)
					const workspaces = await req.json() as any
					const workspace = findObjFromObjList(team_id,workspaces.teams)
					const { members } = workspace
					console.log(workspace)
					let msg = `Here are the users we found in the workspace with ID ${team_id}:\n`
					for (let i = 0; i < members.length; i++){
						msg = msg.concat(`${members[i].user.username} with ID number: ${members[i].user.id}\n`)
					}
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							tts: false,
							content: msg,
							embeds: [],
							allowed_mentions: { parse: [] }
						},
					})
				}

				case ( 'find_workspaces' ) : {
					//finds available workspaces
					const { CLICKUP_TOKEN } = c.env
					const req = await fetch(
						'https://api.clickup.com/api/v2/team',
						{
							method : 'GET',
							headers : {
								Authorization : `${CLICKUP_TOKEN}`
							}
						}
					)
					const workspaces = await req.json() as any
					const { teams } = workspaces
					let msg = 'Here are the workspaces we found using your ClickUp key:\n'
					for (let i = 0; i < teams.length; i++){
						msg = msg.concat(`${teams[i].name} with ID number ${teams[i].id}\n`)
					}
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							tts: false,
							content: msg,
							embeds: [],
							allowed_mentions: { parse: [] }
						},
					})
				}

				case ( 'find_spaces' ) : {
					//finds available spaces within a workspace (team)
					const query = new URLSearchParams({archived : 'false'}).toString()
					const { CLICKUP_TOKEN } = c.env
					const team_id = data.options[0].value
					const req = await fetch(
						`https://api.clickup.com/api/v2/team/${team_id}/space?${query}`,
						{
							method : 'GET',
							headers : {
								Authorization : `${CLICKUP_TOKEN}`
							}
						}
					)
					const spacelist = await req.json() as any
					const { spaces } = spacelist
					let msg = `Here are the spaces we found inside workspace ID ${team_id}:\n`
					for (let i = 0; i < spaces.length; i++){
						msg = msg.concat(`${spaces[i].name} with ID number: ${spaces[i].id}\n`)
					}
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							tts: false,
							content: msg,
							embeds: [],
							allowed_mentions: { parse: [] }
						},
					})
				}

				case ( 'find_folders' ) : {
					//finds available folders within a space
					const query = new URLSearchParams({archived : 'false'}).toString()
					const { CLICKUP_TOKEN } = c.env
					const space_id = data.options[0].value
					const req = await fetch(
						`https://api.clickup.com/api/v2/space/${space_id}/folder?${query}`,
						{
							method : 'GET',
							headers : {
								Authorization : `${CLICKUP_TOKEN}`
							}
						}
					)
					const folderlist = await req.json() as any
					const { folders } = folderlist
					let msg = `Here are the folders we found inside space ID ${space_id}:\n`
					for (let i = 0; i < folders.length; i++){
						msg = msg.concat(`${folders[i].name} with ID number: ${folders[i].id}\n`)
					}
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							tts: false,
							content: msg,
							embeds: [],
							allowed_mentions: { parse: [] }
						},
					})
				}

				case ( 'find_lists' ) : {
					//finds available lists, either using a folder or a space
					const { options } = data
					if (options[0].value) { // folderless is true
						const query = new URLSearchParams({archived : 'false'}).toString()
						const { CLICKUP_TOKEN } = c.env
						const space_id = findObjValueFromObjList('space_id',options)
						const req = await fetch(
							`https://api.clickup.com/api/v2/space/${space_id}/list?${query}`,
							{
								method : 'GET',
								headers : {
									Authorization : `${CLICKUP_TOKEN}`
								}
							}
						)
						const listlist = await req.json() as any
						const { lists } = listlist
						let msg = `Here are the folderless lists we found inside space ID ${space_id}:\n`
						for (let i = 0; i < lists.length; i++){
							msg = msg.concat(`${lists[i].name} with ID number: ${lists[i].id}\n`)
						}
						return c.json({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								tts: false,
								content: msg,
								embeds: [],
								allowed_mentions: { parse: [] }
							},
						})
					}

					else { // folderless is false
						const query = new URLSearchParams({archived : 'false'}).toString()
						const { CLICKUP_TOKEN } = c.env
						const folder_id = findObjValueFromObjList('folder_id',options)
						const req = await fetch(
							`https://api.clickup.com/api/v2/folder/${folder_id}/list?${query}`,
							{
								method : 'GET',
								headers : {
									Authorization : `${CLICKUP_TOKEN}`
								}
							}
						)
						const listlist = await req.json() as any
						const { lists } = listlist
						let msg = `Here are the lists we found inside folder ID ${folder_id}:\n`
						for (let i = 0; i < lists.length; i++){
							msg = msg.concat(`${lists[i].name} with ID number: ${lists[i].id}\n`)
						}
						return c.json({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								tts: false,
								content: msg,
								embeds: [],
								allowed_mentions: { parse: [] }
							},
						})
					}
				}

				case ( 'create_task' ) : {
					//make button, does nothing
					const { options } = data
					const list_id = findObjValueFromObjList('list_id',options)
					const task_name = findObjValueFromObjList('task_name',options)
					const task_desc = findObjValueFromObjList('task_desc',options)
					const { CLICKUP_TOKEN } = c.env
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
					const req = await fetch(
						//`https://api.clickup.com/api/v2/list/${list_id}/task?${query}`
						`https://api.clickup.com/api/v2/list/${list_id}/task`,
						{
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
								Authorization : `${CLICKUP_TOKEN}`,
							},
							body : JSON.stringify({
								name : `${task_name}`,
								description : `${task_desc}`,
								markdown_description : `${task_desc}`, // not sure what makes this different from description, might need to check that
								assignees : [183], //idk this was in the sample
								archived : false,
								group_assignees : []
							})
						}
					)
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
											label: "testbuttonworks...",
											style: 1,
											custom_id: "click_one"
										}
									]
								}
							],
							embeds: [],
							allowed_mentions: { parse: [] }
						}
					})
				}
			}
		}
	}

	return c.json({ msg: "Default interaction return" }, { headers: { "Content-type": "application/json" } })
})

export default app