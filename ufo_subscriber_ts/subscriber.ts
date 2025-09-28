import { createServer } from "http";
import { WebSocketServer } from "ws";
import Redis from "ioredis";

// const redisClient = new Redis({
//   host: "localhost", // Replace with your Redis server address
//   port: 6379,
// });
const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
};
const redisSubscriber = new Redis(redisOptions);

const server = createServer();

const wss = new WebSocketServer({ server });

function mapUFOPatternWithChannel(pattern: string) {
  switch (pattern) {
    case "Random":
      return "ufo_coordinates_random";
    case "Circle":
      return "ufo_coordinates_circle";
    case "Eight":
      return "ufo_coordinates_eight";
    case "Zigzag":
      return "ufo_coordinates_zigzag";
    default:
      break;
  }
}

wss.on("connection", async (ws: WebSocket) => {
  console.log("Client connected");

  try {
    const pubSubRandom = await redisSubscriber.subscribe(
      "ufo_coordinates_random"
    );

    redisSubscriber.on("message", (channel: string, message: string) => {
      console.log(`Received message from ${channel}: ${message}`);
      ws.send(message);
    });

    ws.onmessage = async (msg: MessageEvent) => {
      //start with unsubscribe, or the redis client would allow multiple subscriptions, which translates to funny ufo patterns in the UI
      await redisSubscriber.unsubscribe();

      const pubSubRandom = await redisSubscriber.subscribe(
        mapUFOPatternWithChannel(msg.data) as string,
        (err, count) => {
          if (err) {
            console.error("Failed to subscribe: %s", err.message);
          } else {
            console.log(
              `Subscribed successfully! This client is currently subscribed to ${count} channels.`
            );
          }
        }
      );
    };

    redisSubscriber.on("message", (channel: string, message: string) => {
      console.log(`Received message from ${channel}: ${message}`);
      ws.send(message);
    });
  } catch (err) {
    console.error("Failed to subscribe:", err);
  }
});

server.on("request", (req, res) => {
  res.writeHead(404);
  res.end();
});

server.listen(8080, () => {
  console.log("Server started on port 8080");
});
