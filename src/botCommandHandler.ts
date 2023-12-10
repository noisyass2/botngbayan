import { ChatClient, ChatUser } from "@twurple/chat";
import { addChannel, getSOChannel, log } from "./utils";

let serviceCommands: Array<ServiceCommand> = [];

export function init() {
    serviceCommands = [{
        command: "!join",
        handler: joinChannel
    }, 

    ]
}

export async function handleMessage(user: string, message: string, channel: string, chatClient: ChatClient) {

    if (!message.startsWith("!")) return; // message is not a command

    // for adding and editing commands
    serviceCommands.forEach(svcCommand => {
        console.log(svcCommand);
        if (message.startsWith(svcCommand.command)) {
            log("handling bot command " + svcCommand.command);
            svcCommand.handler(user, message, channel, chatClient);
        }
    })

}

async function joinChannel(user: string, messsage: string, channel: string,  chatClient: ChatClient): Promise<void> {
    //check user
    log("checking user");
    let isExists =await getSOChannel(user);    
    if(isExists.status === "success"){
        //add user
        log("channel doesnt exist yet, creating channel")
        let isAdded = await addChannel(user);

        console.log(isAdded);
    }
    
    //join channel
    chatClient.join(user)
}

interface ServiceCommand {
    command: string;
    handler: (user: string, messsage: string, channel: string,  chatClient: ChatClient) => Promise<void>;
}


