"use strict";
exports.__esModule = true;
exports.handleMessage = exports.init = void 0;
var fs = require("fs");
var db = [];
var blist = ["streamlabs", "streamelements", "blerp", "nightbot", "fossabot", "soundalerts", "moobot"];
var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
function init() {
    var channels = [settings.channel];
    channels.forEach(function (channel) {
        db.push({
            name: channel,
            users: []
        });
    });
}
exports.init = init;
function handleMessage(user, message, channel, chatClient) {
    //check commands
    console.log("handling user: " + user);
    var sochannel = db.find(function (p) { return p.name; });
    if (sochannel) {
        var users = sochannel.users; // user na na SO na.
        // check if new user in chat
        // #speeeedtv
        // @speeeedtv
        if (!users.includes(user) && !blist.includes(user) && user !== channel.replace("#", "")) {
            console.log(user + " is not yet in users, added " + user + " in the list");
            var soMsg_1 = settings.soMessageTemplate;
            var delay = Number.parseInt(settings.delay);
            soMsg_1 = soMsg_1.replace("{target.name}", user);
            soMsg_1 = soMsg_1.replace("{target.url}", "https://twitch.tv/" + user);
            users.push(user);
            console.log(soMsg_1);
            setTimeout(function () {
                chatClient.say(channel, "!so @" + user);
                chatClient.action(channel, soMsg_1);
            }, delay);
        } // user already exist, do nothing
        if (message.startsWith("!soreset")) {
            sochannel.users = [];
        }
    }
    return "";
}
exports.handleMessage = handleMessage;
