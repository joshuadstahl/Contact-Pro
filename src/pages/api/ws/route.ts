import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingMessage } from 'http';
import internal from 'stream';
import { WebSocketServer } from 'ws';

import { createServer } from 'http';

export const config = {
  api: {
    externalResolver: true,
  },
}

let server = createServer();

const wss = new WebSocketServer({
  port: 80,
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
  noServer: true
});





server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request);
  });
})

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

// export default function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<object>
// ) {

//   wss.handleUpgrade(req, bob, req.buffer,() => {
    
//   })

//   console.log("hello");

//   res.status(200).json({ message: 'Hello from Next.js!' })
// }

server.listen(80);

export default (req:NextApiRequest, res:NextApiResponse) => server;