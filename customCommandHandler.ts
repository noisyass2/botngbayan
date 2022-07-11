import { ChatClient } from '@twurple/chat';
import * as fs from "fs";

let settings = JSON.parse(fs.readFileSync("./settings.json",'utf-8'))
let customCommands : Array<CustomCommand> = [];
let serviceCommands: Array<ServiceCommand> = [];

export function init() {
    customCommands = settings.customCommands;
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

export function handleMessage(user, message: string, channel: string, chatClient) {
    console.log(message);
    if(message.startsWith("!"))
    {
        customCommands.forEach(customCommand => {
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

function addCommand(user,message:string, channel:string, chatClient) {
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

function editCommand(user,message:string, channel:string, chatClient) {
    let splitMsg = message.split(" ");
    if(splitMsg.length > 1){
        let command = splitMsg.splice(0,2)[1];
        
        let cmdMessage  = splitMsg.join(" ");

        let customCommand = customCommands.find((p) => { return p.command == command});

        if(customCommand) {
            customCommand.responses = [cmdMessage]
       
            //save
            saveSettings();

            //reply
            chatClient.say(channel, "Custom Command Edited!")
        }
        
    }
}

function addResponse(user,message:string, channel:string, chatClient) {
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

function listCommands(user,message:string, channel:string, chatClient) {
    let cmds = customCommands.map(c => {return c.command}).join(",");
    chatClient.say(channel, "Here's the commands: " + cmds);
}
interface CustomCommand{
    command: string;
    responses: Array<String>;
}

interface ServiceCommand {
    command:string;
    handler: (user:any, messsage:string, channel:string, chatCLient:any) => void;
}