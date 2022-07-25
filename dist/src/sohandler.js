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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessage = exports.init = void 0;
const fetch = __importStar(require("node-fetch"));
const fs = __importStar(require("fs"));
let db = [];
let blist = ["streamlabs", "streamelements", "blerp", "nightbot", "fossabot", "soundalerts", "moobot", "bot_ng_bayan"];
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
    return __awaiter(this, void 0, void 0, function* () {
        //check commands
        console.log("handling user: " + user);
        let sochannel = db.find(p => p.name == channel);
        // let channelSettings = settings.find((p:any) => p.channel == channel.replace("#",""));
        let getChannelUrl = process.env.APIURL + "/api/channels/" + channel.replace("#", "");
        let channelSettings = yield fetch.default(getChannelUrl).then((p) => { return p.json(); }).then((p) => { return p; });
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
            console.log(user);
            if (!users.includes(user) && !blist.includes(user) && user !== channel.replace("#", "")) {
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
                        // broadcast(user)
                    }
                }, delay);
            } // user already exist, do nothing
            if (message.startsWith("!soreset")) {
                sochannel.users = [];
                chatClient.say(channel, "SO list is now empty.");
            }
            else if (message.startsWith("!so @")) {
                let soMsg = channelSettings.soMessageTemplate;
                if (soMsg !== "") {
                    let userToSo = message.replace("!so @", "");
                    soMsg = soMsg.replace("{target.name}", userToSo);
                    soMsg = soMsg.replace("{target.url}", "https://twitch.tv/" + userToSo);
                    console.log(soMsg);
                    chatClient.action(channel, soMsg);
                    // broadcast(userToSo)
                }
            }
            else if (isThanks(message)) {
                let responses = [
                    "No problem @{target.name}!! I gotchuu fam...",
                    "Walang anuman @{target.name}!! ",
                    "Sus maliit na bagay @{target.name}!! ",
                    "No biggie @{target.name}!! ",
                    "You're welcome welcome @{target.name}!! ",
                ];
                let response = responses[Math.floor(Math.random() * responses.length)];
                response = response.replace('{target.name}', user);
                chatClient.say(channel, response);
            }
        }
        return "";
    });
}
exports.handleMessage = handleMessage;
function isThanks(msg) {
    let ty = ['salamat', 'thank', 'thank you', 'arigato', 'arigatou'];
    let nm = ['bot_ng_bayan', 'botngbayan', 'bot ng bayan', 'botng bayan', 'bot ngbayan'];
    let isTY = false;
    let isNM = false;
    ty.forEach(p => {
        if (msg.split(' ').includes(p))
            isTY = true;
    });
    nm.forEach(p => {
        if (msg.split(' ').includes(p) || msg.split(' ').includes('@' + p))
            isNM = true;
    });
    return (isTY && isNM);
}
