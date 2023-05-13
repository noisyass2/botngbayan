import { ChatClient, ChatUser, toChannelName } from '@twurple/chat';
import * as fetch from "node-fetch";
import * as fs from "fs";
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import { getSOChannel, log, addCount } from './utils';

let db: Array<ISOChannels> = [];

let blist: Array<String> = [ "streamlabs","streamelements", "blerp","nightbot","fossabot","soundalerts","moobot", "bot_ng_bayan"];
let chatClient: ChatClient;

let soCOunts: number = 0;
let lastCountUpdate: number = Date.now();

export function init() {
    // let channels = [settings.channel]
    let channels = ['vinsuuu','speeeedtv']
    channels.forEach(channel => {
        db.push({
            name: channel,
            users: [],
            queue: [],
            timer: setInterval(() => {}, 1000)
        })
    });
}

export async function SOInit(ccilent:ChatClient) {
    // set a queue for every channel
    console.log("called SOINIT");
    
    chatClient = ccilent;
    let getChannelsURL = process.env.APIURL + "/db/channels";
    let channels = await fetch.default(getChannelsURL).then((p) => { return p.json() }).then((p: Array<string>) => { return p }) 
    channels.forEach(async channel => {
        let channelSettings = await getSOChannel(channel);
        // console.log(channelSettings.delay);
        
        let newChannel: ISOChannels = {
            name: channel,
            users: [],
            queue: [],
            timer: setInterval(async () => {
                // console.log("tick");
                if(newChannel.queue.length > 0){
                    let nextMsg = newChannel.queue.shift();
                    if(nextMsg) {
                        let soCmd = channelSettings.soCommand.startsWith("!") ? channelSettings.soCommand : "!" + channelSettings.soCommand;
                        chatClient.say(nextMsg.channel, soCmd +  " @" + nextMsg.user);
                        addSOCount();

                        let soMsg = channelSettings.soMessageTemplate;
                        let soMsgEnabled = channelSettings.soMessageEnabled;
                        if(soMsg !== "" && soMsgEnabled){
                            let userToSo = nextMsg.user;
                            let getChInfoURL = process.env.APIURL + "/db/getChannelInfo/" + userToSo;
                            let chInfo = await fetch.default(getChInfoURL).then((p) => { return p.json() }).catch((p) => { return null; })
                            // console.log(chInfo);``
                            if(chInfo != null) {
                                soMsg = soMsg.replace("{name}", chInfo.displayName)
                                soMsg = soMsg.replace("{url}", "https://twitch.tv/" + chInfo.name)
                                soMsg = soMsg.replace("{game}", chInfo.gameName)
                                console.log(soMsg)
                                chatClient.action(channel, soMsg)
                            }
                            
                            // broadcast(userToSo)
                        }
                    }
                }
            }, channelSettings.delay)
        }

        db.push(newChannel);
        // console.log(db);
    });
    soCOunts = 0;
}

export async function SOReinit(channel: string) {
    let soChannel = db.find((p) => p.name.toLowerCase() == channel.replace("#","").toLowerCase())
    if(!soChannel){
        let channelSettings = await getSOChannel(channel);

        let newChannel: ISOChannels = {
            name: channel,
            users: [],
            queue: [],
            timer: setInterval(() => {
                if(newChannel.queue.length > 0){
                    let nextMsg = newChannel.queue.shift();
                    if(nextMsg) {
                        let soCmd = channelSettings.soCommand.startsWith("!") ? channelSettings.soCommand : "!" + channelSettings.soCommand;
                        chatClient.say(nextMsg.channel, soCmd +  " @" + nextMsg.user);
                        addSOCount();
                    }
                }
            }, channelSettings.delay)
        }
        console.log(newChannel);
        
        db.push(newChannel);
    }
}

export async function handleMessage(user: string, message: String, channel: string, chatClient: ChatClient, channelSettings: any, msg: TwitchPrivateMessage ) {
    //check commands
    console.log("handling user: " + user)
    let sochannel = db.find(p => p.name == channel);
    console.log(channelSettings);
    

    if(!channelSettings) return; // not an allowed channel

    let delay = Number.parseInt(channelSettings.delay)

    if(sochannel){
        let users = sochannel.users; // user na na SO na.

        // check if new user in chat
        // #speeeedtv
        // @speeeedtv
        // && user !== channel.replace("#","")
        console.log(user);
        if(validateUser(users, user, channel, msg.userInfo, channelSettings)) 
        {
            console.log(user + " is not yet in users, added " + user + " in the list")
            users.push(user)
            
            setTimeout(() => {
                chatClient.say(channel, "!so @" + user)
                let soMsg = channelSettings.soMessageTemplate;
                if(soMsg !== ""){
                    soMsg = soMsg.replace("{name}", user)
                    soMsg = soMsg.replace("{url}", "https://twitch.tv/" + user)
                    console.log(soMsg)
                    chatClient.action(channel, soMsg)
                    // broadcast(user)
                }
                
            }, delay)

        } // user already exist, do nothing

        if(message.startsWith("!soreset"))
        {
            soReset(channel);
            chatClient.say(channel, "SO list is now empty.");
        }else if(message.startsWith("!so @")) {
            let soMsg = channelSettings.soMessageTemplate;
            if(soMsg !== ""){
                let userToSo = message.replace("!so @","");
                
                soMsg = soMsg.replace("{name}", userToSo)
                soMsg = soMsg.replace("{url}", "https://twitch.tv/" + userToSo)
                console.log(soMsg)
                chatClient.action(channel, soMsg)
                // broadcast(userToSo)
            }
            
        }else if(isThanks(message)) {
            let responses: Array<string> = [
                "No problem {name}!! I gotchuu fam...",
                "Walang anuman {name}!! ",
                "Sus maliit na bagay {name}!! ",
                "No biggie {name}!! ",
                "You're welcome welcome {name}!! ",
            ]
            let response = responses[Math.floor(Math.random() * responses.length)];
            response = response.replace('{name}','@' + user);
            chatClient.say(channel, response);
        }
    }

    return "";
}

export async function handleSOMessage(user: string, message: String, channel: string, chatClient: ChatClient, channelSettings: any, msg: TwitchPrivateMessage) {
    //check commands
    let { isMod, isVip, isSubscriber, isBroadcaster } = msg.userInfo;
    let tag = (isMod ? "M" : "") + "" + (isVip ? "V" : "") + "" + (isSubscriber ? "S" : "") + "" + (isBroadcaster ? "B" : "");
    log("handling msg: " + user + "[" + tag  + "]:" + message + " on " + channel);
    let sochannel = db.find(p => p.name.toLowerCase() == channel.replace("#","").toLowerCase());
    
    if(!channelSettings) return; // not an allowed channel
    
    if(sochannel){
        let users = sochannel.users; // user na na SO na.
        // check if new user in chat
        // #speeeedtv
        // @speeeedtv
        // && user !== channel.replace("#","")
        // console.log(users);
        if(validateUser(users, user, channel, msg.userInfo, channelSettings)) 
        {
            console.log(user + " is not yet in users, added " + user + " in the list")
            users.push(user)
            
            sochannel.queue.push({
                channel: channel,
                user: user
            })
           
        } // user already exist, do nothing

        // if(message.startsWith("!soreset"))
        // {
        //     soReset(channel);
        //     chatClient.say(channel, "SO list is now empty.");
        // }else 
        if(message.startsWith("!" + channelSettings.soCommand + " @")) {
            
            let soMsg = channelSettings.soMessageTemplate;
            let soMsgEnabled = channelSettings.soMessageEnabled;
            if(soMsg !== "" && soMsgEnabled){
                let userToSo = message.replace("!" + channelSettings.soCommand + " @","");
                let getChInfoURL = process.env.APIURL + "/db/getChannelInfo/" + userToSo;
                let chInfo = await fetch.default(getChInfoURL).then((p) => { return p.json() }).catch((p) => { return null; })
                // console.log(chInfo);
                if(chInfo != null) {
                    soMsg = soMsg.replace("{name}", chInfo.displayName)
                    soMsg = soMsg.replace("{url}", "https://twitch.tv/" + chInfo.name)
                    soMsg = soMsg.replace("{game}", chInfo.gameName)
                    log(soMsg)
                    chatClient.action(channel, soMsg)
                }
                // broadcast(userToSo)
            }
            
        }else if(isThanks(message)) {
            let responses: Array<string> = [
                "No problem {name}!! I gotchuu fam...",
                "Walang anuman {name}!! ",
                "Sus maliit na bagay {name}!! ",
                "No biggie {name}!! ",
                "You're welcome welcome {name}!! ",
            ]
            let response = responses[Math.floor(Math.random() * responses.length)];
            response = response.replace('{name}','@' + user);
            chatClient.say(channel, response);
        }else if(isQuestion(message)) {
            let responses: Array<string> = [
                "It is certain {name}.",
                "It is decidedly so {name}.",
                "Without a doubt {name}.",
                "Yes definitely {name}.",
                "You may rely on it {name}.",
                "As I see it, yes. {name}",
                "Most likely {name}.",
                "{name} Outlook good.",
                "Yes.{name}",
                "{name} Signs point to yes.",
                "Reply hazy, try again {name}.",
                "Ask again later {name}.",
                "{name} Better not tell you now.",
                "Cannot predict now.{name}",
                "Concentrate and ask again. {name}",
                "Don't count on it. {name}",
                "My reply is no {name}.",
                "My sources say no {name}.",
                "Outlook not so good {name}. ",
                "Very doubtful {name}.",
            ];
            let response = responses[Math.floor(Math.random() * responses.length)];
            response = response.replace('{name}','@' + user);
            chatClient.say(channel, response);
        }
    }

    return "";
}

function validateUser(users: String[], user: string, channel: string, msg: ChatUser, channelSettings: any) {
    let {isBroadcaster} = msg;

    let isValid = !users.includes(user) && !blist.includes(user);
    // channel must not be theBroadcaster
    isValid = isValid && !isBroadcaster;
    
    let isFiltered = checkIsFiltered(msg, channelSettings);

    // is whitelisted
    // console.log("isValid && isFiltered :" + (isValid && isFiltered));
    
    return isValid && isFiltered;
}

function checkIsFiltered(msg: ChatUser, channelSettings: any) {
    let isFiltered = false;
    let { isMod, isVip, isSubscriber } = msg;
    if (channelSettings.filters.vip)
        isFiltered = isFiltered || isVip;
    if (channelSettings.filters.mod)
        isFiltered = isFiltered || isMod;
    if (channelSettings.filters.sub)
        isFiltered = isFiltered || isSubscriber;
    if (channelSettings.filters.any)
        isFiltered = isFiltered || true;
    return isFiltered;
}

export function soReset(channel: string) {
    let sochannel = db.find(p => p.name.toLowerCase() == channel.replace("#","").toLowerCase());
    
    if (sochannel) {
        sochannel.users = [];
    }
}

export function soResetAll() {
    db.forEach(channel => {
        channel.users = [];
    });
}

export function soList(channel: string) {
    let sochannel = db.find(p => p.name == channel);
   
    return sochannel ? sochannel.users.join(",") : "";
}

function isThanks(msg:String) {
    let ty: Array<string> = ['salamat','thanks','thank','thank you','ty', 'arigato', 'arigatou'];
    let nm: Array<string> = ['bot_ng_bayan','botngbayan','bot ng bayan','botng bayan','bot ngbayan'];
    let isTY: boolean = false;
    let isNM : boolean = false;
    ty.forEach(p => {
        if (msg.split(' ').includes(p)) isTY =true;
    });
    nm.forEach(p => {
        if(msg.split(' ').includes(p) || msg.split(' ').includes('@' + p)) isNM = true;
    });
    return (isTY && isNM)
}

function isQuestion(msg:String) {
    let nm: Array<string> = ['bot_ng_bayan','botngbayan','bot ng bayan','botng bayan','bot ngbayan'];
    let isQ: boolean = false;
    let isNM : boolean = false;
    isQ = msg.includes("?") || msg.endsWith("?");
    
    nm.forEach(p => {
        if(msg.split(' ').includes(p) || msg.split(' ').includes('@' + p)) isNM = true;
    });
    
    return isNM && isQ;
}


function addSOCount() {
    soCOunts += 1;
    let timepassed = Date.now() - lastCountUpdate;
    console.log("addSOCount called:" + soCOunts);
    if(timepassed / 1000 > 10) {
        addCount(soCOunts);
        soCOunts -= soCOunts;
        lastCountUpdate = Date.now();

        console.log("addCount called");
    }
}

export interface ISOChannels {
    name: string;
    users: Array<String>;
    queue: Array<SOmessage> 
    timer: NodeJS.Timeout;
}

export interface SOmessage {
    channel :string;
    user: string;
    
}