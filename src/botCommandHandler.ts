import { ChatClient, ChatUser } from "@twurple/chat";
import { addChannel, getFollowages, getSOChannel, log, removeChannel, saveSoChannelSettings } from "./utils";
import { newChannel } from "./sohandler";

let serviceCommands: Array<ServiceCommand> = [];

export function init() {
    serviceCommands = [{
        command: "!join",
        handler: joinChannel
    }, {
        command: "!leave",
        handler: leaveChannel
    }, {
        command: "!msg",
        handler: fetchSOMsg
    }, {
        command: "!setmsg",
        handler: setSOMsg
    }, {
        command: "!followage",
        handler: getFollowage
    }
    ]
}

export async function handleMessage(user: string, message: string, channel: string, chatClient: ChatClient) {

    if (!message.startsWith("!")) return; // message is not a command

    // for adding and editing commands
    serviceCommands.forEach(svcCommand => {        
        if (message.toLowerCase().startsWith(svcCommand.command)) {
            log("handling bot command " + svcCommand.command);
            svcCommand.handler(user, message, channel, chatClient);
        }
    })

    if(message.startsWith("!link")) {
        chatClient.say(channel, "https://bot-ng-bayan-web.herokuapp.com");
    }

    if(message.startsWith("!kofi")) {
        chatClient.say(channel, "https://ko-fi.com/speeeedtv");
    }

}

async function joinChannel(user: string, message: string, channel: string,  chatClient: ChatClient): Promise<void> {
    //check user
    log("checking user");

    let isAdded = await addChannel(user);
    console.log(isAdded);
    
    //join channel

    chatClient.join(user).catch((reason: any) => {
        chatClient.say(channel, "Bot failed to join " + user +"'s chat.[" + reason + "]");
    }).finally(() => {
        chatClient.say(channel, "Bot joined " + user + "'s chat. Kindly give it a bit of time to boot up. Check on your next stream.");
    });
    
    await newChannel(user);
}

async function leaveChannel(user: string, message: string, channel: string,  chatClient: ChatClient): Promise<void> {
    //check user
    log("checking user");
    let isExists = await getSOChannel(user);    
    if(isExists.status === undefined && isExists.enabled){
        //add user
        log("channel found, removing channel")
        let isRemoved = await removeChannel(user);

        //leave channel
        console.log(isRemoved);
        chatClient.part(user);
        chatClient.say(channel, "Bot left " + user + "'s chat. Thank you for trying it out.");
    }
    
}

async function fetchSOMsg(user: string, message: string, channel: string,  chatClient: ChatClient): Promise<void> {
    //check user
    log("checking user");
    let isExists = await getSOChannel(user);    
    if(isExists.enabled){
        console.log(isExists);
        //add user
        // log("channel found, removing channel")
        // let isRemoved = await removeChannel(user);

        // //leave channel
        // console.log(isRemoved);
        // chatClient.part(user);

        log("Hi there " + user + "." + " Your current SO message is set as:" + isExists.soMessageTemplate);
        chatClient.say(channel, "Hi there " + user + "." + " Your current SO message is set as:" + isExists.soMessageTemplate);
    }
    
}

async function setSOMsg(user: string, message: string, channel: string,  chatClient: ChatClient): Promise<void> {
    //check user
    log("checking user");    
    let isExists = await getSOChannel(user);    
    if(isExists.enabled){
        console.log(isExists);
        let soMsg = message.replace("!setmsg ","");

        let updated = await saveSoChannelSettings(user, { "soMessageTemplate" : soMsg});
        console.log(updated);
        
        chatClient.say(channel, "Hi there " + user + "." + " Your current SO message is set as:" + updated.soMessageTemplate);
    }
    
}

async function getFollowage(user: string, messsage: string, channel: string, chatClient: ChatClient): Promise<void> {
    log("getting followage");
    let followage = await getFollowages(user);
    console.log(channel + ":" + followage);    
    chatClient.say(channel, "" + followage);    
}


interface ServiceCommand {
    command: string;
    handler: (user: string, messsage: string, channel: string,  chatClient: ChatClient) => Promise<void>;
}



