import { ChatClient, ChatUser } from '@twurple/chat';
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import * as fs from "fs";
import * as fetch from "node-fetch";
import { soReset } from './sohandler';
import { getSOChannel, saveSoChannelSettings } from './utils';

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
        command: "!soon",
        handler: soOn
    },

]
}

export async function handleMessage(user: string, message: string, channel: string, chatClient: ChatClient, channelSettings: any, msg: TwitchPrivateMessage) {
    
    if(user !== channel.replace('#','')) return; // message is not from streamer
    if(!message.startsWith("!")) return; // message is not a command

    if(!channelSettings) return; // not an existing user.

    let userInfo = msg.userInfo;
    let {isSubscriber} = userInfo;

    if(isSubscriber && message.startsWith("!"))
    {
        

        // for adding and editing commands
        serviceCommands.forEach(svcCommand => {
            if(message.startsWith(svcCommand.command)) {
                log
                svcCommand.handler(userInfo,message,channel,chatClient);
            }
        })
    }
}


function soResetChannel(user:ChatUser, messsage:string, channel:string, chatClient:any){
    soReset(channel);
    chatClient.say(channel, "SO list is now empty.");
}

async function soOff(user:ChatUser, messsage:string, channel:string, chatClient:any){
    let channelName = channel.replace("#","");
    await getSOChannel(channelName)
    .then(async (channelSettings) => {
        if(channelSettings){
            channelSettings.enabled = false;

            await saveSoChannelSettings(channelName,channelSettings).then((p) => {
                console.log(p);
                chatClient.say(channel, "Thank you for trying the service. Bot will now stop responding to any messages. Use command !soon to turn the bot back on.")
            });
        }
    })
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