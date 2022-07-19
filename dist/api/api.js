"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// define the home page route
router.get('/', (req, res) => {
    res.send('API home page');
});
// define the about route
router.get('/about', (req, res) => {
    res.send('About ');
});
module.exports = router;
