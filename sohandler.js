"use strict";
exports.__esModule = true;
exports.handleMessage = exports.init = void 0;
var fs = require("fs");
var WebSocket = require("ws");
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
    var delay = Number.parseInt(settings.delay);
    if (sochannel) {
        var users = sochannel.users; // user na na SO na.
        // check if new user in chat
        // #speeeedtv
        // @speeeedtv
        if (!users.includes(user) && !blist.includes(user) && user !== channel.replace("#", "")) {
            console.log(user + " is not yet in users, added " + user + " in the list");
            users.push(user);
            setTimeout(function () {
                chatClient.say(channel, "!so @" + user);
            }, delay);
        } // user already exist, do nothing
        if (message.startsWith("!soreset")) {
            sochannel.users = [];
        }
        else if (message.startsWith("!so @")) {
            var soMsg = settings.soMessageTemplate;
            soMsg = soMsg.replace("{target.name}", user);
            soMsg = soMsg.replace("{target.url}", "https://twitch.tv/" + user);
            console.log(soMsg);
            chatClient.action(channel, soMsg);
            broadcast(user);
        }
    }
    return "";
}
exports.handleMessage = handleMessage;
var wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', function (ws) {
    console.log("opened");
    ws.on('message', function (message) {
        console.log(message);
    });
});
function broadcast(msg) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        console.log("sent");
        client.send(msg);
    });
}
;
