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
let db = [];
let blist = ["streamlabs", "streamelements", "blerp", "nightbot", "fossabot", "soundalerts", "moobot"];
let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
function init() {
    let channels = [settings.channel];
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
    let sochannel = db.find(p => p.name);
    if (sochannel) {
        let users = sochannel.users; // user na na SO na.
        // check if new user in chat
        // #speeeedtv
        // @speeeedtv
        if (!users.includes(user) && !blist.includes(user) && user !== channel.replace("#", "")) {
            console.log(user + " is not yet in users, added " + user + " in the list");
            let soMsg = settings.soMessageTemplate;
            let delay = Number.parseInt(settings.delay);
            soMsg = soMsg.replace("{target.name}", user);
            soMsg = soMsg.replace("{target.url}", "https://twitch.tv/" + user);
            users.push(user);
            console.log(soMsg);
            setTimeout(() => {
                chatClient.say(channel, "!so @" + user);
                chatClient.action(channel, soMsg);
            }, delay);
        } // user already exist, do nothing
        if (message.startsWith("!soreset")) {
            sochannel.users = [];
        }
    }
    return "";
}
exports.handleMessage = handleMessage;
