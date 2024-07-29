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
    options: [{
        name : "N",
        description : "The #N top anime",
        type : 4,
        required : false,
    }]
}

const CREATE_TASK = {
    name: "create_task",
    description: "Creates a task in ClickUp",
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

const TEST = {
    name: "test",
    description: "sends a message back from discord bot"
}

export const COMMAND_LIST = [
    TEST,
    BUTTON,
    CREATE_TASK,
    TOP_ANIME,
];