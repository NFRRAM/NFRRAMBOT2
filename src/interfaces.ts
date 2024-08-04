import { InteractionResponseType } from 'discord-interactions';

interface DiscordOption {
	name: string;
	value: string;
}

interface DiscordBotResponse {
	//this works for our usecase actually. discord embed structure is more complex i think
	type: InteractionResponseType;
	data: {
		tts: boolean;
		content: string;
		embeds: Array<any>; // fix this
		allowed_mentions: {
			parse: Array<any>; // fix this
		};
	};
}

interface Workspace {
	teams: [
		{
			id: string;
			name: string;
			color: string;
			avatar: string;
			members: [
				{
					user: {
						id: number;
						username: string;
						color: string;
						profilePicture: string;
					};
				}
			];
		}
	];
}

interface JikanTopAnimePayload {
	data: [
		{
			mal_id: number;
			url: string;
			images: {
				jpg: {
					image_url: string;
					small_image_url: string;
					large_image_url: string;
				};
				webp: {
					image_url: string;
					small_image_url: string;
					large_image_url: string;
				};
			};
			trailer: {
				youtube_id: string;
				url: string;
				embed_url: string;
			};
			approved: true;
			titles: [
				{
					type: string;
					title: string;
				}
			];
			title: string;
			title_english: string;
			title_japanese: string;
			title_synonyms: [string];
			type: string;
			source: string;
			episodes: number;
			status: string;
			airing: boolean;
			aired: {
				from: string;
				to: string;
				prop: {
					from: {
						day: number;
						month: number;
						year: number;
					};
					to: {
						day: number;
						month: number;
						year: number;
					};
					string: string;
				};
			};
			duration: string;
			rating: string;
			score: number;
			scored_by: number;
			rank: number;
			popularity: number;
			members: number;
			favorites: number;
			synopsis: string;
			background: string;
			season: string;
			year: number;
			broadcast: {
				day: string;
				time: string;
				timezone: string;
				string: string;
			};
			producers: [
				{
					mal_id: number;
					type: string;
					name: string;
					url: string;
				}
			];
			licensors: [
				{
					mal_id: number;
					type: string;
					name: string;
					url: string;
				}
			];
			studios: [
				{
					mal_id: number;
					type: string;
					name: string;
					url: string;
				}
			];
			genres: [
				{
					mal_id: number;
					type: string;
					name: string;
					url: string;
				}
			];
			explicit_genres: [
				{
					mal_id: number;
					type: string;
					name: string;
					url: string;
				}
			];
			themes: [
				{
					mal_id: number;
					type: string;
					name: string;
					url: string;
				}
			];
			demographics: [
				{
					mal_id: number;
					type: string;
					name: string;
					url: string;
				}
			];
		}
	];
	pagination: {
		last_visible_page: number;
		has_next_page: boolean;
		items: {
			count: number;
			total: number;
			per_page: number;
		};
	};
}

export type { Workspace, DiscordBotResponse, DiscordOption, JikanTopAnimePayload };
