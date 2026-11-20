import "dotenv/config";
import { createApp } from "./app";
import { jwtLifetimeSeconds, jwtSecret } from "./lib/config";

const port = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be a valid TCP port");
}
jwtSecret();
jwtLifetimeSeconds();

createApp().listen(port, () => {
  console.info(`PayFlow API listening on port ${port}`);
});
