import * as Interfaces from './interfaces';
import { InteractionResponseType } from 'discord-interactions';

/**
 * This function returns the value of the value key from the object with a
 * matching name key from a list containing the objects
 * NOTE : Will return a null value if the option is not required,
 * this should be handled when setting the payload to be sent
 * @param {String} name Value of the 'name' key the option has
 * @param {Array<Object>} list List of options
 * @returns Value of key 'value' of the option with the value of name parameter
 */
export const findObjValueFromObjList = (name: string, list: Interfaces.DiscordOption[]): string | number | boolean => {
	// if any is changed to Object it errors because obj may be undefined idk how or why
	const objValue = list.find((obj) => {
		// find is just better because obj.name is unique within the list
		return obj.name === name; // === matches type as well
	})!.value;
	return objValue;
};

/**
 * This function will be used to get the discord bot to send a message back to the channel
 * @param {String} msg Message to be sent by the discord bot
 * @returns Object containing the payload that Discord is expecting (custom type DiscordBotResponse)
 */
export const sendMessage = (msg: string): Interfaces.DiscordBotResponse => {
	// fix this type declaration
	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			tts: false,
			content: msg,
			embeds: [],
			allowed_mentions: { parse: [] },
		},
	};
};

export function findObjFromObjList(id: number, list: Array<any>) {
	// this function returns the object
	// with a matching ID key from a list containing the objects
	const objlist = list.filter(function (objects: any) {
		return objects.id === id;
	});
	return objlist[0];
}
