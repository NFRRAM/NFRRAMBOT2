const BUTTON = {
	name: 'button',
	description: 'Creates a button',
	options: [
		/*
            {
                type: 1,
                name: "option",
                description: "button option"
            }
        */
	],
};

const TOP_ANIME = {
	name: 'top_anime',
	description: 'Fetches the nth top anime from Jikan (MAL API)',
	options: [
		{
			name: 'n',
			description: 'The #n top anime',
			type: 4,
			required: true,
		},
	],
};

const SEARCH_ANIME = {
	name: 'search_anime',
	description: 'Fetches the closest-named anime from Jikan (MAL API)',
	options: [
		{
			name: 'anime',
			description: 'The name of the anime you want to search for',
			type: 3,
			required: true,
		},
	],
};

const CREATE_TASK = {
	name: 'create_task',
	description: 'Creates a task for a specific list in ClickUp',
	options: [
		{
			name: 'list_id',
			description: 'ID for list to make task in',
			type: 4,
			required: true,
		},
		{
			name: 'task_name',
			description: 'Name for the new task',
			type: 3,
			required: true,
		},
		{
			name: 'assignees',
			description: 'assignee IDs, seperated by commas (if more than one) AND NO SPACES(?)',
			type: 3,
			required: false,
		},
		{
			name: 'due_date',
			description: 'YYYY.MM.DD',
			type: 3,
			required: false,
		},
		{
			name: 'start_date',
			description: 'YYYY.MM.DD',
			type: 3,
			required: false,
		},
		{
			name: 'task_desc',
			description: 'Description for the new task',
			type: 3,
			required: false,
		},
		{
			name: 'tag_names',
			description: 'Tag names for task seperated by COMMAS (AND NOT SPACES)',
			type: 3,
			required: false,
		},
		{
			name: 'priority',
			description: 'Priority of task (1-4, High to Low)',
			type: 4,
			required: false,
		},
		{
			name: 'sprint_points',
			description: 'Adds Sprint Points to the task (1,2,3,5,8)',
			type: 4,
			choices: [
				{
					name: '1',
					value: 1,
				},
				{
					name: '2',
					value: 2,
				},
				{
					name: '3',
					value: 3,
				},
				{
					name: '5',
					value: 5,
				},
				{
					name: '8',
					value: 8,
				},
			],
			required: false,
		},
		{
			name: 'status_name',
			description: 'Name of status to add the task to',
			type: 3,
			required: false,
		},
		{
			name: 'custom_task_id',
			description: 'Custom task ID NOT BEING USED AS OF THE MOMENT',
			type: 4,
			required: false,
		},
		{
			name: 'workspace_id',
			description: 'ClickUp docs say we need this for custom task ids. NOT BEING USED AS OF THE MOMENT',
			type: 4,
			required: false,
		},
	],
};

const FIND_WORKSPACES = {
	name: 'find_workspaces',
	description: 'Find workspaces that I can use',
	options: [],
};

const FIND_SPACES = {
	name: 'find_spaces',
	description: 'Find spaces in a specific workspace',
	options: [
		{
			name: 'team_id',
			description: 'Workspace ID to find spaces in',
			type: 4,
			required: true,
		},
	],
};

const FIND_FOLDERS = {
	name: 'find_folders',
	description: 'Find folders in a specific space',
	options: [
		{
			name: 'space_id',
			description: 'Space ID to find folder in',
			type: 4,
			required: true,
		},
	],
};

const FIND_LISTS = {
	name: 'find_lists',
	description: 'Find lists inside either a specific folder or a specific space',
	options: [
		{
			name: 'folderless',
			description: 'Set to true for folderless (provide a space), false to provide a folder',
			type: 5,
			required: true,
		},
		{
			name: 'folder_id',
			description: 'Set folder ID (ONLY IF FOLDERLESS IS FALSE)',
			type: 4,
			required: false,
		},
		{
			name: 'space_id',
			description: 'Set space id (ONLY IF FOLDERLESS IS TRUE)',
			type: 4,
			required: false,
		},
	],
};

const FIND_USERS = {
	name: 'find_users',
	description: 'Find users in a specific workspace',
	options: [
		{
			name: 'team_id',
			description: 'Workspace ID to find spaces in',
			type: 4,
			required: true,
		},
	],
};

const TEST = {
	name: 'test',
	description: 'sends a message back from discord bot TESTING TESTING',
};

export const COMMAND_LIST = [
	TEST,
	BUTTON,
	CREATE_TASK,
	SEARCH_ANIME,
	TOP_ANIME,
	FIND_WORKSPACES,
	FIND_SPACES,
	FIND_FOLDERS,
	FIND_LISTS,
	FIND_USERS,
];
