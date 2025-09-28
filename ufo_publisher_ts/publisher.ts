import Redis from "ioredis";
import { random } from "lodash";

type Location = {
  latitude: number;
  longitude: number;
};

class UFOSimulator {
  private redisClient: Redis;
  private readonly channelNameRandom: string = "ufo_coordinates_random";
  private readonly channelNameCircle: string = "ufo_coordinates_circle";
  private readonly channelNameEight: string = "ufo_coordinates_eight";
  private readonly channelNameZigZag: string = "ufo_coordinates_zigzag";
  private currentLocation: Location;

  constructor(redisOptions: { host: string; port: number }) {
    this.redisClient = new Redis(redisOptions);
    this.currentLocation = { latitude: 37.272011, longitude: -115.815498 };
  }

  public startPublishingRandom() {
    setInterval(async () => {
      this.simulateUFOCoordinates();
      const coordinatesJson = JSON.stringify(this.currentLocation);
      try {
        await this.redisClient.publish(this.channelNameRandom, coordinatesJson);
      } catch (err) {
        console.error("Error publishing ufo coordinates:", err);
      }
    }, 1000);
  }

  public startPublishingCircle() {
    let i = 0;
    setInterval(async () => {
      i += 1;
      this.drawCircle(i);
      const coordinatesJson = JSON.stringify(this.currentLocation);
      try {
        await this.redisClient.publish(this.channelNameCircle, coordinatesJson);
      } catch (err) {
        console.error("Error publishing ufo coordinates:", err);
      }
    }, 1000);
  }

  public startPublishingEightShape() {
    let i = 0;
    setInterval(async () => {
      i += 1;
      this.drawEightShape(i);
      const coordinatesJson = JSON.stringify(this.currentLocation);
      try {
        await this.redisClient.publish(this.channelNameEight, coordinatesJson);
      } catch (err) {
        console.error("Error publishing ufo coordinates:", err);
      }
    }, 1000);
  }

  public startPublishingZigZag() {
    let i = 0;
    setInterval(async () => {
      i += 1;
      this.drawZigZag(i);
      const coordinatesJson = JSON.stringify(this.currentLocation);
      try {
        await this.redisClient.publish(this.channelNameZigZag, coordinatesJson);
      } catch (err) {
        console.error("Error publishing ufo coordinates:", err);
      }
    }, 1000);
  }

  private simulateUFOCoordinates() {
    this.currentLocation.latitude += 0.04 * random(-1, 1);
    this.currentLocation.longitude += 0.04 * random(-1, 1);
  }

  private drawCircle(
    i = 0,
    lat = 37.272011,
    lng = -115.815498,
    radius = 500,
    numPoints = 50
  ) {
    // Convert radius from meters to degrees latitude/longitude
    const radiusInDegrees = radius / 111300;
    const angle = (i / numPoints) * 2 * Math.PI;
    this.currentLocation.longitude = lng + radiusInDegrees * Math.cos(angle);
    this.currentLocation.latitude = lat + radiusInDegrees * Math.sin(angle);
  }

  private drawEightShape(
    i = 0,
    lat = 37.272011,
    lng = -115.815498,
    numPoints = 50
  ) {
    const radius = 0.01; // Radius of the eight-shaped figure in degrees latitude/longitude
    const angle = (i / numPoints) * 4 * Math.PI;
    this.currentLocation.longitude = lng + radius * Math.cos(angle);
    this.currentLocation.latitude = lat + radius * Math.sin(2 * angle);
  }

  private drawZigZag(
    i = 0,
    lat = 37.272011,
    lng = -115.815498,
    numPoints = 50
  ) {
    const amplitude = 0.01; // Amplitude of the zig-zag shape in degrees latitude/longitude
    this.currentLocation.longitude = lng + (i / numPoints) * 0.1; // Horizontal movement
    this.currentLocation.latitude =
      lat + amplitude * Math.sin((i / numPoints) * 2 * Math.PI); // Vertical movement
  }
}

const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: 6379,
};

const ufoSimulator = new UFOSimulator(redisOptions);
ufoSimulator.startPublishingCircle();
ufoSimulator.startPublishingRandom();
ufoSimulator.startPublishingEightShape();
ufoSimulator.startPublishingZigZag();
