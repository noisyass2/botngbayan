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
exports.say = exports.reconnect = void 0;
const auth_1 = require("@twurple/auth");
const chat_1 = require("@twurple/chat");
const fs_1 = require("fs");
const sohandler_1 = require("./sohandler");
const customCommandHandler_1 = require("./customCommandHandler");
const adminCommandHandler_1 = require("./adminCommandHandler");
const botCommandHandler_1 = require("./botCommandHandler");
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const index_1 = require("../api/index");
const fetch = __importStar(require("node-fetch"));
const utils_1 = require("./utils");
let chatClient;
function main() {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        // let auth = JSON.parse(await fs.readFile('./auth.js', 'utf-8'));
        dotenv.config();
        (0, index_1.setupAPI)();
        let auth = {
            clientID: (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "",
            clientSecret: (_b = process.env.CLIENT_SECRET) !== null && _b !== void 0 ? _b : "",
            accessToken: (_c = process.env.ACCESS_TOKEN) !== null && _c !== void 0 ? _c : "",
            refreshToken: (_d = process.env.REFRESH_TOKEN) !== null && _d !== void 0 ? _d : ""
        };
        // console.log(auth);
        // console.log(process.env)
        // let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
        const clientId = auth.clientID;
        const clientSecret = auth.clientSecret;
        const accessToken = auth.accessToken;
        const refreshToken = auth.refreshToken;
        const tokenData = JSON.parse(yield fs_1.promises.readFile('./tokens.json', 'utf-8'));
        const authProvider = new auth_1.RefreshingAuthProvider({
            clientId,
            clientSecret
        });
        authProvider.onRefresh((userId, newTokenData) => __awaiter(this, void 0, void 0, function* () { return yield fs_1.promises.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4)); }));
        yield authProvider.addUserForToken({
            accessToken,
            refreshToken,
            expiresIn: null,
            obtainmentTimestamp: 0
        }, ['chat']);
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
        yield (0, botCommandHandler_1.init)();
        yield chatClient.connect();
        chatClient.onMessage((channel, user, message, msg) => __awaiter(this, void 0, void 0, function* () {
            if (channel === 'bot_ng_bayan' || channel === 'fpvspeed') {
                (0, botCommandHandler_1.handleMessage)(user, message, channel, chatClient);
            }
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
                chatClient.part(channel);
            }
            //handleAdminMessage(user, message, channel, chatClient, channelSettings, msg);
            // handshake
            if (message.startsWith("PING") && user !== 'bot_ng_bayan') {
                chatClient.say(channel, message.replace('PING', 'PONG'));
            }
        }));
        chatClient.onSub((channel, user) => {
            if (channel === "#speeeedtv") {
                chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
            }
        });
        chatClient.onResub((channel, user, subInfo) => {
            if (channel === "#speeeedtv") {
                chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
            }
        });
        chatClient.onSubGift((channel, user, subInfo) => {
            if (channel === "#speeeedtv") {
                chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
            }
        });
        chatClient.onJoin((channel, user) => __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.log)("joined " + channel, "prod");
            //reinit SOlist
            yield (0, sohandler_1.SOReinit)(channel);
        }));
        chatClient.onJoinFailure((channel, reason) => {
            (0, utils_1.log)("JOIN FAILED:" + channel + "(" + reason + ")", "prod");
        });
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
function say(channel, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        chatClient.say(channel, msg);
        return;
    });
}
exports.say = say;
main();
