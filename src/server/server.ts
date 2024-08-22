import { WebSocketServer, WebSocket } from 'ws';
import * as mongodb from 'mongodb';

const wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
  clientTracking: true
});


//class to keep track of a client websocket pair.
class clientSocketPair {
  constructor(id:string, ws:WebSocket) {
    this.id = id;
    this.ws = ws;
  }
  public id: string;
  public ws: WebSocket;
}

//class to keep track of which users are subscribed to which users updates.
class userUpdateSub {

  constructor(clientID: string) {
    this.clientID = clientID;
  }

  public clientID: string;
  public subscribers = new Array<clientSocketPair>;
}

class wsLogin {

  
}



let clients: { [clientID:string]: WebSocket } = {};
let userSubs: { [clientID:string]: Array<string> } = {};

wss.on('connection', function connection(ws: WebSocket, request) {

  let userkey = request.url?.substring(1);
  console.log(userkey);
  let cid = "";

  ws.on('error', console.error);

  ws.on('message', function message(data) {

    try {
      let msg;
      
      try {
        msg = JSON.parse(data.toString());
      }
      catch (err) {
        console.log("Error: ", err);
        ws.close(1000, "Unknown error occurred");
        return;
      }
  
      //if the user is logged in
      if (cid != "") {
      
        let mType = msg.msgType;
        switch (mType) {
          case "userUpdate":
            let statusUpdate = msg.data.message;
            if (cid in userSubs) {
              userSubs[cid].forEach((user) => {
                if (user in clients) {
                  clients[user].send(statusUpdate);
                  console.log("sent update");
                }
              })
            }
            console.log("userUpdate Triggered");
            break;
          case "message":
            break;
          case "messageUpdate":
            break;
          case "userUpdateSubscribe":
            let subID = msg.data.userSubID;

            if (subID in userSubs) {
              if (userSubs[subID].indexOf(cid) == -1) {
                userSubs[subID].push(cid);
              }
            }
            else {
              userSubs[subID] = [cid];
            }

            console.log(userSubs);
            break;
          case "broadcast":
            let relayMsg = msg.data.message;
            //clients.
            Object.keys(clients).forEach((client) => {
              if (client != cid) {
                clients[client].send(relayMsg)
              }
              
            })
            console.log("Broadcasting the message: %s", relayMsg);
            break;
          case "clientCnt":
            ws.send(Object.keys(clients).length);
            break;
        }
  
      }
      else {
        cid = msg.auth.id;      
        clients[cid] = ws;
      }
    }
    catch (err) {
      ws.close(1000, "Unknown error occurred");
    }
    
    
    // console.log('received: %s', data);
  });

  ws.send('something');

  // console.log(wss.clients.size);
  // console.log(wss.clients);

  ws.on('close', () => {
    if (cid in clients) {
      delete clients[cid];
    }
    Object.keys(userSubs).forEach((userSub) => {
      if (userSubs[userSub].indexOf(cid) != -1) {
        userSubs[userSub].splice(userSubs[userSub].indexOf(cid), 1);
      }
    })
    console.log("Connection closed. %s logged off.", cid);
  })
});