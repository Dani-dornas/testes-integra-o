import dotenv from "dotenv";
import { Pool } from "pg";
import Redis from "ioredis";

// Carrega variáveis de ambiente do .env.test
dotenv.config({ path: ".env.test" });

beforeAll(async () => {
  // Conectar ao PostgreSQL
  global.pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await global.pool.query("SELECT 1");

  // Conectar ao Redis
  global.redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD 
  });
  await global.redis.ping();
  // Evita o console.error nos testes
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(async () => {
  // Limpa tabelas a cada teste
  await global.pool.query("TRUNCATE TABLE contacts RESTART IDENTITY CASCADE;");
  await global.pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
  await global.redis.flushall();
});

afterEach(async () => {
  // Limpa tabelas e Redis após cada teste
  await global.pool.query("TRUNCATE TABLE contacts RESTART IDENTITY CASCADE;");
  await global.pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
  await global.redis.flushall();
});

afterAll(async () => {
  await global.pool.end();
  await global.redis.quit();
  jest.restoreAllMocks();
});
