
import * as fs from "fs";
import * as WebSocket from "ws";

let db: Array<ISOChannels> = [];

let blist: Array<String> = [ "streamlabs","streamelements", "blerp","nightbot","fossabot","soundalerts","moobot"];
let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

export function init() {
    
    let channels = [settings.channel]
    channels.forEach(channel => {
        db.push({
            name: channel,
            users: []
        })
    });
}

export function handleMessage(user, message: String, channel: string, chatClient) {
    //check commands
    console.log("handling user: " + user)
    let sochannel = db.find(p => p.name);
    let delay = Number.parseInt(settings.delay)
    if(sochannel){
        let users = sochannel.users; // user na na SO na.
        // check if new user in chat
        // #speeeedtv
        // @speeeedtv
        if(!users.includes(user) && !blist.includes(user) && user !== channel.replace("#","")) 
        {
            console.log(user + " is not yet in users, added " + user + " in the list")
            users.push(user)
            
            setTimeout(() => {
                chatClient.say(channel, "!so @" + user)
            }, delay)

        } // user already exist, do nothing

        if(message.startsWith("!soreset"))
        {
            sochannel.users = [];
        }else if(message.startsWith("!so @")) {
            let soMsg = settings.soMessageTemplate;
            soMsg = soMsg.replace("{target.name}", user)
            soMsg = soMsg.replace("{target.url}", "https://twitch.tv/" + user)
            console.log(soMsg)
            chatClient.action(channel, soMsg)
            broadcast(user)
        }
    }

    return "";
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



interface ISOChannels {
    name: string;
    users: Array<String>;
}

