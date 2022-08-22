import { ChatClient, ChatUser } from '@twurple/chat';
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import * as fs from "fs";
import * as fetch from "node-fetch";
import { soReset } from './sohandler';
import { getSOChannel } from './utils';

let settings = JSON.parse(fs.readFileSync("./settings.json",'utf-8'))
let customCommands : Array<CustomCommand> = [];
let serviceCommands: Array<ServiceCommand> = [];

export function init() {    
    serviceCommands = [{
        command: "!soreset",
        handler: soResetChannel
    },{
        command: "!sooff",
        handler: soOff
    },{
        command: "!soOn",
        handler: soOn
    },

]
}

export async function handleMessage(user: string, message: string, channel: string, chatClient: ChatClient, channelSettings: any, msg: TwitchPrivateMessage) {
    
    if(user !== channel.replace('#','')) return; // message is not from streamer
    if(!message.startsWith("!")) return; // message is not a command

    if(!channelSettings) return; // not an existing user.

    customCommands = channelSettings.customCommands;
    let userInfo = msg.userInfo;
    let {isSubscriber} = userInfo;

    if(isSubscriber && message.startsWith("!"))
    {
        console.log("handling custom msg:" + message);

        // for adding and editing commands
        serviceCommands.forEach(svcCommand => {
            if(message.startsWith(svcCommand.command)) {
                svcCommand.handler(userInfo,message,channel,chatClient);
            }
        })
    }
}


function soResetChannel(user:ChatUser, messsage:string, channel:string, chatClient:any){
    soReset(channel);
    chatClient.say(channel, "SO list is now empty.");
}

function soOff(user:ChatUser, messsage:string, channel:string, chatClient:any){

}

function soOn(user:ChatUser, messsage:string, channel:string, chatClient:any){

}

interface CustomCommand{
    command: string;
    responses: Array<string>;
}

interface ServiceCommand {
    command:string;
    handler: (user:ChatUser, messsage:string, channel:string, chatClient:any) => void;
}