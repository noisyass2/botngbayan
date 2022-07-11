"use strict";
exports.__esModule = true;
exports.handleMessage = exports.init = void 0;
var fs = require("fs");
var settings = JSON.parse(fs.readFileSync("./settings.json", 'utf-8'));
var customCommands = [];
var serviceCommands = [];
function init() {
    customCommands = settings.customCommands;
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
    console.log(message);
    if (message.startsWith("!")) {
        customCommands.forEach(function (customCommand) {
            if (message === customCommand.command) {
                var responses = customCommand.responses;
                var response = responses[Math.floor(Math.random() * responses.length)];
                chatClient.action(channel, response);
            }
        });
        // for adding and editing commands
        serviceCommands.forEach(function (svcCommand) {
            if (message.startsWith(svcCommand.command)) {
                svcCommand.handler(user, message, channel, chatClient);
            }
        });
    }
}
exports.handleMessage = handleMessage;
function addCommand(user, message, channel, chatClient) {
    var splitMsg = message.split(" ");
    if (splitMsg.length > 1) {
        var command = splitMsg.splice(0, 2)[1];
        var cmdMessage = splitMsg.join(" ");
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
    var splitMsg = message.split(" ");
    if (splitMsg.length > 1) {
        var command_1 = splitMsg.splice(0, 2)[1];
        var cmdMessage = splitMsg.join(" ");
        var customCommand = customCommands.find(function (p) { return p.command == command_1; });
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
    var splitMsg = message.split(" ");
    if (splitMsg.length > 1) {
        var command_2 = splitMsg.splice(0, 2)[1];
        var cmdMessage = splitMsg.join(" ");
        var customCommand = customCommands.find(function (p) { return p.command == command_2; });
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
    var cmds = customCommands.map(function (c) { return c.command; }).join(",");
    chatClient.say(channel, "Here's the commands: " + cmds);
}
