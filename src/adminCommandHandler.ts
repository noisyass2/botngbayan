import { ChatClient } from '@twurple/chat';
import * as fs from "fs";
import * as fetch from "node-fetch";

let settings = JSON.parse(fs.readFileSync("./settings.json",'utf-8'))
let customCommands : Array<CustomCommand> = [];
let serviceCommands: Array<ServiceCommand> = [];

export function init() {    
    serviceCommands = [{
        command: "!addcmd",
        handler: addCommand
    }, {
        command: "!listcmd",
        handler: listCommands
    }, {
        command: "!editcmd",
        handler: editCommand
}, {
        command: "!addresponse",
        handler: addResponse
    }]
}

export async function handleMessage(user: string, message: string, channel: string, chatClient:ChatClient) {
    
    if(user !== channel.replace('#','')) return; // message is not from streamer
    if(!message.startsWith("!")) return; // message is not a command
    let getChannelURL = process.env.APIURL + "/api/channels/" + channel.replace('#','');
    let soChannel = await fetch.default(getChannelURL).then((p) => { return p.json() }).then( (p: any) => {return p})
    console.log("handling soChannel:" + soChannel);
    
    console.log("handling soChannel:" + soChannel);
    if(!soChannel) return; // not an existing user.

    customCommands = soChannel.customCommands;
    console.log("handling customCommands:" + customCommands);
    if(message.startsWith("!"))
    {
        console.log("handling custom msg:" + message);
        customCommands.forEach((customCommand:CustomCommand) => {
            if(message === customCommand.command){
                let responses = customCommand.responses;
                let response = responses[Math.floor(Math.random() * responses.length)]
                
                chatClient.action(channel, response);
            }
        });

        // for adding and editing commands
        serviceCommands.forEach(svcCommand => {
            if(message.startsWith(svcCommand.command)) {
                svcCommand.handler(user,message,channel,chatClient)
            }
        })
    }   
}

function addCommand(user: string, message: string, channel: string, chatClient:ChatClient) {
    let splitMsg = message.split(" ");
    if(splitMsg.length > 1){
        let command = splitMsg.splice(0,2)[1];
        
        let cmdMessage  = splitMsg.join(" ");
        customCommands.push({
            command: command,
            responses: [
                cmdMessage
            ]
        });
       
        //save
        saveSettings();

        //reply
        chatClient.say(channel, "New Custom Command Added!")
    }
}

function editCommand(user: string, message: string, channel: string, chatClient:ChatClient) {
    let splitMsg = message.split(" ");
    if(splitMsg.length > 1){
        let command = splitMsg.splice(0,2)[1];
        
        let cmdMessage  = splitMsg.join(" ");

        let customCommand = customCommands.find((p:any) => { return p.command == command});

        if(customCommand) {
            customCommand.responses = [cmdMessage]
       
            //save
            saveSettings();

            //reply
            chatClient.say(channel, "Custom Command Edited!")
        }
        
    }
}

function addResponse(user: string, message: string, channel: string, chatClient:ChatClient) {
    let splitMsg = message.split(" ");
    if(splitMsg.length > 1){
        let command = splitMsg.splice(0,2)[1];
        
        let cmdMessage = splitMsg.join(" ");

        let customCommand = customCommands.find((p) => { return p.command == command});

        if(customCommand) {
            customCommand.responses.push(cmdMessage);
       
            //save
            saveSettings();

            //reply
            chatClient.say(channel, "Custom Response Added to " + customCommand.command)
        }
        
    }
}

function saveSettings() {
    fs.writeFileSync('./settings.json', JSON.stringify(settings))
}

function listCommands(user: string, message: string, channel: string, chatClient:ChatClient) {
    let cmds = customCommands.map(c => {return c.command}).join(",");
    chatClient.say(channel, "Here's the commands: " + cmds);
}
interface CustomCommand{
    command: string;
    responses: Array<string>;
}

interface ServiceCommand {
    command:string;
    handler: (user:any, messsage:string, channel:string, chatCLient:any) => void;
}