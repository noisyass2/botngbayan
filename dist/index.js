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
const auth_1 = require("@twurple/auth");
const chat_1 = require("@twurple/chat");
const fs_1 = require("fs");
const sohandler_1 = require("./sohandler");
const customCommandHandler_1 = require("./customCommandHandler");
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
function main() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // let auth = JSON.parse(await fs.readFile('./auth.js', 'utf-8'));
        dotenv.config();
        setupSOClipper();
        let auth = {
            clientID: (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "",
            clientSecret: (_b = process.env.CLIENT_SECRET) !== null && _b !== void 0 ? _b : ""
        };
        // console.log(auth);
        // console.log(process.env)
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
        (0, customCommandHandler_1.init)();
        // let channels = [settings.channel]
        // let channels = ['itsgillibean','speeeedtv', 'itschachatv']
        let channels = settings.map((p) => p.channel);
        console.log(channels);
        const chatClient = new chat_1.ChatClient({ authProvider, channels: channels });
        yield chatClient.connect();
        chatClient.onMessage((channel, user, message) => {
            (0, sohandler_1.handleMessage)(user, message, channel, chatClient);
            (0, customCommandHandler_1.handleMessage)(user, message, channel, chatClient);
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
function setupSOClipper() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let appjs = yield fs_1.promises.readFile('./viewer/app.js', 'utf-8');
        appjs = appjs.replace('{CLIENT_ID}', (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "");
        appjs = appjs.replace('{CLIENT_SECRET}', (_b = process.env.CLIENT_SECRET) !== null && _b !== void 0 ? _b : "");
        yield fs_1.promises.writeFile('./viewer/app.js', appjs, 'utf-8');
        app.get('/', (req, res) => {
            res.send("HELLO FROM BOT NG BAYAN!");
        });
        app.use(express_1.default.static('viewer'));
        app.listen(process.env.PORT, () => {
            console.log(`⚡️[server]: Server is running at https://localhost:${process.env.PORT}`);
        });
    });
}
main();