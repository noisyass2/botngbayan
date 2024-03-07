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
exports.removeBans = exports.getDebug = exports.setDebug = exports.getFollowages = exports.removeChannel = exports.addChannel = exports.addCount = exports.saveSoChannelSettings = exports.getLogs = exports.log = exports.getSOChannel = void 0;
const fetch = __importStar(require("node-fetch"));
let logs = [];
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
// export async function getSubs(channel: string) {
//     dotenv.config();
//     let auth: IAuth = {
//         clientID: process.env.CLIENT_ID ?? "",
//         clientSecret: process.env.CLIENT_SECRET ?? ""
//     }
//     // console.log(auth);
//     // console.log(process.env)
//     let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
//     const clientId = auth.clientID;
//     const clientSecret = auth.clientSecret;
//     const tokenData = JSON.parse(await fs.readFile('./tokenstwo.json', 'utf-8'));
//     const authProvider = new RefreshingAuthProvider(
//         {
//             clientId,
//             clientSecret,
//             onRefresh: async newTokenData => await fs.writeFile('./tokenstwo.json', JSON.stringify(newTokenData, null, 4), 'utf-8')
//         },
//         tokenData
//     );
//     const apiClient = new ApiClient({ authProvider });
//     apiClient.users.getUserByName(channel)
//         .then(p => {
//             if (p) {
//                 let { broadcasterType,
//                     creationDate,
//                     description,
//                     displayName,
//                     id,
//                     name,
//                     offlinePlaceholderUrl,
//                     profilePictureUrl,
//                     type, } = p;
//                 console.log({
//                     broadcasterType,
//                     creationDate,
//                     description,
//                     displayName,
//                     id,
//                     name,
//                     offlinePlaceholderUrl,
//                     profilePictureUrl,
//                     type,
//                 })
//                 // get subs
//                 apiClient.subscriptions.getSubscriptionsPaginated(p.id)
//                     .getAll()
//                     .then(p => {
//                         p.forEach(sub => {
//                             let { broadcasterDisplayName,
//                                 broadcasterId,
//                                 broadcasterName,
//                                 gifterDisplayName,
//                                 gifterId,
//                                 gifterName,
//                                 isGift,
//                                 tier,
//                                 userDisplayName,
//                                 userId,
//                                 userName, } = sub
//                             console.log(broadcasterDisplayName,
//                                 broadcasterId,
//                                 broadcasterName,
//                                 gifterDisplayName,
//                                 gifterId,
//                                 gifterName,
//                                 isGift,
//                                 tier,
//                                 userDisplayName,
//                                 userId,
//                                 userName)
//                         });
//                     })
//             }
//         });
//     return;
// }
// export async function getUserFollowsChannel(userid: string, channel: string) {
//     dotenv.config();
//     let auth: IAuth = {
//         clientID: process.env.CLIENT_ID ?? "",
//         clientSecret: process.env.CLIENT_SECRET ?? ""
//     }
//     // console.log(auth);
//     // console.log(process.env)
//     let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
//     const clientId = auth.clientID;
//     const clientSecret = auth.clientSecret;
//     const tokenData = JSON.parse(await fs.readFile('./tokenstwo.json', 'utf-8'));
//     const authProvider = new RefreshingAuthProvider(
//         {
//             clientId,
//             clientSecret,
//             onRefresh: async newTokenData => await fs.writeFile('./tokenstwo.json', JSON.stringify(newTokenData, null, 4), 'utf-8')
//         },
//         tokenData
//     );
//     const apiClient = new ApiClient({ authProvider });
//     apiClient.users.userFollowsBroadcaster(userid, channel).then((p) => {
//         console.log(p);
//     })
// }
function log(msg, level) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof level === 'undefined') {
            level = 'local';
        }
        if (level === 'local' && process.env.ENV == 'local' || level === 'prod') {
            console.log(msg);
        }
        else if (level === 'prod' && process.env.ENV !== 'local') {
            console.log(msg);
        }
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
        return yield fetch.default(updateSettingsURL, {
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
function addCount(num) {
    return __awaiter(this, void 0, void 0, function* () {
        let addCountURL = process.env.APIURL + "/db/addCount/channel/" + num;
        yield fetch.default(addCountURL, {
            method: 'post',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' }
        }).then((p) => {
            return p.json();
        }).then((p) => {
            return p;
        }).catch((err) => {
            console.log(err);
        });
    });
}
exports.addCount = addCount;
function addChannel(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        let addChannelURL = process.env.APIURL + "/db/addChannel";
        yield fetch.default(addChannelURL, {
            method: 'post',
            body: JSON.stringify({ channel: channel }),
            headers: { 'Content-Type': 'application/json' }
        }).then((p) => {
            return p;
        }).catch((err) => {
            console.log(err);
        });
    });
}
exports.addChannel = addChannel;
function removeChannel(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        let remChannelURL = process.env.APIURL + "/db/removeChannel";
        yield fetch.default(remChannelURL, {
            method: 'post',
            body: JSON.stringify({ channel: channel }),
            headers: { 'Content-Type': 'application/json' }
        }).then((p) => {
            return p;
        }).catch((err) => {
            console.log(err);
        });
    });
}
exports.removeChannel = removeChannel;
function getFollowages(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        let followURL = process.env.APIURL + "/db/getFollowage/" + channel;
        return yield fetch.default(followURL, {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        }).then((p) => {
            return p.text();
        }).catch((err) => {
            console.log(err);
            return "Something went wrong! try again later";
        });
    });
}
exports.getFollowages = getFollowages;
let isDebug = false;
function setDebug(flag) {
    if (flag == "true") {
        isDebug = true;
    }
    else {
        isDebug = false;
    }
}
exports.setDebug = setDebug;
function getDebug() {
    return isDebug;
}
exports.getDebug = getDebug;
function removeBans() {
    return __awaiter(this, void 0, void 0, function* () {
        let banUsers = [];
        banUsers.forEach((user) => __awaiter(this, void 0, void 0, function* () {
            let remChannelURL = "https://bot-ng-bayan-api.herokuapp.com" + "/db/removeChannel/";
            yield fetch.default(remChannelURL, {
                method: 'post',
                body: JSON.stringify({ channel: user }),
                headers: { 'Content-Type': 'application/json' }
            }).then((p) => {
                console.log(user + " removed");
                return p;
            }).catch((err) => {
                console.log(err);
            });
        }));
    });
}
exports.removeBans = removeBans;
