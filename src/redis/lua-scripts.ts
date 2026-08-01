export const LUA_SCRIPTS = {
  /**
   * Fixed Window Counter Algorithm
   * KEYS[1]: Rate limit key
   * ARGV[1]: Max limit
   * ARGV[2]: Window size in seconds
   */
  FIXED_WINDOW: `
        local key = KEYS[1]
        local limit = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])

        local current = redis.call('INCR', key)
        if current == 1 then
            redis.call('EXPIRE', key, window)
        end

        local ttl = redis.call('TTL', key)
        if ttl < 0 then
            ttl = window
        end

        local allowed = 1
        if current > limit then
            allowed = 0
        end

        return { current, ttl, allowed }
    `,

  /**
   * Sliding Window Log Algorithm using Sorted Sets (ZSET)
   * KEYS[1]: Rate limit key
   * ARGV[1]: Current timestamp in milliseconds
   * ARGV[2]: Window size in milliseconds
   * ARGV[3]: Max limit
   * ARGV[4]: Request member identifier (UUID/Timestamp)
   */
  SLIDING_WINDOW: `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window_ms = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])
        local member = ARGV[4]

        local window_start = now - window_ms

        -- Clear old logs outside the sliding window
        redis.call('ZREMRANGEBYSCORE', key, 0, window_start)

        -- Count requests in current window
        local count = redis.call('ZCARD', key)

        local allowed = 1
        if count >= limit then
            allowed = 0
        else
            redis.call('ZADD', key, now, member)
            count = count + 1
        end

        -- Set expiration for key
        local ttl_seconds = math.ceil(window_ms / 1000)
        redis.call('EXPIRE', key, ttl_seconds)

        return { count, ttl_seconds, allowed }
    `,

  /**
   * Token Bucket Algorithm
   * KEYS[1]: Rate limit key
   * ARGV[1]: Capacity (max tokens / burst)
   * ARGV[2]: Refill rate in tokens per millisecond
   * ARGV[3]: Current timestamp in milliseconds
   * ARGV[4]: Tokens requested (usually 1)
   * ARGV[5]: Key TTL in seconds
   */
  TOKEN_BUCKET: `
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local refill_rate = tonumber(ARGV[2])
        local now = tonumber(ARGV[1] == nil and 0 or ARGV[3])
        local requested = tonumber(ARGV[4])
        local ttl = tonumber(ARGV[5])

        local data = redis.call('HMGET', key, 'tokens', 'last_refill')
        local tokens = tonumber(data[1])
        local last_refill = tonumber(data[2])

        if tokens == nil then
            tokens = capacity
            last_refill = now
        else
            local elapsed = now - last_refill
            if elapsed > 0 then
                local generated = elapsed * refill_rate
                tokens = math.min(capacity, tokens + generated)
                last_refill = now
            end
        end

        local allowed = 0
        if tokens >= requested then
            tokens = tokens - requested
            allowed = 1
        end

        redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)
        redis.call('EXPIRE', key, ttl)

        return { math.floor(tokens), ttl, allowed }
    `,

  /**
   * Leaky Bucket Algorithm
   * KEYS[1]: Rate limit key
   * ARGV[1]: Capacity (bucket size)
   * ARGV[2]: Leak rate in requests per millisecond
   * ARGV[3]: Current timestamp in milliseconds
   * ARGV[4]: Requests added (usually 1)
   * ARGV[5]: Key TTL in seconds
   */
  LEAKY_BUCKET: `
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local leak_rate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        local requested = tonumber(ARGV[4])
        local ttl = tonumber(ARGV[5])

        local data = redis.call('HMGET', key, 'water_level', 'last_leak')
        local water_level = tonumber(data[1])
        local last_leak = tonumber(data[2])

        if water_level == nil then
            water_level = 0
            last_leak = now
        else
            local elapsed = now - last_leak
            if elapsed > 0 then
                local leaked = elapsed * leak_rate
                water_level = math.max(0, water_level - leaked)
                last_leak = now
            end
        end

        local allowed = 0
        if (water_level + requested) <= capacity then
            water_level = water_level + requested
            allowed = 1
        end

        redis.call('HMSET', key, 'water_level', water_level, 'last_leak', last_leak)
        redis.call('EXPIRE', key, ttl)

        local remaining_capacity = math.max(0, capacity - math.floor(water_level))
        return { remaining_capacity, ttl, allowed }
    `,
} as const;
