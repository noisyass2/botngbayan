
import * as fs from "fs";
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
    if(sochannel){
        let users = sochannel.users; // user na na SO na.
        // check if new user in chat
        // #speeeedtv
        // @speeeedtv
        if(!users.includes(user) && !blist.includes(user) && user !== channel.replace("#","")) 
        {
            console.log(user + " is not yet in users, added " + user + " in the list")
            let soMsg = settings.soMessageTemplate;
            let delay = Number.parseInt(settings.delay)
            soMsg = soMsg.replace("{target.name}", user)
            soMsg = soMsg.replace("{target.url}", "https://twitch.tv/" + user)
            users.push(user)

            console.log(soMsg)
            setTimeout(() => {
                chatClient.say(channel, "!so @" + user)
                chatClient.action(channel, soMsg)
            }, delay)

        } // user already exist, do nothing

        if(message.startsWith("!soreset"))
        {
            sochannel.users = [];
        }
    }

    return "";
}

interface ISOChannels {
    name: string;
    users: Array<String>;
}