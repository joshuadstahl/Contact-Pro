'use server'
import { signIn, signOut, auth } from "@/auth";
import { Db, Collection, MongoClient } from "mongodb";
import { randomInt, createHash } from "crypto";
import { MessageEvent, WebSocket } from "ws";
import { ServerUser } from "@/app/classes/serverUser";
import { Server } from "http";

export async function GoogleLogin() {
    'use server'
    await signIn("google", {redirectTo: "/app"})
}

export async function Logout() {
    'use server'
    await signOut({redirectTo: "/login"});
}

export async function getSession() {
    const session = await auth();
    return session;
}

export async function CreateDbConnection(): Promise<[Db, MongoClient]> {
    const client: MongoClient = new MongoClient(process.env.DB_CONN_STRING ?? "");
    await client.connect();
    const db: Db = client.db(process.env.DB_NAME ?? "");
    return [db, client];
}

//gets an existing websocket connection token or creates a new one, given
//a db connection, a userID, and a connecting ip address.
export async function GetOrCreateWSAuthToken(db: Db, userID: string, ConnectingIP: string|null) {

    interface wsLogin {
        hash: string;
        userID: string;
        exp: Date|string;
        rand: number;
    }

    const wsAuthCollection: Collection = db.collection("ws_auth");

    let currAuth = await wsAuthCollection.findOne<wsLogin>({userID: userID});

    let newAuth : wsLogin;
    if (currAuth !== null) {
        newAuth = currAuth;
    }
    else {
        //create a new wsLogin object to insert into the database
        newAuth = {
            hash: "",
            userID: userID.toString(),
            exp: new Date(new Date().getTime() + 60000 * 5),
            rand: randomInt(1, 60000)
        }
        let ip = ConnectingIP ?? "invalid";
        if (ip == "::ffff:127.0.0.1" || ip == "::1") {
            ip = "localhost";
        }
        newAuth.hash = createHash('sha256').update(newAuth.exp.toString() + ip + newAuth.userID + newAuth.rand).digest("hex").toString();
        await wsAuthCollection.insertOne(newAuth);
    }

    let out = {
        hash: newAuth.hash,
        addr: process.env.WS_CONNECT_ADDR
    };



    return newAuth.hash;
}

// export async function sendWSMessage(message: Object, expectedRespMessage: string = "") {  
    

//     return new Promise<boolean>(async (resolve, reject) => {
        
//         let [db, client] = await CreateDbConnection();
//         let authHash = await GetOrCreateWSAuthToken(db, "HTTPAPI-CLIENT", "localhost");
//         await client.close();

//         //console.log((process.env.WS_CONNECT_ADDR ?? "") + authHash);

//         const conn = new WebSocket((process.env.WS_CONNECT_ADDR ?? "") + authHash);

//         let initialized = false;

//         conn.addEventListener("message", async (event) => {

//             let data = await JSON.parse(String(event.data));

//             if (data.message !== undefined && data.message == "initialized") {
//                 initialized = true;
//                 conn.send(JSON.stringify(message));

//                 if (expectedRespMessage == "") {
//                     conn.close();
//                     resolve(true);
//                 }
//             }
//             else if (data.message !== undefined && data.message == expectedRespMessage && initialized) {
//                 conn.close();
//                 resolve(true);
//             }
//             else {
//                 conn.close();
//                 resolve(false);
//             }
//         })

//         conn.addEventListener("close", async (event) => {
//             reject(JSON.stringify({err: "err"}));
//         })

//         conn.addEventListener("error", async (event) => {
//             reject(JSON.stringify({err: event.error}));
//         })
        
//     })

// }

export async function sendWSMessage(message: object, expectedRespMessage: string = "") {  
    

    return new Promise<boolean>(async (resolve, reject) => {
        
        let [db, client] = await CreateDbConnection();
        let authHash = await GetOrCreateWSAuthToken(db, "HTTPAPI-CLIENT", "localhost");
        await client.close();

        console.log((process.env.WS_CONNECT_ADDR ?? "") + authHash);

        const conn = new WebSocket((process.env.WS_CONNECT_ADDR ?? "") + authHash);

        let initialized = false;

        conn.addEventListener("message", async (event: MessageEvent) => {

            let data = await JSON.parse(String(event.data));

            if (data.message !== undefined && data.message == "initialized") {
                initialized = true;
                let out = JSON.stringify(message)
                conn.send(out);

                if (expectedRespMessage == "") {
                    conn.close();
                    resolve(true);
                }
            }
            else if (data.message !== undefined && data.message == expectedRespMessage && initialized) {
                conn.close();
                resolve(true);
            }
            else {
                conn.close();
                resolve(false);
            }
        })

        conn.addEventListener("error", async (event) => {
            resolve(false);
            //reject(JSON.stringify({err: event.error}));
        })
        
    })

}

//either returns the id of a user, or returns undefined if there is no such username in the system.
export async function getUserIDfromUsername(username: string): Promise<string|undefined> {

    let [db, client] = await CreateDbConnection();

    const userCollection: Collection<ServerUser> = db.collection<ServerUser>("users");

    let doc = await userCollection.findOne({username: username})

    if (doc === null) {
        await client.close();
        return undefined;
    }
    else {
        await client.close();
        return doc._id.toString();
    }
    
}