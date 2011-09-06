function RedisStore(opts) {
	if (!(this instanceof RedisStore)) {
		return new RedisStore(opts);
	}
	
	opts = opts || {};
	this.client = require('redis').createClient(opts.port, opts.host, opts);
}

RedisStore.prototype.get = function(key, callback) {
	this.client.get(key, function(err, result) {
		callback(err, JSON.parse(result));
	});
};

RedisStore.prototype.set = function(key, ttl, result) {
	if (ttl) {
		this.client.setex(key, Math.ceil(ttl/1000), JSON.stringify(result));
	} else {
		this.client.set(key, JSON.stringify(result));
	}
};

RedisStore.prototype.remove = function(pattern) {
	if (~pattern.indexOf('*')) {
		var self = this;
		this.client.keys(pattern, function(err, keys) {
			if (keys.length) {
				self.client.del(keys);
			}
		});
	} else {
		this.client.del(pattern);
	}
};

module.exports = RedisStore;
