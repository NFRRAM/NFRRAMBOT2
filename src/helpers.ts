import { createMiddleware } from "hono/factory";
import { verifyKey } from "discord-interactions";

export const discordVerify = createMiddleware(async (c, next) => {
	const { req } = c;
    const { DISCORD_PUB_KEY } = c.env

    if (!DISCORD_PUB_KEY) {
        console.log("Discord public key not set")
        return c.json({err: "Discord public key not set"}, { status: 500 })
    }

	const timestamp = req.header('X-Signature-Timestamp');
	if (!timestamp) return c.json({err: "Timestamp not filled"}, { status: 403 })

	const signature = req.header('X-Signature-Ed25519');
	// console.log(c.json(req)) // comment this line after debugging, I need to know why I'm not getting a const signature -its because only discord sends it when verifying. idk why it isnt saved
	// - I guess it doesnt need to be saved. dunno why the endpoint is verified even without it
	if (!signature) return c.json({err: "Signature not filled"}, { status: 403 })

	const isValidRequest = await verifyKey(await req.text(), signature, timestamp, DISCORD_PUB_KEY)
	if (!isValidRequest) {
		return new Response(JSON.stringify({err: "Invalid Interaction Request"}), { status: 401, headers: {"Content-type": "application/json"} })
	}

	await next()
})
