// lib/rate-limit.ts
// In-memory per-IP fixed-window rate limiter. Zero dependencies.
// NOTE: state is per-instance. On multi-instance hosts (e.g. Cloud Run),
// the effective ceiling is limit * instance_count. Acceptable first layer
// for a low-traffic contact form. For a shared cross-instance limit, use
// @upstash/ratelimit + @upstash/redis.
interface Bucket {
	count: number;
	resetAt: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

const buckets = new Map<string, Bucket>();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number): void {
	if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
	lastCleanup = now;
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
}

export function rateLimit(
	key: string,
	now: number = Date.now(),
): RateLimitResult {
	cleanup(now);
	const bucket = buckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		const resetAt = now + WINDOW_MS;
		buckets.set(key, { count: 1, resetAt });
		return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt };
	}

	if (bucket.count >= MAX_REQUESTS) {
		return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
	}

	bucket.count += 1;
	return {
		allowed: true,
		remaining: MAX_REQUESTS - bucket.count,
		resetAt: bucket.resetAt,
	};
}

export function getClientIp(req: Request): string {
	const forwarded = req.headers.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}
	return "global";
}
