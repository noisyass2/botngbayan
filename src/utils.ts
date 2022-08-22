import * as fetch from "node-fetch";
import * as dotenv from 'dotenv';
import { IAuth } from ".";
import { promises as fs } from 'fs';
import { RefreshingAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';

let logs: Array<string> = [];

export async function getSOChannel(channel: string) {
    let getChannelURL = process.env.APIURL + "/db/channels/" + channel.replace('#', '');
    let soChannel = await fetch.default(getChannelURL).then((p) => { return p.json() }).then((p: any) => { return p })

    if (soChannel) {
        return soChannel;
    }
}

export async function getSubs(channel: string) {
    dotenv.config();

    let auth: IAuth = {
        clientID: process.env.CLIENT_ID ?? "",
        clientSecret: process.env.CLIENT_SECRET ?? ""
    }

    // console.log(auth);
    // console.log(process.env)

    let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
    const clientId = auth.clientID;
    const clientSecret = auth.clientSecret;
    const tokenData = JSON.parse(await fs.readFile('./tokenstwo.json', 'utf-8'));
    const authProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async newTokenData => await fs.writeFile('./tokenstwo.json', JSON.stringify(newTokenData, null, 4), 'utf-8')
        },
        tokenData
    );


    const apiClient = new ApiClient({ authProvider });

    apiClient.users.getUserByName(channel)
        .then(p => {
            if (p) {
                let { broadcasterType,
                    creationDate,
                    description,
                    displayName,
                    id,
                    name,
                    offlinePlaceholderUrl,
                    profilePictureUrl,
                    type, } = p;

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
                })

                // get subs

                apiClient.subscriptions.getSubscriptionsPaginated(p.id)
                    .getAll()
                    .then(p => {
                        p.forEach(sub => {
                            let { broadcasterDisplayName,
                                broadcasterId,
                                broadcasterName,
                                gifterDisplayName,
                                gifterId,
                                gifterName,
                                isGift,
                                tier,
                                userDisplayName,
                                userId,
                                userName, } = sub

                            console.log(broadcasterDisplayName,
                                broadcasterId,
                                broadcasterName,
                                gifterDisplayName,
                                gifterId,
                                gifterName,
                                isGift,
                                tier,
                                userDisplayName,
                                userId,
                                userName)
                        });
                    })
            }
        });

    return;
}

export async function getUserFollowsChannel(userid: string, channel: string) {
    dotenv.config();

    let auth: IAuth = {
        clientID: process.env.CLIENT_ID ?? "",
        clientSecret: process.env.CLIENT_SECRET ?? ""
    }

    // console.log(auth);
    // console.log(process.env)

    let settings = JSON.parse(await fs.readFile('./settings.json', 'utf-8'));
    const clientId = auth.clientID;
    const clientSecret = auth.clientSecret;
    const tokenData = JSON.parse(await fs.readFile('./tokenstwo.json', 'utf-8'));
    const authProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async newTokenData => await fs.writeFile('./tokenstwo.json', JSON.stringify(newTokenData, null, 4), 'utf-8')
        },
        tokenData
    );


    const apiClient = new ApiClient({ authProvider });

    apiClient.users.userFollowsBroadcaster(userid, channel).then((p) => {
        console.log(p);
    })
}

export async function log(msg: string) {
    console.log(msg);
    let dt: string = + ("" + new Date().getMonth()).padStart(2, "0") + "/" + ("" + new Date().getDate()).padStart(2, "0") + " "
        + ("" + new Date().getHours()).padStart(2, "0") + ":" + ("" + new Date().getMinutes()).padStart(2, "0")
        + ":" + ("" + new Date().getSeconds()).padStart(2, "0");
    if (logs.length > 20) {
        logs.shift();
    }
    logs.push(dt + "|" + msg);
}

export async function getLogs() {
    return logs;
}

export async function saveSoChannelSettings(channel:string, channelSettings: any) {
    let updateSettingsURL = process.env.APIURL + "db/channels/saveGenSettings/" + channel;
    
    await fetch.default(updateSettingsURL,{
        method: 'post',
        body: JSON.stringify(channelSettings),
        headers: {'Content-Type': 'application/json'}
    }).then((p) => {
        return p.json();
    }).then((p) => {
        return p;
    })
    

}

export async function addCount(channel:string){

}