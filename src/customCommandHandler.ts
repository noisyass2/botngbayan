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
    }, {
        command: "!delcmd",
        handler: delCommand
    }]
}

export async function handleMessage(user: string, message: string, channel: string, chatClient:ChatClient) {
    
    if(!message.startsWith("!")) return;
    // let soChannel = settings.find((p:any) => p.channel == channel.replace('#',''));
    let getChannelURL = process.env.APIURL + "/api/channels/" + channel.replace('#','');
    let soChannel = await fetch.default(getChannelURL).then((p) => { return p.json() }).then( (p: any) => {return p})
    console.log("handling soChannel:" + soChannel);
    if(!soChannel) return;

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

async function addCommand(user: string, message: string, channel: string, chatClient:ChatClient) {
    let splitMsg = message.split(" ");
    if(splitMsg.length > 1){
        let command = splitMsg.splice(0,2)[1];
        
        let cmdMessage  = splitMsg.join(" ");
        let body = {
            channel: channel.replace("#",""),
            command: command,
            response: cmdMessage
        };

        let addCmdUrl = process.env.APIURL + "/api/addcmd";
        const params = new URLSearchParams();
        params.append('channel', channel.replace("#",""));
        params.append('command', command);
        params.append('message', cmdMessage);
        console.log(params);
        const response = await fetch.default(addCmdUrl, { method: 'POST', body: params }).then((p) => {return p.text();});

        // customCommands.push({
        //     command: command,
        //     responses: [
        //         cmdMessage
        //     ]
        // });
       
        // //save
        // saveSettings();

        //reply
        chatClient.say(channel, response)
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
async function delCommand(user: string, message: string, channel: string, chatClient:ChatClient) {
    let splitMsg = message.split(" ");
    if(splitMsg.length > 1){
        let command = splitMsg.splice(0,2)[1];
        

        let delCmdUrl = process.env.APIURL + "/api/delcmd";
        const params = new URLSearchParams();
        params.append('channel', channel.replace("#",""));
        params.append('command', command);

        console.log(params);
        const response = await fetch.default(delCmdUrl, { method: 'POST', body: params }).then((p) => {return p.text();});

        //reply
        chatClient.say(channel, response)
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