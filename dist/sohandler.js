"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessage = exports.init = void 0;
const fs = __importStar(require("fs"));
const WebSocket = __importStar(require("ws"));
let db = [];
let blist = ["streamlabs", "streamelements", "blerp", "nightbot", "fossabot", "soundalerts", "moobot"];
let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
function init() {
    // let channels = [settings.channel]
    let channels = ['vinsuuu', 'speeeedtv'];
    channels.forEach(channel => {
        db.push({
            name: channel,
            users: []
        });
    });
}
exports.init = init;
function handleMessage(user, message, channel, chatClient) {
    //check commands
    console.log("handling user: " + user);
    let sochannel = db.find(p => p.name == channel);
    let channelSettings = settings.find((p) => p.channel == channel.replace("#", ""));
    console.log(channelSettings);
    if (!channelSettings)
        return; // not an allowed channel
    let delay = Number.parseInt(channelSettings.delay);
    if (!sochannel) {
        sochannel = {
            name: channel,
            users: []
        };
        db.push(sochannel);
    }
    if (sochannel) {
        let users = sochannel.users; // user na na SO na.
        // check if new user in chat
        // #speeeedtv
        // @speeeedtv
        // && user !== channel.replace("#","")
        if (!users.includes(user) && !blist.includes(user)) {
            console.log(user + " is not yet in users, added " + user + " in the list");
            users.push(user);
            setTimeout(() => {
                chatClient.say(channel, "!so @" + user);
                let soMsg = channelSettings.soMessageTemplate;
                if (soMsg !== "") {
                    soMsg = soMsg.replace("{target.name}", user);
                    soMsg = soMsg.replace("{target.url}", "https://twitch.tv/" + user);
                    console.log(soMsg);
                    chatClient.action(channel, soMsg);
                    broadcast(user);
                }
            }, delay);
        } // user already exist, do nothing
        if (message.startsWith("!soreset")) {
            sochannel.users = [];
        }
        else if (message.startsWith("!so @")) {
            let soMsg = channelSettings.soMessageTemplate;
            if (soMsg !== "") {
                let userToSo = message.replace("!so @", "");
                soMsg = soMsg.replace("{target.name}", userToSo);
                soMsg = soMsg.replace("{target.url}", "https://twitch.tv/" + userToSo);
                console.log(soMsg);
                chatClient.action(channel, soMsg);
                broadcast(userToSo);
            }
        }
    }
    return "";
}
exports.handleMessage = handleMessage;
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', ws => {
    console.log("opened");
    ws.on('message', message => {
        console.log(message);
    });
});
function broadcast(msg) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        console.log("sent");
        client.send(msg);
    });
}
;
