import { Client } from "pg";
import { env } from "../env";

export const postgres = new Client(env.DATABASE_URL);
