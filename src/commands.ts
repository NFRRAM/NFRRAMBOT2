const BUTTON = {
    name: "button",
    description: "Creates a button",
    options: [
        /*
            {
                type: 1,
                name: "option",
                description: "button option"
            }
        */
    ]
}

const TOP_ANIME = {
    name: "top_anime",
    description: "Fetches the nth top anime from Jikan (MAL API)",
    options: [
        {
            name : "n",
            description : "The #n top anime",
            type : 4,
            required : false,
        }
    ]
}

const CREATE_TASK = {
    name: "create_task",
    description: "Creates a task in ClickUp",
    options: [
        {
            name : "list_id",
            description : "ID for list to make task in",
            type : 4,
            required : true,
        },
        {
            name : "task_name",
            description : "Name for the new task",
            type : 3,
            required : true,
        },
        {
            name : "assignees",
            description : "assignee IDs, seperated by commas (if more than one) AND NO SPACES(?)",
            type : 3,
            required : true,
        },
        {
            name : "due_date",
            description : "YYYY.MM.DD",
            type : 3,
            required : true,
        },
        {
            name : "start_date",
            description : "YYYY.MM.DD",
            type : 3,
            required : true,
        },
        {
            name : "task_desc",
            description : "Description for the new task",
            type : 3,
            required : false,
        },
        {
            name : "custom_task_id",
            description : "Custom task ID NOT BEING USED AS OF THE MOMENT",
            type : 4,
            required : false,
        },
        {
            name : "workspace_id",
            description : "ClickUp docs say we need this for custom task ids. NOT BEING USED AS OF THE MOMENT",
            type : 4,
            required : false,

        },
    ]
}

const FIND_WORKSPACES = {
    name: "find_workspaces",
    description: "Find workspaces that I can use",
    options: [
    ]
}

const FIND_SPACES = {
    name: "find_spaces",
    description: "Find spaces in a specific workspace",
    options: [
        {
            name : 'team_id',
            description : 'Workspace ID to find spaces in',
            type : 4,
            required : true,
        }
    ]
}

const FIND_FOLDERS = {
    name: "find_folders",
    description: "Find folders in a specific space",
    options: [
        {
            name : 'space_id',
            description : 'Space ID to find folder in',
            type : 4,
            required : true,
        }
    ]
}

const FIND_LISTS = {
    name: "find_lists",
    description: "Find lists inside either a specific folder or a specific space",
    options: [
        {
            name : "folderless",
            description : "Set to true for folderless (provide a space), false to provide a folder",
            type : 5,
            required : true,
        },
        {
            name : "folder_id",
            description : "Set folder ID (ONLY IF FOLDERLESS IS FALSE)",
            type : 4,
            required : false,
        },
        {
            name : "space_id",
            description : "Set space id (ONLY IF FOLDERLESS IS TRUE)",
            type : 4,
            required : false,
        },
    ]
}

const FIND_USERS = {
    name: "find_users",
    description: "Find users in a specific workspace",
    options: [
        {
            name : 'team_id',
            description : 'Workspace ID to find spaces in',
            type : 4,
            required : true,
        }
    ]
}

const TEST = {
    name: "test",
    description: "sends a message back from discord bot TESTING TESTING"
}

export const COMMAND_LIST = [
    TEST,
    BUTTON,
    CREATE_TASK,
    TOP_ANIME,
    FIND_WORKSPACES,
    FIND_SPACES,
    FIND_FOLDERS,
    FIND_LISTS,
    FIND_USERS
];