var MemoryStore = function() {
	var cache = {};
	return {
		'get': function(key,callback) {
			callback(null, cache[key] || null);
		}
		, 'set': function(key, ttl, result) {
			cache[key] = result;
			if (ttl) {
				setTimeout(function() {
					delete cache[key];
				}, ttl);
			}
		}
		, 'remove': function(key) {
			delete cache[key];
		}
	};
};
var RedisStore = function() {
	var redis = require('redis');
	var redisClient = redis.createClient();
	return {
		'get': function(key,callback) {
			redisClient.get(key, function(err, result) {
				callback(err, JSON.parse(result));
			});
		}
		, 'set': function(key, ttl, result) {
			if (ttl) {
				redisClient.SETEX(key, Math.ceil(ttl/1000), JSON.stringify(result));
			} else {
				redisClient.set(key, JSON.stringify(result));
			}
		}
		, 'remove': function(key) {
			redisClient.DEL(key);
		}
	};
};

module.exports = Caching = function Caching(store) {
	if (!store) {
		store = new MemoryStore;
	} else if (typeof store === 'string') {
		switch(store.toLowerCase().trim()) {
			case 'memory':
				store = new MemoryStore;
				break;
			case 'redis':
				store = new RedisStore;
				break;
			case 'memcache':
				store = new MemcacheStore;
				break;
			default:
				throw new Error('No built in store named "'+store+'".');
				return;
		}
	}

	var queues = {};

	var cacher = function(key, ttl, workCallback, callback) {
		store.get(key, function(err, storageData) {
			if (!err && storageData) {
				callback.apply(null, storageData);
			} else if (queues[key]) {
				queues[key].push(callback);
			} else {
				queues[key] = [callback];
				workCallback(function() {
					var args = Array.prototype.slice.call(arguments, 0);
					store.set(key, ttl, args);
					queues[key].forEach(function(queuedCallback) {
						queuedCallback.apply(null, args);
					});
					delete queues[key];
				});
			}
		});
	};
	cacher.remove = store.remove;

	return cacher;
};