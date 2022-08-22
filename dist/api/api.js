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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../src/index");
const sohandler_1 = require("../src/sohandler");
const utils_1 = require("../src/utils");
const router = express_1.default.Router();
// define the home page route
router.get('/', (req, res) => {
    res.send('API home page');
});
// define the about route
router.get('/about', (req, res) => {
    res.send('About ');
});
router.get('/reconnect', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, index_1.reconnect)();
    res.send('reconnected');
}));
router.get('/soreset/:channel', (req, res) => {
    (0, sohandler_1.soReset)(req.params.channel);
    res.send('Channel SO List Reset! ');
});
router.get('/soreset/all', (req, res) => {
    (0, sohandler_1.soResetAll)();
    res.send('All Channel SO List Reset! ');
});
router.get('/solist/:channel', (req, res) => {
    res.send((0, sohandler_1.soList)(req.params.channel));
});
router.get('/subs/:channel', (req, res) => {
    (0, utils_1.getSubs)(req.params.channel);
    res.send("done");
});
router.get('/user/:userid/follows/:channel', (req, res) => {
    (0, utils_1.getUserFollowsChannel)(req.params.userid, req.params.channel);
    res.send("done");
});
router.get('/say/:channel/:msg', (req, res) => {
    let { channel, msg } = req.params;
    (0, index_1.say)(channel, msg);
    res.send("Sent");
});
router.get('/logs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let logs = yield (0, utils_1.getLogs)();
    res.json(logs);
}));
module.exports = router;
