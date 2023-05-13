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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentChannels = exports.say = exports.joinChannel = exports.reconnect = void 0;
const chat_1 = require("@twurple/chat");
const sohandler_1 = require("./sohandler");
const customCommandHandler_1 = require("./customCommandHandler");
const adminCommandHandler_1 = require("./adminCommandHandler");
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const index_1 = require("../api/index");
const fetch = __importStar(require("node-fetch"));
const utils_1 = require("./utils");
let chatClient;
function main() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // let auth = JSON.parse(await fs.readFile('./auth.js', 'utf-8'));
        dotenv.config();
        (0, index_1.setupAPI)();
        let auth = {
            clientID: (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "",
            clientSecret: (_b = process.env.CLIENT_SECRET) !== null && _b !== void 0 ? _b : ""
        };
        // console.log(auth);
        // console.log(process.env)
        let authProvider = yield (0, utils_1.getAuthProvider)();
        // let channels = [settings.channel]
        // let channels = ['itsgillibean','speeeedtv', 'itschachatv']
        // let channels = settings.map((p: any) => p.channel);
        // console.log(channels)
        // chatClient = new ChatClient({ authProvider, channels: channels });
        let getChannelsURL = process.env.APIURL + "/db/channels";
        chatClient = new chat_1.ChatClient({ authProvider, channels: () => __awaiter(this, void 0, void 0, function* () { return yield fetch.default(getChannelsURL).then((p) => { return p.json(); }).then((p) => { return p; }).catch((err) => { console.log(err); return ['speeeedtv']; }); }) });
        yield (0, sohandler_1.SOInit)(chatClient);
        yield (0, customCommandHandler_1.init)(chatClient);
        yield (0, adminCommandHandler_1.init)();
        yield chatClient.connect();
        chatClient.onMessage((channel, user, message, msg) => __awaiter(this, void 0, void 0, function* () {
            // get channel settings
            let getChannelUrl = process.env.APIURL + "/db/channels/" + channel.replace("#", "");
            let channelSettings = yield fetch.default(getChannelUrl).then((p) => { return p.json(); }).then((p) => { return p; }).catch((err) => { return { enabled: false, message: err }; });
            // log(channelSettings);
            if (channelSettings.enabled) {
                if (process.env.ENV != 'LOCAL') {
                    // handleSOMessage(user, message, channel, chatClient, channelSettings, msg);
                }
                (0, sohandler_1.handleSOMessage)(user, message, channel, chatClient, channelSettings, msg);
                (0, customCommandHandler_1.handleMessage)(user, message, channel, chatClient);
            }
            else {
                (0, utils_1.log)("Bot is disabled in the channel.Skipping handler");
            }
            (0, adminCommandHandler_1.handleMessage)(user, message, channel, chatClient, channelSettings, msg);
            // handshake
            if (message.startsWith("PING") && user !== 'bot_ng_bayan') {
                chatClient.say(channel, message.replace('PING', 'PONG'));
            }
        }));
        chatClient.onSub((channel, user) => {
            chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
        });
        chatClient.onResub((channel, user, subInfo) => {
            chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
        });
        chatClient.onSubGift((channel, user, subInfo) => {
            chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
        });
        chatClient.onJoin((channel, user) => __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.log)("joined " + channel);
            //reinit SOlist
            yield (0, sohandler_1.SOReinit)(channel);
        }));
    });
}
function reconnect() {
    return __awaiter(this, void 0, void 0, function* () {
        let channels = yield fetch.default(process.env.APIURL + "/db/channels").then((p) => { return p.json(); }).then((p) => { return p; });
        (0, utils_1.log)(channels);
        yield chatClient.reconnect();
    });
}
exports.reconnect = reconnect;
function joinChannel(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, utils_1.log)("tryng to join channel: " + channel);
        yield chatClient.join(channel);
        return "Joined channel:" + channel;
    });
}
exports.joinChannel = joinChannel;
function say(channel, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        chatClient.say(channel, msg);
        return;
    });
}
exports.say = say;
function getCurrentChannels() {
    return __awaiter(this, void 0, void 0, function* () {
        let channels = chatClient.currentChannels;
        (0, utils_1.log)(channels.join(','));
        return channels;
    });
}
exports.getCurrentChannels = getCurrentChannels;
main();
