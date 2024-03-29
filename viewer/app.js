



// hey streamer! all of the config stuff is here
const CLIENT_ID = "{CLIENTID}"
const CLIENT_SECRET = "{CLIENTSECRET}"


const TOP_OR_RANDOM = "top"

const SHOW_CLIP_CREATORS = "false"

const QPARAMS = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

const VOLUME_PERCENT = QPARAMS.VOLUME ?? 100
console.log(VOLUME_PERCENT);

let IsClipPlaying = false;
// TOP_OR_RANDOM can be either "top" to prioritise top clips or "random" to get random clips out of your top 1000
// note that "random" clip mode requires a tiny bit of buffer time when the page is first loaded to collect a list of clips

// below is just all the code that makes this work. once you've configured the settings above, you're good to go!
// -ShaderWave

// Utility functions
async function authenticatedFetch(url, options) {
    options = options || {};
    options.headers = options.headers || {}

    options.headers["Client-ID"] = CLIENT_ID
    options.headers["Authorization"] = `Bearer ${(await getTwitchCredentials()).access_token}`

    return await fetch(url, options);
}

let OAUTH = null;
async function getTwitchCredentials() {
    if (OAUTH) return OAUTH;

    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`, {
        method: "POST"
    })
    OAUTH = await response.json();
    return OAUTH;
}

let BROADCASTER_ID = null;
async function getBroadcasterId() {
    if (BROADCASTER_ID) return BROADCASTER_ID;

    const response = await authenticatedFetch(`https://api.twitch.tv/helix/users?login=${BROADCASTER_NAME}`)
    BROADCASTER_ID = (await response.json()).data[0].id;
    return BROADCASTER_ID;
}

async function getBroadcasterIdByName(name) {

    const response = await authenticatedFetch(`https://api.twitch.tv/helix/users?login=${name}`)
    BROADCASTER_ID = (await response.json()).data[0].id;
    return BROADCASTER_ID;
}

let CLIPS_PAGINATION = null
async function getTopClips() {
    let response = await authenticatedFetch(`https://api.twitch.tv/helix/clips?first=100&broadcaster_id=${await getBroadcasterId()}${CLIPS_PAGINATION ? `&after=${CLIPS_PAGINATION}` : ""}`);
    let body = await response.json();

    CLIPS_PAGINATION = body.pagination.cursor;
    return body;
}

async function getRandomClip(name) {
    let clips = []

    const max = 1
    let pagination = null;
    for (let i = 0; i < max; i++) { // top 1000 clips
        let response = await authenticatedFetch(`https://api.twitch.tv/helix/clips?first=100&broadcaster_id=${await getBroadcasterIdByName(name)}${pagination ? `&after=${pagination}` : ""}`);
        let body = await response.json()

        pagination = body.pagination.cursor;
        clips = clips.concat(body.data)

        const status = document.getElementById("status")
        status.innerText = "Loading Clips: " + Math.floor(((i + 1) / max) * 100) + "%"
    }
    let random = Math.floor(Math.random() * Object.keys(clips).length)
    let clip = clips[Object.keys(clips)[random]]
    return clip;
}

async function getRandomClips() {
    let clips = []

    const max = 10
    let pagination = null;
    for (let i = 0; i < max; i++) { // top 1000 clips
        let response = await authenticatedFetch(`https://api.twitch.tv/helix/clips?first=100&broadcaster_id=${await getBroadcasterId()}${pagination ? `&after=${pagination}` : ""}`);
        let body = await response.json()

        pagination = body.pagination.cursor;
        clips = clips.concat(body.data)

        const status = document.getElementById("status")
        status.innerText = "Loading Clips: " + Math.floor(((i + 1) / max) * 100) + "%"
    }

    return clips;
}

function getClipStreamURL(clip) {
    let thumbPart = clip.thumbnail_url.split("-preview-");
    return thumbPart[0] + ".mp4";
}

let CLIPS_TO_PLAY = []
let CLIP_PLAYING = null

function setupPlayer() {
    const player = document.getElementById("player")

    player.load()
    player.loop = false;
    player.controls = false;
    player.volume = VOLUME_PERCENT / 100

    player.addEventListener("ended", () => {
        playNextClip()

    })
}

function playNextClip(){
    if (CLIPS_TO_PLAY.length == 0) {
        player.className = "hidden"
        IsClipPlaying = false;
    } else {
        playClips();
    }
}

async function playOneClip(name) {
    const player = document.getElementById("player")
    const overlayText = document.getElementById("overlay")

    if (CLIPS_TO_PLAY.length == 0) {
        const status = document.getElementById("status")

        
        //CLIPS_TO_PLAY = TOP_OR_RANDOM == "top" ? (await getTopClips()).data : await getRandomClips()
        let clip = await getRandomClip(name)
        if(clip !== undefined){
            status.className = "statusText"
            status.className = "statusText hide"
            //player.pause()
            player.className = "player"
            player.src = getClipStreamURL(clip)

            player.play()
            
        }else{
            playNextClip()
        }
    }

}

async function playClips() {
    const player = document.getElementById("player")
    const overlayText = document.getElementById("overlay")

    if (CLIPS_TO_PLAY.length > 0) {
        IsClipPlaying = true;
        const status = document.getElementById("status")

        status.className = "statusText"
        //CLIPS_TO_PLAY = TOP_OR_RANDOM == "top" ? (await getTopClips()).data : await getRandomClips()
        let clip = CLIPS_TO_PLAY.shift();
        console.log(clip)
        if(clip !== undefined){
            
            status.className = "statusText hide"
            //player.pause()
            
            player.className = "player"
            console.log(player);
            player.src = getClipStreamURL(clip)

            player.play()
            
        }else{
            playNextClip()
        }
    }
}

async function playRandom() {
    const player = document.getElementById("player")
    const overlayText = document.getElementById("overlay")

    if (CLIP_PLAYING) {
        CLIPS_TO_PLAY.splice(CLIPS_TO_PLAY.indexOf(CLIP_PLAYING), 1)
    }

    if (CLIPS_TO_PLAY.length == 0) {
        const status = document.getElementById("status")

        status.className = "statusText"
        CLIPS_TO_PLAY = TOP_OR_RANDOM == "top" ? (await getTopClips()).data : await getRandomClips()
        status.className = "statusText hide"
    }

    let random = Math.floor(Math.random() * Object.keys(CLIPS_TO_PLAY).length)
    const clip = CLIPS_TO_PLAY[Object.keys(CLIPS_TO_PLAY)[random]]

    CLIP_PLAYING = clip

    player.pause()
    player.src = getClipStreamURL(clip)
    player.play()
    if (SHOW_CLIP_CREATORS.toLowerCase() == "true") {
        let date = new Date(clip.created_at)
        let day = ('0' + date.getDate()).slice(-2);
        let month = ('0' + (date.getMonth() + 1)).slice(-2);
        let year = date.getFullYear();
        overlayText.innerText = `Clipped on ${year}-${month}-${day} by ${clip.creator_name}`
    }
}


function run() {
    setupConnect()
    setupPlayer()
    // playRandom()
    //playOneClip("itsgillibean")
    //addOneClip("itsgillibean")
}

async function addOneClip(name) {
    let clip = await getRandomClip(name)
    CLIPS_TO_PLAY.push(clip);

    if (!IsClipPlaying) {
        playClips();
    }
}

function setupWS() {
    const url = 'ws://localhost:8080/'
    const connection = new WebSocket(url)
    const status = document.getElementById("status")
    status.innerText = "Connecting..."
    connection.onopen = () => {
        connection.send('hey')
        status.innerText = "Connected!"
        setTimeout(() => {status.className = "statusText hide"}, 500)
    }

    connection.onerror = (error) => {
        console.log(`WebSocket error: ${error}`);
        setTimeout(() => {
            setupWS();
            status.innerText = "Connection error..."
        }, 1000);
    }

    connection.onmessage = (e) => {
        console.log("message recieved" + e.data)
        console.log(e.data);
        //playOneClip(e.data)

        // add to queue
        addOneClip(e.data);
    }

}

function setupConnect() {
    let users = [];
    console.log(QPARAMS.CHANNEL);
    const client = new tmi.Client({
        connection: {
            secure: true,
            reconnect: true,
        },
        channels: [QPARAMS.CHANNEL],
    });
    
    client.connect();
    
    client.on('message', (channel, tags, message, self) => {
        console.log(tags)
        console.log(channel);
        console.log(message);

        if(!message.startsWith("!so ")) return;

        if(!(tags.username == 'bot_ng_bayan' || tags.mod == true || tags.username == channel.replace('#',''))) return;

        let soUsername = message.split(' ')[1];
        soUsername = soUsername.replace('@','');

        // if(!users.includes(soUsername)){
            console.log("message recieved" + soUsername)
            console.log(soUsername);
            //playOneClip(e.data)
    
            // add to queue
            addOneClip(soUsername);
            users.push(soUsername);
        // }
        
    });
    const status = document.getElementById("status");
    status.className = "statusText hide";
}
window.addEventListener("load", run);