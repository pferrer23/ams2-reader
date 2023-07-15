import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Ams2Session } from './entity/Ams2Session';
import { Ams2Drivers } from './entity/Ams2Drivers';
import { Ams2HistoryLaps } from './entity/Ams2HistoryLaps';
import { Ams2Incidents } from './entity/Ams2Incidents';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: process.env.DATABASE_TYPE as any,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  entities: [Ams2Session, Ams2Drivers, Ams2HistoryLaps, Ams2Incidents],
  migrations: [],
  subscribers: [],
});
