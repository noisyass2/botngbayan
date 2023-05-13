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
exports.announceViaAPI = exports.shoutOutViaAPI = exports.addCount = exports.saveSoChannelSettings = exports.getLogs = exports.log = exports.getUserFollowsChannel = exports.getSubs = exports.getSOChannel = exports.getAuthProvider = void 0;
const fetch = __importStar(require("node-fetch"));
const dotenv = __importStar(require("dotenv"));
const fs_1 = require("fs");
const auth_1 = require("@twurple/auth");
const api_1 = require("@twurple/api");
let logs = [];
let authProvider;
function getAuthProvider() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        if (authProvider == undefined) {
            dotenv.config();
            let auth = {
                clientID: (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "",
                clientSecret: (_b = process.env.CLIENT_SECRET) !== null && _b !== void 0 ? _b : ""
            };
            // generat new one
            // let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
            const clientId = auth.clientID;
            const clientSecret = auth.clientSecret;
            const tokenData = JSON.parse(yield fs_1.promises.readFile('./tokens.807926669.json', 'utf-8'));
            authProvider = new auth_1.RefreshingAuthProvider({
                clientId,
                clientSecret,
                onRefresh: (userId, newTokenData) => __awaiter(this, void 0, void 0, function* () { return yield fs_1.promises.writeFile(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'utf-8'); })
            });
            authProvider.addUserForToken(tokenData, ['chat']);
            return authProvider;
        }
        return authProvider;
    });
}
exports.getAuthProvider = getAuthProvider;
function getSOChannel(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        let getChannelURL = process.env.APIURL + "/db/channels/" + channel.replace('#', '');
        let soChannel = yield fetch.default(getChannelURL).then((p) => { return p.json(); }).then((p) => { return p; }).catch((err) => {
            log(err);
            return null;
        });
        if (soChannel) {
            return soChannel;
        }
        else {
            return null;
        }
    });
}
exports.getSOChannel = getSOChannel;
function getSubs(channel) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        dotenv.config();
        let auth = {
            clientID: (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "",
            clientSecret: (_b = process.env.CLIENT_SECRET) !== null && _b !== void 0 ? _b : ""
        };
        // console.log(auth);
        // console.log(process.env)
        let settings = JSON.parse(yield fs_1.promises.readFile('./settings.json', 'utf-8'));
        const clientId = auth.clientID;
        const clientSecret = auth.clientSecret;
        const tokenData = JSON.parse(yield fs_1.promises.readFile('./tokenstwo.json', 'utf-8'));
        const authProvider = new auth_1.RefreshingAuthProvider({
            clientId,
            clientSecret,
            onRefresh: (newTokenData) => __awaiter(this, void 0, void 0, function* () { return yield fs_1.promises.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf-8'); })
        });
        authProvider.addUserForToken(tokenData);
        const apiClient = new api_1.ApiClient({ authProvider });
        apiClient.users.getUserByName(channel)
            .then(p => {
            if (p) {
                let { broadcasterType, creationDate, description, displayName, id, name, offlinePlaceholderUrl, profilePictureUrl, type, } = p;
                console.log({
                    broadcasterType,
                    creationDate,
                    description,
                    displayName,
                    id,
                    name,
                    offlinePlaceholderUrl,
                    profilePictureUrl,
                    type,
                });
                // get subs
                apiClient.subscriptions.getSubscriptionsPaginated(p.id)
                    .getAll()
                    .then(p => {
                    p.forEach(sub => {
                        let { broadcasterDisplayName, broadcasterId, broadcasterName, gifterDisplayName, gifterId, gifterName, isGift, tier, userDisplayName, userId, userName, } = sub;
                        console.log(broadcasterDisplayName, broadcasterId, broadcasterName, gifterDisplayName, gifterId, gifterName, isGift, tier, userDisplayName, userId, userName);
                    });
                });
            }
        });
        return;
    });
}
exports.getSubs = getSubs;
function getUserFollowsChannel(userid, channel) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        dotenv.config();
        let auth = {
            clientID: (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "",
            clientSecret: (_b = process.env.CLIENT_SECRET) !== null && _b !== void 0 ? _b : ""
        };
        // console.log(auth);
        // console.log(process.env)
        let settings = JSON.parse(yield fs_1.promises.readFile('./settings.json', 'utf-8'));
        const clientId = auth.clientID;
        const clientSecret = auth.clientSecret;
        const tokenData = JSON.parse(yield fs_1.promises.readFile('./tokenstwo.json', 'utf-8'));
        const authProvider = new auth_1.RefreshingAuthProvider({
            clientId,
            clientSecret,
            onRefresh: (newTokenData) => __awaiter(this, void 0, void 0, function* () { return yield fs_1.promises.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf-8'); })
        });
        authProvider.addUserForToken(tokenData);
        const apiClient = new api_1.ApiClient({ authProvider });
        apiClient.users.userFollowsBroadcaster(userid, channel).then((p) => {
            console.log(p);
        });
    });
}
exports.getUserFollowsChannel = getUserFollowsChannel;
function log(msg) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(msg);
        let dt = +("" + new Date().getMonth()).padStart(2, "0") + "/" + ("" + new Date().getDate()).padStart(2, "0") + " "
            + ("" + new Date().getHours()).padStart(2, "0") + ":" + ("" + new Date().getMinutes()).padStart(2, "0")
            + ":" + ("" + new Date().getSeconds()).padStart(2, "0");
        if (logs.length > 20) {
            logs.shift();
        }
        logs.push(dt + "|" + msg);
    });
}
exports.log = log;
function getLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        return logs;
    });
}
exports.getLogs = getLogs;
function saveSoChannelSettings(channel, channelSettings) {
    return __awaiter(this, void 0, void 0, function* () {
        let updateSettingsURL = process.env.APIURL + "/db/channels/saveGenSettings/" + channel;
        yield fetch.default(updateSettingsURL, {
            method: 'post',
            body: JSON.stringify(channelSettings),
            headers: { 'Content-Type': 'application/json' }
        }).then((p) => {
            return p.json();
        }).then((p) => {
            return p;
        });
    });
}
exports.saveSoChannelSettings = saveSoChannelSettings;
function addCount(channel) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
exports.addCount = addCount;
function shoutOutViaAPI(userToSo, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let aProvider = yield getAuthProvider();
            console.log(aProvider);
            const apiClient = new api_1.ApiClient({ authProvider: aProvider });
            let chid = yield apiClient.users.getUserByName(channel.replace("#", ""));
            let usid = yield apiClient.users.getUserByName(userToSo);
            if (chid && usid) {
                apiClient.chat.shoutoutUser(chid, usid, 807926669);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.shoutOutViaAPI = shoutOutViaAPI;
function announceViaAPI(message, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        let aProvider = yield getAuthProvider();
        console.log(aProvider);
        const apiClient = new api_1.ApiClient({ authProvider: aProvider });
        let users = yield apiClient.users.getUsersByNames([channel.replace("#", "")]);
        log(users.map(p => p.id).join(","));
        // apiClient.chat.shoutoutUser(users[0].id, users[1].id, users[0].id);
        apiClient.chat.sendAnnouncement(users[0].id, 807926669, { message: message, color: "green" });
    });
}
exports.announceViaAPI = announceViaAPI;
