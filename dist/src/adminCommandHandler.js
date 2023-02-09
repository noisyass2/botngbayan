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
const fs = __importStar(require("fs"));
const sohandler_1 = require("./sohandler");
const utils_1 = require("./utils");
let settings = JSON.parse(fs.readFileSync("./settings.json", 'utf-8'));
let customCommands = [];
let serviceCommands = [];
function init() {
    serviceCommands = [{
            command: "!soreset",
            handler: soResetChannel
        }, {
            command: "!sooff",
            handler: soOff
        }, {
            command: "!soon",
            handler: soOn
        },
    ];
}
exports.init = init;
function handleMessage(user, message, channel, chatClient, channelSettings, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        // if(user !== channel.replace('#','')) return; // message is not from streamer
        if (!message.startsWith("!"))
            return; // message is not a command
        if (!channelSettings)
            return; // not an existing user.
        let userInfo = msg.userInfo;
        let { isSubscriber } = userInfo;
        if (isSubscriber && message.startsWith("!")) {
            (0, utils_1.log)("handling admin command " + message);
            // for adding and editing commands
            serviceCommands.forEach(svcCommand => {
                console.log(svcCommand);
                if (message.startsWith(svcCommand.command)) {
                    (0, utils_1.log)("handling admin command " + svcCommand.command);
                    svcCommand.handler(userInfo, message, channel, channelSettings, chatClient);
                }
            });
        }
    });
}
exports.handleMessage = handleMessage;
function soResetChannel(user, messsage, channel, channelSettings, chatClient) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, sohandler_1.soReset)(channel);
        chatClient.say(channel, "SO list is now empty.");
    });
}
function soOff(user, messsage, channel, channelSettings, chatClient) {
    return __awaiter(this, void 0, void 0, function* () {
        let channelName = channel.replace("#", "");
        if (channelSettings) {
            channelSettings.enabled = false;
            yield (0, utils_1.saveSoChannelSettings)(channelName, channelSettings).then((p) => {
                console.log(p);
                chatClient.say(channel, "Thank you for trying the service. Bot will now stop responding to any messages. Use command !soon to turn the bot back on.");
            });
        }
    });
}
function soOn(user, messsage, channel, channelSettings, chatClient) {
    return __awaiter(this, void 0, void 0, function* () {
        let channelName = channel.replace("#", "");
        if (channelSettings) {
            channelSettings.enabled = true;
            yield (0, utils_1.saveSoChannelSettings)(channelName, channelSettings).then((p) => {
                console.log(p);
                chatClient.say(channel, "Thank you for trying the service. Bot will now stop responding to any messages. Use command !soon to turn the bot back on.");
            });
        }
    });
}
