"use strict";
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
const auth_1 = require("@twurple/auth");
const chat_1 = require("@twurple/chat");
const fs_1 = require("fs");
const sohandler_1 = require("./sohandler");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let auth = JSON.parse(yield fs_1.promises.readFile('./auth.js', 'utf-8'));
        let settings = JSON.parse(yield fs_1.promises.readFile('./settings.json', 'utf-8'));
        const clientId = auth.clientID;
        const clientSecret = auth.clientSecret;
        const tokenData = JSON.parse(yield fs_1.promises.readFile('./tokens.json', 'utf-8'));
        const authProvider = new auth_1.RefreshingAuthProvider({
            clientId,
            clientSecret,
            onRefresh: (newTokenData) => __awaiter(this, void 0, void 0, function* () { return yield fs_1.promises.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf-8'); })
        }, tokenData);
        (0, sohandler_1.init)();
        const chatClient = new chat_1.ChatClient({ authProvider, channels: [settings.channel] });
        yield chatClient.connect();
        chatClient.onMessage((channel, user, message) => {
            if (message === '!ping') {
                chatClient.say(channel, 'Pong!');
            }
            (0, sohandler_1.handleMessage)(user, message, channel, chatClient);
        });
        chatClient.onSub((channel, user) => {
            chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
        });
        chatClient.onResub((channel, user, subInfo) => {
            chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
        });
        chatClient.onSubGift((channel, user, subInfo) => {
            chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
        });
    });
}
main();
