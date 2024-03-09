import { Cache, CacheEntry, totalTtl } from "@epic-web/cachified";
import { LRUCache } from "lru-cache";

const lruInstance = new LRUCache<string, CacheEntry>({ max: 50 });

// TODO: change cache adapter to cloudflare-kv
// @link: https://github.com/AdiRishi/cachified-adapter-cloudflare-kv
export const cache: Cache = {
	set(key, value) {
		const ttl = totalTtl(value?.metadata);
		return lruInstance.set(key, value, {
			ttl: ttl === Infinity ? undefined : ttl,
			start: value?.metadata?.createdTime,
		});
	},
	get(key) {
		return lruInstance.get(key);
	},
	delete(key) {
		return lruInstance.delete(key);
	},
};
