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
let serviceCommands = [];
function init() {
    serviceCommands = [{
            command: "!join",
            handler: joinChannel
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
function joinChannel(user, messsage, channel, chatClient) {
    return __awaiter(this, void 0, void 0, function* () {
        //check user
        (0, utils_1.log)("checking user");
        let isExists = yield (0, utils_1.getSOChannel)(user);
        if (isExists.status === "success") {
            //add user
            (0, utils_1.log)("channel doesnt exist yet, creating channel");
            let isAdded = yield (0, utils_1.addChannel)(user);
            console.log(isAdded);
        }
        //join channel
        chatClient.join(user);
    });
}
