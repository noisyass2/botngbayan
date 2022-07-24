import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs, rmSync } from 'fs';
import { init as SOInit,  handleMessage as handleSOMessage } from "./sohandler";
import { init as CCInit, handleMessage as handleCustomMessage } from "./customCommandHandler";
import * as dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
const app:Express = express();
import { setupAPI } from "../api/index";
import * as fetch from "node-fetch";

let chatClient:ChatClient;

async function main() {
    // let auth = JSON.parse(await fs.readFile('./auth.js', 'utf-8'));
	dotenv.config();
	setupAPI();

	let auth: IAuth = {
		clientID : process.env.CLIENT_ID ?? "",
		clientSecret : process.env.CLIENT_SECRET ?? ""
	}
	
	// console.log(auth);
	// console.log(process.env)

    let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
	const clientId = auth.clientID;
	const clientSecret = auth.clientSecret;
	const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf-8'));
	const authProvider = new RefreshingAuthProvider(
		{
			clientId,
			clientSecret,
			onRefresh: async newTokenData => await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf-8')
		},
		tokenData
	);
    
    SOInit();
    CCInit();
	// let channels = [settings.channel]
	// let channels = ['itsgillibean','speeeedtv', 'itschachatv']
	let channels = settings.map((p:any) => p.channel);
	console.log(channels)
	// chatClient = new ChatClient({ authProvider, channels: channels });
	chatClient = new ChatClient({ authProvider, channels: async () => { return await fetch.default("https://bot-ng-bayan-api.herokuapp.com/api/channels").then((p) => { return p.json() }).then( (p: Array<string>) => {return p})} });
	await chatClient.connect();
		
	chatClient.onMessage((channel, user, message) => {
        handleSOMessage(user, message, channel, chatClient);
        handleCustomMessage(user, message, channel, chatClient);
		// handshake
		if(message.startsWith("PING") && user !== 'bot_ng_bayan'){ 
			chatClient.say(channel, message.replace('PING','PONG') )
		}
	});

	chatClient.onSub((channel, user) => {
		chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
	});
	chatClient.onResub((channel, user, subInfo) => {
		chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
	});
	chatClient.onSubGift((channel, user, subInfo) => {
		chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
	});
	chatClient.onRegister(() => {
		// console.log(e);
		console.log("bot ng bayan has landed. 🇵🇭🇵🇭🇵🇭");
	});
	
	// chatClient.onConnect(() => {
	// 	// console.log(e);
	// 	console.log("bot connected");
	// })
}

export async function reconnect() {
	let channels = await fetch.default("https://bot-ng-bayan-api.herokuapp.com/api/channels").then((p) => { return p.json() }).then( (p) => {return p})
	
	console.log(channels);
	await chatClient.reconnect();
}

interface IAuth{
	clientID: string;
	clientSecret: string;
}

// async function setupSOClipper() {
// 	let appjs = await fs.readFile('./viewer/app.js', 'utf-8');
// 	appjs = appjs.replace('{CLIENT_ID}', process.env.CLIENT_ID ?? "")
// 	appjs = appjs.replace('{CLIENT_SECRET}', process.env.CLIENT_SECRET ?? "")
// 	await fs.writeFile('./viewer/app.js',appjs,'utf-8');
// 	app.get('/',(req: Request, res: Response) => {
// 		res.send("HELLO FROM BOT NG BAYAN!");
// 	})

// 	app.use(express.static('viewer'));


// 	app.listen(process.env.PORT, () => {
// 		console.log(`⚡️[server]: Server is running at https://localhost:${process.env.PORT}`);
		
// 	});

// }
//test fetch

// reconnect();
main();