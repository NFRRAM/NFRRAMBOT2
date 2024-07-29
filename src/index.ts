import { Hono } from "hono";
import { InteractionResponseType, InteractionType} from "discord-interactions";
import { COMMAND_LIST } from "./commands"; // Modify commands here
import { discordVerify } from "./helpers"; // No need to look here

type Bindings = {
	DISCORD_APP_ID: string;
	DISCORD_TOKEN: string;
	DISCORD_PUB_KEY: string;
	GUILD_ID: string;
}

const DISCORD_BASE_URI = "https://discord.com/api";

// Consume the environment variables
const app = new Hono<{ Bindings: Bindings }>()

app.get("/setup", async (c) => {
	// Grab the secrets from the environment
	const { DISCORD_APP_ID, DISCORD_TOKEN, GUILD_ID } = c.env

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

	const body = await req.text()
	return c.text(JSON.stringify(body)) // c.json() handles serialization into JSON for us
	//^ changed to c.text just to show how it works - ram
	// also remove still testing COMMAND_LIST when we're done
})

app.get("/", c => c.json({ msg: "Rambot Interaction API Working" }))

//v moved this line here from line 15 in order to display the working message instead, but should still work(?) - ram -- nevermind it doesnt i moved it back. should look into how to fix the bot showing this 
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
			//check command name? -ram
			const { name } = data

			if (name == "test") {
				//send message
				return c.json({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						tts: false,
						content: "Congrats on sending your command!",
						embeds: [],
						allowed_mentions: { parse: [] }
					},
				})
			}
			if (name=="button") {
				//we use this space to work on the command for now, i cant get the other commands to register in discord for some reason
				let x : any
				const jikanreq = await fetch(`https://api.jikan.moe/v4/top/anime`)
				x = await jikanreq.json()
				console.log(x.data[0].titles[0])
				
				return c.json({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						tts: false,
						content: JSON.stringify(x.data[0].titles[0].title),
						embeds: [],
						allowed_mentions: { parse: [] }
					},
				})
				
				//make button, does nothing
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
										label: "Click me! TESTING2",
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
			if (name=="testbutton") {
				//make button, does nothing
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

	return c.json({ msg: "Default interaction return" }, { headers: { "Content-type": "application/json" } })
})

export default app