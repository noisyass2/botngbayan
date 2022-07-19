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
let settings = JSON.parse(fs.readFileSync("./settings.json", 'utf-8'));
let customCommands = [];
let serviceCommands = [];
function init() {
    serviceCommands = [{
            command: "!addcmd",
            handler: addCommand
        }, {
            command: "!listcmd",
            handler: listCommands
        }, {
            command: "!editcmd",
            handler: editCommand
        }, {
            command: "!addresponse",
            handler: addResponse
        }];
}
exports.init = init;
function handleMessage(user, message, channel, chatClient) {
    if (!message.startsWith("!"))
        return;
    let soChannel = settings.find((p) => p.channel == channel.replace('#', ''));
    console.log("handling soChannel:" + soChannel);
    if (!soChannel)
        return;
    customCommands = soChannel.customCommands;
    console.log("handling customCommands:" + customCommands);
    if (message.startsWith("!")) {
        console.log("handling custom msg:" + message);
        customCommands.forEach((customCommand) => {
            if (message === customCommand.command) {
                let responses = customCommand.responses;
                let response = responses[Math.floor(Math.random() * responses.length)];
                chatClient.action(channel, response);
            }
        });
        // for adding and editing commands
        serviceCommands.forEach(svcCommand => {
            if (message.startsWith(svcCommand.command)) {
                svcCommand.handler(user, message, channel, chatClient);
            }
        });
    }
}
exports.handleMessage = handleMessage;
function addCommand(user, message, channel, chatClient) {
    let splitMsg = message.split(" ");
    if (splitMsg.length > 1) {
        let command = splitMsg.splice(0, 2)[1];
        let cmdMessage = splitMsg.join(" ");
        customCommands.push({
            command: command,
            responses: [
                cmdMessage
            ]
        });
        //save
        saveSettings();
        //reply
        chatClient.say(channel, "New Custom Command Added!");
    }
}
function editCommand(user, message, channel, chatClient) {
    let splitMsg = message.split(" ");
    if (splitMsg.length > 1) {
        let command = splitMsg.splice(0, 2)[1];
        let cmdMessage = splitMsg.join(" ");
        let customCommand = customCommands.find((p) => { return p.command == command; });
        if (customCommand) {
            customCommand.responses = [cmdMessage];
            //save
            saveSettings();
            //reply
            chatClient.say(channel, "Custom Command Edited!");
        }
    }
}
function addResponse(user, message, channel, chatClient) {
    let splitMsg = message.split(" ");
    if (splitMsg.length > 1) {
        let command = splitMsg.splice(0, 2)[1];
        let cmdMessage = splitMsg.join(" ");
        let customCommand = customCommands.find((p) => { return p.command == command; });
        if (customCommand) {
            customCommand.responses.push(cmdMessage);
            //save
            saveSettings();
            //reply
            chatClient.say(channel, "Custom Response Added to " + customCommand.command);
        }
    }
}
function saveSettings() {
    fs.writeFileSync('./settings.json', JSON.stringify(settings));
}
function listCommands(user, message, channel, chatClient) {
    let cmds = customCommands.map(c => { return c.command; }).join(",");
    chatClient.say(channel, "Here's the commands: " + cmds);
}
