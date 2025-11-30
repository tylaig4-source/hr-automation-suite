// ==========================================
// HR AUTOMATION SUITE - Redis Client
// ==========================================
// Cache, sessões e filas de mensagens

import { createClient, RedisClientType } from "redis";

// Tipos
export type RedisClient = RedisClientType;

// Singleton do cliente Redis
let redisClient: RedisClient | null = null;
let isConnecting = false;

/**
 * Obtém ou cria conexão com Redis
 */
export async function getRedisClient(): Promise<RedisClient> {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (isConnecting) {
    // Aguarda conexão em andamento
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getRedisClient();
  }

  isConnecting = true;

  try {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    const password = process.env.REDIS_PASSWORD;

    redisClient = createClient({
      url,
      password,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error("[Redis] Máximo de tentativas de reconexão atingido");
            return new Error("Máximo de tentativas");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("[Redis] Erro:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("[Redis] Conectado");
    });

    redisClient.on("reconnecting", () => {
      console.log("[Redis] Reconectando...");
    });

    await redisClient.connect();
    return redisClient;
  } finally {
    isConnecting = false;
  }
}

/**
 * Desconecta do Redis (para cleanup)
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

// ==========================================
// CACHE HELPERS
// ==========================================

const DEFAULT_TTL = 60 * 60; // 1 hora em segundos

/**
 * Obtém valor do cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("[Cache] Erro ao ler:", error);
    return null;
  }
}

/**
 * Define valor no cache
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL
): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error("[Cache] Erro ao escrever:", error);
  }
}

/**
 * Remove valor do cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error("[Cache] Erro ao deletar:", error);
  }
}

/**
 * Remove valores por padrão (ex: "user:*")
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error("[Cache] Erro ao deletar padrão:", error);
  }
}

// ==========================================
// RATE LIMITING
// ==========================================

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Verifica rate limit por chave (ex: userId, IP)
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const client = await getRedisClient();
    const redisKey = `ratelimit:${key}`;
    
    const multi = client.multi();
    multi.incr(redisKey);
    multi.expire(redisKey, windowSeconds);
    
    const results = await multi.exec();
    const count = results?.[0] as number || 0;
    
    const ttl = await client.ttl(redisKey);
    
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetIn: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (error) {
    console.error("[RateLimit] Erro:", error);
    // Em caso de erro, permite a requisição
    return { allowed: true, remaining: limit, resetIn: windowSeconds };
  }
}

// ==========================================
// FILAS DE MENSAGENS (JOBS)
// ==========================================

export interface Job<T = unknown> {
  id: string;
  type: string;
  data: T;
  createdAt: Date;
  attempts: number;
}

/**
 * Adiciona job na fila
 */
export async function enqueueJob<T>(
  queueName: string,
  type: string,
  data: T
): Promise<string> {
  const client = await getRedisClient();
  const jobId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const job: Job<T> = {
    id: jobId,
    type,
    data,
    createdAt: new Date(),
    attempts: 0,
  };
  
  await client.lPush(`queue:${queueName}`, JSON.stringify(job));
  return jobId;
}

/**
 * Remove e retorna próximo job da fila
 */
export async function dequeueJob<T>(queueName: string): Promise<Job<T> | null> {
  try {
    const client = await getRedisClient();
    const data = await client.rPop(`queue:${queueName}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("[Queue] Erro ao dequeue:", error);
    return null;
  }
}

/**
 * Retorna tamanho da fila
 */
export async function getQueueSize(queueName: string): Promise<number> {
  try {
    const client = await getRedisClient();
    return await client.lLen(`queue:${queueName}`);
  } catch (error) {
    console.error("[Queue] Erro ao obter tamanho:", error);
    return 0;
  }
}

// ==========================================
// SESSÕES / LOCKS DISTRIBUÍDOS
// ==========================================

/**
 * Adquire lock distribuído
 */
export async function acquireLock(
  lockName: string,
  ttlSeconds: number = 30
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const result = await client.set(`lock:${lockName}`, "1", {
      NX: true,
      EX: ttlSeconds,
    });
    return result === "OK";
  } catch (error) {
    console.error("[Lock] Erro ao adquirir:", error);
    return false;
  }
}

/**
 * Libera lock distribuído
 */
export async function releaseLock(lockName: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(`lock:${lockName}`);
  } catch (error) {
    console.error("[Lock] Erro ao liberar:", error);
  }
}

// ==========================================
// CACHE KEYS HELPERS
// ==========================================

export const CacheKeys = {
  // Usuário
  user: (id: string) => `user:${id}`,
  userExecutions: (id: string) => `user:${id}:executions`,
  
  // Agentes
  agent: (slug: string) => `agent:${slug}`,
  agentsByCategory: (categoryId: string) => `agents:category:${categoryId}`,
  
  // Execuções
  execution: (id: string) => `execution:${id}`,
  
  // Rate limits
  rateLimit: {
    execution: (userId: string) => `exec:${userId}`,
    api: (ip: string) => `api:${ip}`,
  },
};

