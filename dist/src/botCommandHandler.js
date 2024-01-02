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
exports.handleMessage = exports.init = void 0;
const utils_1 = require("./utils");
const sohandler_1 = require("./sohandler");
let serviceCommands = [];
function init() {
    serviceCommands = [{
            command: "!join",
            handler: joinChannel
        }, {
            command: "!leave",
            handler: leaveChannel
        }, {
            command: "!msg",
            handler: fetchSOMsg
        }, {
            command: "!setmsg",
            handler: setSOMsg
        },
    ];
}
exports.init = init;
function handleMessage(user, message, channel, chatClient) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!message.startsWith("!"))
            return; // message is not a command
        // for adding and editing commands
        serviceCommands.forEach(svcCommand => {
            if (message.toLowerCase().startsWith(svcCommand.command)) {
                (0, utils_1.log)("handling bot command " + svcCommand.command);
                svcCommand.handler(user, message, channel, chatClient);
            }
        });
    });
}
exports.handleMessage = handleMessage;
function joinChannel(user, message, channel, chatClient) {
    return __awaiter(this, void 0, void 0, function* () {
        //check user
        (0, utils_1.log)("checking user");
        let isAdded = yield (0, utils_1.addChannel)(user);
        console.log(isAdded);
        //join channel
        chatClient.join(user);
        chatClient.say(channel, "Bot joined " + user + "'s chat. Kindly give it a bit of time to boot up. Check on your next stream.");
        yield (0, sohandler_1.newChannel)(user);
    });
}
function leaveChannel(user, message, channel, chatClient) {
    return __awaiter(this, void 0, void 0, function* () {
        //check user
        (0, utils_1.log)("checking user");
        let isExists = yield (0, utils_1.getSOChannel)(user);
        if (isExists.status === undefined && isExists.enabled) {
            //add user
            (0, utils_1.log)("channel found, removing channel");
            let isRemoved = yield (0, utils_1.removeChannel)(user);
            //leave channel
            console.log(isRemoved);
            chatClient.part(user);
            chatClient.say(channel, "Bot left " + user + "'s chat. Thank you for trying it out.");
        }
    });
}
function fetchSOMsg(user, message, channel, chatClient) {
    return __awaiter(this, void 0, void 0, function* () {
        //check user
        (0, utils_1.log)("checking user");
        let isExists = yield (0, utils_1.getSOChannel)(user);
        if (isExists.enabled) {
            console.log(isExists);
            //add user
            // log("channel found, removing channel")
            // let isRemoved = await removeChannel(user);
            // //leave channel
            // console.log(isRemoved);
            // chatClient.part(user);
            (0, utils_1.log)("Hi there " + user + "." + " Your current SO message is set as:" + isExists.soMessageTemplate);
            chatClient.say(channel, "Hi there " + user + "." + " Your current SO message is set as:" + isExists.soMessageTemplate);
        }
    });
}
function setSOMsg(user, message, channel, chatClient) {
    return __awaiter(this, void 0, void 0, function* () {
        //check user
        (0, utils_1.log)("checking user");
        let isExists = yield (0, utils_1.getSOChannel)(user);
        if (isExists.enabled) {
            console.log(isExists);
            let soMsg = message.replace("!setmsg ", "");
            let updated = yield (0, utils_1.saveSoChannelSettings)(user, { "soMessageTemplate": soMsg });
            console.log(updated);
            chatClient.say(channel, "Hi there " + user + "." + " Your current SO message is set as:" + updated.soMessageTemplate);
        }
    });
}
