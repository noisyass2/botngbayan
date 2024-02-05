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
exports.soList = exports.soResetAll = exports.soReset = exports.newChannel = exports.handleSOMessage = exports.handleMessage = exports.SOReinit = exports.SOInit = exports.init = void 0;
const fetch = __importStar(require("node-fetch"));
const utils_1 = require("./utils");
let db = [];
let blist = ["streamlabs", "streamelements", "blerp", "nightbot", "fossabot", "soundalerts", "moobot", "bot_ng_bayan"];
let chatClient;
let soCOunts = 0;
let lastCountUpdate = Date.now();
function init() {
    // let channels = [settings.channel]
    let channels = ['vinsuuu', 'speeeedtv'];
    channels.forEach(channel => {
        db.push({
            name: channel,
            users: [],
            queue: [],
            timer: setInterval(() => { }, 1000)
        });
    });
}
exports.init = init;
function SOInit(ccilent) {
    return __awaiter(this, void 0, void 0, function* () {
        // set a queue for every channel
        console.log("called SOINIT");
        chatClient = ccilent;
        let getChannelsURL = process.env.APIURL + "/db/channels";
        let channels = yield fetch.default(getChannelsURL).then((p) => { return p.json(); }).then((p) => { return p; });
        channels.forEach((channel) => __awaiter(this, void 0, void 0, function* () {
            let channelSettings = yield (0, utils_1.getSOChannel)(channel);
            // console.log(channelSettings.delay);
            let newChannel = {
                name: channel,
                users: [],
                queue: [],
                timer: setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    // console.log("tick");
                    if (newChannel.queue.length > 0) {
                        let nextMsg = newChannel.queue.shift();
                        if (nextMsg) {
                            let soCmd = channelSettings.soCommand.startsWith("!") ? channelSettings.soCommand : "!" + channelSettings.soCommand;
                            chatClient.say(nextMsg.channel, soCmd + " @" + nextMsg.user);
                            (0, utils_1.log)("Gave @" + nextMsg.user + " so on channel #" + channel, "prod");
                            addSOCount();
                            // Disabled as of 12/2023
                            //await handleSoMessageTemplate(channelSettings, nextMsg, channel);
                        }
                    }
                }), channelSettings.delay)
            };
            db.push(newChannel);
            // console.log(db);
        }));
        soCOunts = 0;
    });
}
exports.SOInit = SOInit;
function handleSoMessageTemplate(channelSettings, nextMsg, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        let soMsg = channelSettings.soMessageTemplate;
        let soMsgEnabled = channelSettings.soMessageEnabled;
        if (soMsg !== "" && soMsgEnabled) {
            let userToSo = nextMsg.user;
            let getChInfoURL = process.env.APIURL + "/db/getChannelInfo/" + userToSo;
            let chInfo = yield fetch.default(getChInfoURL).then((p) => { return p.json(); }).catch((p) => { return null; });
            // console.log(chInfo);``
            if (chInfo != null) {
                soMsg = soMsg.replace("{name}", chInfo.displayName);
                soMsg = soMsg.replace("{url}", "https://twitch.tv/" + chInfo.name);
                soMsg = soMsg.replace("{game}", chInfo.gameName);
                console.log(soMsg);
                chatClient.action(channel, soMsg);
            }
            // broadcast(userToSo)
        }
    });
}
function SOReinit(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        let soChannel = db.find((p) => p.name.toLowerCase() == channel.replace("#", "").toLowerCase());
        if (!soChannel) {
            let channelSettings = yield (0, utils_1.getSOChannel)(channel);
            let newChannel = {
                name: channel,
                users: [],
                queue: [],
                timer: setInterval(() => {
                    if (newChannel.queue.length > 0) {
                        let nextMsg = newChannel.queue.shift();
                        if (nextMsg) {
                            let soCmd = channelSettings.soCommand.startsWith("!") ? channelSettings.soCommand : "!" + channelSettings.soCommand;
                            chatClient.say(nextMsg.channel, soCmd + " @" + nextMsg.user);
                            addSOCount();
                        }
                    }
                }, channelSettings.delay)
            };
            console.log(newChannel);
            db.push(newChannel);
        }
    });
}
exports.SOReinit = SOReinit;
function handleMessage(user, message, channel, chatClient, channelSettings, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        //check commands
        (0, utils_1.log)("handling user: " + user);
        let sochannel = db.find(p => p.name == channel);
        (0, utils_1.log)(channelSettings);
        if (!channelSettings)
            return; // not an allowed channel
        let delay = Number.parseInt(channelSettings.delay);
        if (sochannel) {
            let users = sochannel.users; // user na na SO na.
            // check if new user in chat
            // #speeeedtv
            // @speeeedtv
            // && user !== channel.replace("#","")
            console.log(user);
            if (validateUser(users, user, channel, msg.userInfo, channelSettings)) {
                (0, utils_1.log)("Gave @" + user + " so onn channel #" + channel, "prod");
                users.push(user);
                setTimeout(() => {
                    chatClient.say(channel, "!so @" + user);
                    let soMsg = channelSettings.soMessageTemplate;
                    if (soMsg !== "") {
                        soMsg = soMsg.replace("{name}", user);
                        soMsg = soMsg.replace("{url}", "https://twitch.tv/" + user);
                        console.log(soMsg);
                        chatClient.action(channel, soMsg);
                        // broadcast(user)
                    }
                }, delay);
            } // user already exist, do nothing
            if (message.startsWith("!soreset")) {
                soReset(channel);
                chatClient.say(channel, "SO list is now empty.");
            }
            else if (message.startsWith("!so @")) {
                let soMsg = channelSettings.soMessageTemplate;
                if (soMsg !== "") {
                    let userToSo = message.replace("!so @", "");
                    soMsg = soMsg.replace("{name}", userToSo);
                    soMsg = soMsg.replace("{url}", "https://twitch.tv/" + userToSo);
                    console.log(soMsg);
                    chatClient.action(channel, soMsg);
                    // broadcast(userToSo)
                }
            }
            else if (isThanks(message)) {
                let responses = [
                    "No problem {name}!! I gotchuu fam...",
                    "Walang anuman {name}!! ",
                    "Sus maliit na bagay {name}!! ",
                    "No biggie {name}!! ",
                    "You're welcome welcome {name}!! ",
                ];
                let response = responses[Math.floor(Math.random() * responses.length)];
                response = response.replace('{name}', '@' + user);
                chatClient.say(channel, response);
            }
        }
        return "";
    });
}
exports.handleMessage = handleMessage;
function handleSOMessage(user, message, channel, chatClient, channelSettings, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        //check commands
        let { isMod, isVip, isSubscriber, isBroadcaster } = msg.userInfo;
        let tag = (isMod ? "M" : "") + "" + (isVip ? "V" : "") + "" + (isSubscriber ? "S" : "") + "" + (isBroadcaster ? "B" : "");
        (0, utils_1.log)("handling msg: " + user + "[" + tag + "]:" + message + " on " + channel);
        let sochannel = db.find(p => p.name.toLowerCase() == channel.replace("#", "").toLowerCase());
        if (!channelSettings)
            return; // not an allowed channel
        if (sochannel) {
            let users = sochannel.users; // user na na SO na.
            // check if new user in chat
            // #speeeedtv
            // @speeeedtv
            // && user !== channel.replace("#","")
            // console.log(users);
            if (validateUser(users, user, channel, msg.userInfo, channelSettings)) {
                (0, utils_1.log)("Added " + user + " to channel #" + channel + "'s queue", "prod");
                users.push(user);
                sochannel.queue.push({
                    channel: channel,
                    user: user
                });
            } // user already exist, do nothing
            // if(message.startsWith("!soreset"))
            // {
            //     soReset(channel);
            //     chatClient.say(channel, "SO list is now empty.");
            // }else 
            if (message.startsWith("!" + channelSettings.soCommand + " @")) {
                let soMsg = channelSettings.soMessageTemplate;
                let soMsgEnabled = channelSettings.soMessageEnabled;
                if (soMsg !== "" && soMsgEnabled) {
                    let userToSo = message.replace("!" + channelSettings.soCommand + " @", "");
                    let getChInfoURL = process.env.APIURL + "/db/getChannelInfo/" + userToSo;
                    let chInfo = yield fetch.default(getChInfoURL).then((p) => { return p.json(); }).catch((p) => { return null; });
                    // console.log(chInfo);
                    if (chInfo != null) {
                        soMsg = soMsg.replace("{name}", chInfo.displayName);
                        soMsg = soMsg.replace("{url}", "https://twitch.tv/" + chInfo.name);
                        soMsg = soMsg.replace("{game}", chInfo.gameName);
                        (0, utils_1.log)(soMsg);
                        chatClient.action(channel, soMsg);
                    }
                    // broadcast(userToSo)
                }
            }
            else if (isThanks(message)) {
                let responses = [
                    "No problem {name}!! I gotchuu fam...",
                    "Walang anuman {name}!! ",
                    "Sus maliit na bagay {name}!! ",
                    "No biggie {name}!! ",
                    "You're welcome welcome {name}!! ",
                ];
                let response = responses[Math.floor(Math.random() * responses.length)];
                response = response.replace('{name}', '@' + user);
                chatClient.say(channel, response);
            }
            else if (isQuestion(message)) {
                if (message.includes("whosyourdaddy") || message.includes("whos your daddy") || message.includes("who created you") || message.includes("who is your creator") || message.includes("sinong tatay mo")) {
                    chatClient.say(channel, "Check out @speeeedtv at www.twitch.tv/speeeedtv");
                    return "";
                }
                let responses = [
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
                response = response.replace('{name}', '@' + user);
                chatClient.say(channel, response);
            }
        }
        return "";
    });
}
exports.handleSOMessage = handleSOMessage;
function newChannel(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, utils_1.log)("Adding new channel " + channel, "prod");
        let sochannel = db.find(p => p.name.toLowerCase() == channel.replace("#", "").toLowerCase());
        if (sochannel) {
            (0, utils_1.log)("Channel found, resetting queue", "prod");
            sochannel.queue = [];
        }
        else {
            (0, utils_1.log)("Adding new queue for channel " + channel, "prod");
            let channelSettings = yield (0, utils_1.getSOChannel)(channel);
            let newChannel = {
                name: channel,
                users: [],
                queue: [],
                timer: setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    // console.log("tick");
                    if (newChannel.queue.length > 0) {
                        let nextMsg = newChannel.queue.shift();
                        if (nextMsg) {
                            let soCmd = channelSettings.soCommand.startsWith("!") ? channelSettings.soCommand : "!" + channelSettings.soCommand;
                            chatClient.say(nextMsg.channel, soCmd + " @" + nextMsg.user);
                            (0, utils_1.log)("Gave @" + nextMsg.user + " so on channel #" + channel, "prod");
                            addSOCount();
                            // Disabled as of 12/2023
                            //await handleSoMessageTemplate(channelSettings, nextMsg, channel);
                        }
                    }
                }), channelSettings.delay)
            };
            db.push(newChannel);
        }
    });
}
exports.newChannel = newChannel;
function validateUser(users, user, channel, msg, channelSettings) {
    let { isBroadcaster } = msg;
    let isValidMsg = "";
    if (users.includes(user))
        isValidMsg += "User already in list.";
    if (blist.includes(user))
        isValidMsg += "User is in blist.";
    if (isBroadcaster)
        isValidMsg += "User is broadcaster";
    let isValid = !users.includes(user) && !blist.includes(user);
    // channel must not be theBroadcaster
    isValid = isValid && !isBroadcaster;
    let isFiltered = checkIsFiltered(msg, channelSettings);
    if (!isFiltered)
        isValidMsg += "User didnt pass filter";
    // is whitelisted
    // console.log("isValid && isFiltered :" + (isValid && isFiltered));
    if (isValid && isFiltered) {
        isValidMsg += "User is both valid and passed filter";
    }
    if ((0, utils_1.getDebug)()) {
        (0, utils_1.log)(isValidMsg);
    }
    return isValid && isFiltered;
}
function checkIsFiltered(msg, channelSettings) {
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
function soReset(channel) {
    let sochannel = db.find(p => p.name.toLowerCase() == channel.replace("#", "").toLowerCase());
    if (sochannel) {
        sochannel.users = [];
    }
}
exports.soReset = soReset;
function soResetAll() {
    db.forEach(channel => {
        channel.users = [];
    });
}
exports.soResetAll = soResetAll;
function soList(channel) {
    let sochannel = db.find(p => p.name == channel);
    return sochannel ? sochannel.users.join(",") : "";
}
exports.soList = soList;
function isThanks(msg) {
    let ty = ['salamat', 'thanks', 'thank', 'thank you', 'ty', 'arigato', 'arigatou'];
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
function isQuestion(msg) {
    let nm = ['bot_ng_bayan', 'botngbayan', 'bot ng bayan', 'botng bayan', 'bot ngbayan'];
    let isQ = false;
    let isNM = false;
    isQ = msg.includes("?") || msg.endsWith("?");
    nm.forEach(p => {
        if (msg.split(' ').includes(p) || msg.split(' ').includes('@' + p))
            isNM = true;
    });
    return isNM && isQ;
}
function addSOCount() {
    soCOunts += 1;
    let timepassed = Date.now() - lastCountUpdate;
    if (timepassed / 1000 > 10) {
        (0, utils_1.addCount)(soCOunts);
        soCOunts -= soCOunts;
        lastCountUpdate = Date.now();
    }
}
