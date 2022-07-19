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
exports.setupAPI = void 0;
const fs_1 = require("fs");
const express_1 = __importDefault(require("express"));
const api = require('./api');
const app = (0, express_1.default)();
function setupAPI() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let appjs = yield fs_1.promises.readFile('./viewer/app.js', 'utf-8');
        appjs = appjs.replace('{CLIENTID}', (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "");
        appjs = appjs.replace('{CLIENTSECRET}', (_b = process.env.CLIENT_SECRET) !== null && _b !== void 0 ? _b : "");
        yield fs_1.promises.writeFile('./viewer/app.js', appjs, 'utf-8');
        app.get('/', (req, res) => {
            res.send("HELLO FROM BOT NG BAYAN!");
        });
        app.use(express_1.default.static('viewer'));
        app.use('/api', api);
        //console.log(api);
        app.listen(process.env.PORT, () => {
            console.log(`⚡️[server]: Server is running at https://localhost:${process.env.PORT}`);
        });
    });
}
exports.setupAPI = setupAPI;
