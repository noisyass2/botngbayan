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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var auth_1 = require("@twurple/auth");
var chat_1 = require("@twurple/chat");
var fs_1 = require("fs");
var sohandler_1 = require("./sohandler");
var customCommandHandler_1 = require("./customCommandHandler");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var auth, _a, _b, settings, _c, _d, clientId, clientSecret, tokenData, _e, _f, authProvider, chatClient;
        var _this = this;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile('./auth.js', 'utf-8')];
                case 1:
                    auth = _b.apply(_a, [_g.sent()]);
                    _d = (_c = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile('./settings.json', 'utf-8')];
                case 2:
                    settings = _d.apply(_c, [_g.sent()]);
                    clientId = auth.clientID;
                    clientSecret = auth.clientSecret;
                    _f = (_e = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile('./tokens.json', 'utf-8')];
                case 3:
                    tokenData = _f.apply(_e, [_g.sent()]);
                    authProvider = new auth_1.RefreshingAuthProvider({
                        clientId: clientId,
                        clientSecret: clientSecret,
                        onRefresh: function (newTokenData) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fs_1.promises.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf-8')];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }
                    }, tokenData);
                    (0, sohandler_1.init)();
                    (0, customCommandHandler_1.init)();
                    chatClient = new chat_1.ChatClient({ authProvider: authProvider, channels: [settings.channel] });
                    return [4 /*yield*/, chatClient.connect()];
                case 4:
                    _g.sent();
                    chatClient.onMessage(function (channel, user, message) {
                        (0, sohandler_1.handleMessage)(user, message, channel, chatClient);
                        (0, customCommandHandler_1.handleMessage)(user, message, channel, chatClient);
                    });
                    chatClient.onSub(function (channel, user) {
                        chatClient.say(channel, "Thanks to @".concat(user, " for subscribing to the channel!"));
                    });
                    chatClient.onResub(function (channel, user, subInfo) {
                        chatClient.say(channel, "Thanks to @".concat(user, " for subscribing to the channel for a total of ").concat(subInfo.months, " months!"));
                    });
                    chatClient.onSubGift(function (channel, user, subInfo) {
                        chatClient.say(channel, "Thanks to ".concat(subInfo.gifter, " for gifting a subscription to ").concat(user, "!"));
                    });
                    return [2 /*return*/];
            }
        });
    });
}
main();
