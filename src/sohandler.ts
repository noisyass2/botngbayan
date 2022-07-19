import { ChatClient } from '@twurple/chat';

import * as fs from "fs";
import * as WebSocket from "ws";

let db: Array<ISOChannels> = [];

let blist: Array<String> = [ "streamlabs","streamelements", "blerp","nightbot","fossabot","soundalerts","moobot", "bot_ng_bayan"];
let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

export function init() {
    // let channels = [settings.channel]
    let channels = ['vinsuuu','speeeedtv']
    channels.forEach(channel => {
        db.push({
            name: channel,
            users: []
        })
    });
}

export function handleMessage(user: string, message: String, channel: string, chatClient: ChatClient) {
    //check commands
    console.log("handling user: " + user)
    let sochannel = db.find(p => p.name == channel);
    let channelSettings = settings.find((p:any) => p.channel == channel.replace("#",""));
    console.log(channelSettings);
    if(!channelSettings) return; // not an allowed channel

    let delay = Number.parseInt(channelSettings.delay)
    if(!sochannel){
         sochannel = {
            name: channel,
            users: []
        }
        db.push(sochannel)
    }

    if(sochannel){
        let users = sochannel.users; // user na na SO na.
        // check if new user in chat
        // #speeeedtv
        // @speeeedtv
        // && user !== channel.replace("#","")
        console.log(user);
        if(!users.includes(user) && !blist.includes(user) ) 
        {
            console.log(user + " is not yet in users, added " + user + " in the list")
            users.push(user)
            
            setTimeout(() => {
                chatClient.say(channel, "!so @" + user)
                let soMsg = channelSettings.soMessageTemplate;
                if(soMsg !== ""){
                    soMsg = soMsg.replace("{target.name}", user)
                    soMsg = soMsg.replace("{target.url}", "https://twitch.tv/" + user)
                    console.log(soMsg)
                    chatClient.action(channel, soMsg)
                    broadcast(user)
                }
                
            }, delay)

        } // user already exist, do nothing

        if(message.startsWith("!soreset"))
        {
            sochannel.users = [];
        }else if(message.startsWith("!so @")) {
            let soMsg = channelSettings.soMessageTemplate;
            if(soMsg !== ""){
                let userToSo = message.replace("!so @","");
                
                soMsg = soMsg.replace("{target.name}", userToSo)
                soMsg = soMsg.replace("{target.url}", "https://twitch.tv/" + userToSo)
                console.log(soMsg)
                chatClient.action(channel, soMsg)
                broadcast(userToSo)
            }
            
        }else if(isThanks(message)) {
            let responses: Array<string> = [
                "No problem @{target.name}!! I gotchuu fam...",
                "Walang anuman @{target.name}!! ",
                "Sus maliit na bagay @{target.name}!! ",
                "No biggie @{target.name}!! ",
                "You're welcome welcome @{target.name}!! ",
            ]
            let response = responses[Math.floor(Math.random() * responses.length)];
            response = response.replace('{target.name}',user);
            chatClient.say(channel, response);
        }
    }

    return "";
}

function isThanks(msg:String) {
    let ty: Array<string> = ['salamat','thank','thank you'];
    let nm: Array<string> = ['bot_ng_bayan','botngbayan','bot ng bayan','botng bayan','bot ngbayan'];
    let isTY: boolean = false;
    let isNM : boolean = false;
    ty.forEach(p => {
        if (msg.split(' ').includes(p)) isTY =true;
    });
    nm.forEach(p => {
        if(msg.split(' ').includes(p)) isNM = true;
    });
    return (isTY && isNM)
}


const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', ws => {
    console.log("opened")
    ws.on('message', message => {
        console.log(message)
    })
});

function broadcast(msg: string) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        console.log("sent");
        client.send(msg);
     });
 }; 



export interface ISOChannels {
    name: string;
    users: Array<String>;
}

