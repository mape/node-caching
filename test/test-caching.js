var Caching = require('../')
	, memoryCache = new Caching('memory')
	, assert = require('assert');

exports['MemoryStore'] = function(beforeExit) {
	var wroteCache = false
		, lastResults
		, callbacksCalled = 0
		, key = 'hello memory '+Math.random()
		, ttl = 500; // 1s

	function store(next) {
		callbacksCalled++;
		wroteCache = true;
		setTimeout(function() {
			next(null, Date.now());
		}, 200);
	}
	
	// Feel the cache
	memoryCache(key, ttl, store, function(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.ok(wroteCache);
		lastResults = results;
		wroteCache = false;
	});

	// Try again
	memoryCache(key, ttl, store, function(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.equal(results, lastResults);
		assert.ok(!wroteCache);
		lastResults = results;
		wroteCache = false;
	});

	beforeExit(function() {
		assert.equal(callbacksCalled, 3);
	});
};

exports['MemoryStore expiration'] = function(beforeExit) {
	var wroteCache = false
		, lastResults
		, callbacksCalled = 0
		, key = 'hello memory '+Math.random()
		, ttl = 500; // .5s

	function store(next) {
		callbacksCalled++;
		wroteCache = true;
		setTimeout(function() {
			next(null, Date.now());
		}, 200);
	}

	// Feel the cache
	memoryCache(key, ttl, store, function(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.ok(wroteCache);
		lastResults = results;
		wroteCache = false;
	});

	// Wait until the cache has expired
	setTimeout(function() {
		memoryCache(key, ttl, store, function(err, results) {
			callbacksCalled++;
			assert.ifError(err);
			assert.equal(typeof results, 'number');
			assert.notEqual(results, lastResults);
			assert.ok(wroteCache);
			lastResults = results;
			wroteCache = false;
		});
	}, ttl*2);

	beforeExit(function() {
		assert.equal(callbacksCalled, 4);
	});
};


exports['MemoryStore removal'] = function(beforeExit) {
	var wroteCache = false
		, callbacksCalled = 0
		, key = 'hello rem memory '+Math.random()
		, ttl = 500; // .5s

	function store(next) {
		callbacksCalled++;
		wroteCache = true;
		setTimeout(function() {
			next(null, Date.now());
			wroteCache = false;
		}, 200);
	}

	// Feel the cache
	memoryCache(key, ttl, store, function setBeforeRemoval(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.ok(wroteCache);

		// Remove it manually
		memoryCache.remove(key);

		// Try again
		memoryCache(key, ttl, store, function getAfterRemoval(err, results) {
			callbacksCalled++;
			assert.ifError(err);
			assert.equal(typeof results, 'number');
			assert.ok(wroteCache);
		});
	});

	beforeExit(function() {
		assert.equal(callbacksCalled, 4);
	});
};


exports['MemoryStore removal pattern'] = function(beforeExit) {
	var wroteCache = false
		, callbacksCalled = 0
		, key = 'hello rem memory '+Math.random()
		, ttl = 500; // .5s

	function store(next) {
		callbacksCalled++;
		wroteCache = true;
		setTimeout(function() {
			next(null, Date.now());
			wroteCache = false;
		}, 200);
	}

	// Feel the cache
	memoryCache(key, ttl, store, function setBeforeRemoval(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.ok(wroteCache);

		// Remove it manually (using a pattern)
		memoryCache.remove('hello rem*');

		// Try again
		memoryCache(key, ttl, store, function getAfterRemoval(err, results) {
			callbacksCalled++;
			assert.ifError(err);
			assert.equal(typeof results, 'number');
			assert.ok(wroteCache);
		});
	});

	beforeExit(function() {
		assert.equal(callbacksCalled, 4);
	});
};


exports['RedisStore'] = function(beforeExit) {
	var redisCache = new Caching('redis')
		, wroteCache = false
		, callbacksCalled = 0
		, key = 'hello redis '+Math.random()
		, ttl = 500; // 1s

	function store(next) {
		callbacksCalled++;
		wroteCache = true;
		setTimeout(function() {
			next(null, Date.now());
		}, 200);
	}
	
	// Feel the cache
	redisCache(key, ttl, store, function(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.ok(wroteCache);
		wroteCache = false;
	});

	// Try again
	redisCache(key, ttl, store, function(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.ok(!wroteCache);
		redisCache.store.client.end();
	});

	beforeExit(function() {
		assert.equal(callbacksCalled, 3);
	});
};


exports['RedisStore expiration'] = function(beforeExit) {
	var redisCache = new Caching('redis')
		, wroteCache = false
		, callbacksCalled = 0
		, key = 'hello redis '+Math.random()
		, ttl = 1000; // 1s (the least possible on Redis since it only takes integer seconds)

	function store(next) {
		callbacksCalled++;
		wroteCache = true;
		setTimeout(function() {
			next(null, Date.now());
		}, 200);
	}

	// Feel the cache
	redisCache(key, ttl, store, function(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.ok(wroteCache);
		wroteCache = false;
	});

	// Wait until the cache has expired
	var t = Date.now();
	setTimeout(function() {
		redisCache(key, ttl, store, function(err, results) {
			callbacksCalled++;
			assert.ifError(err);
			assert.equal(typeof results, 'number');
			assert.ok(wroteCache);
			redisCache.store.client.end();
		});
	}, ttl*2);

	beforeExit(function() {
		assert.equal(callbacksCalled, 4);
	});
};


exports['RedisStore removal'] = function(beforeExit) {
	var redisCache = new Caching('redis')
		, wroteCache = false
		, callbacksCalled = 0
		, key = 'hello rem redis '+Math.random()
		, ttl = 500; // .5s

	function store(next) {
		callbacksCalled++;
		wroteCache = true;
		setTimeout(function() {
			next(null, Date.now());
		}, 200);
	}

	// Feel the cache
	redisCache(key, ttl, store, function setBeforeRemoval(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.ok(wroteCache);
		wroteCache = false;

		// Remove it manually
		redisCache.remove(key);

		// Try again (wait a little bit because the patters requires two redis commands)
		setTimeout(function() { 
			redisCache(key, ttl, store, function getAfterRemoval(err, results) {
				callbacksCalled++;
				assert.ifError(err);
				assert.equal(typeof results, 'number');
				assert.ok(wroteCache);
				redisCache.store.client.end();
			});
		}, 50);
	});

	beforeExit(function() {
		assert.equal(callbacksCalled, 4);
	});
};


exports['RedisStore removal pattern'] = function(beforeExit) {
	var redisCache = new Caching('redis')
		, wroteCache = false
		, callbacksCalled = 0
		, key = 'hello rem redis '+Math.random()
		, ttl = 500; // .5s

	function store(next) {
		callbacksCalled++;
		wroteCache = true;
		setTimeout(function() {
			next(null, Date.now());
		}, 200);
	}

	// Feel the cache
	redisCache(key, ttl, store, function setBeforeRemoval(err, results) {
		callbacksCalled++;
		assert.ifError(err);
		assert.equal(typeof results, 'number');
		assert.ok(wroteCache);
		wroteCache = false;

		// Remove it manually (using a pattern)
		redisCache.remove('hello rem*');

		// Try again (wait a little bit because the patters requires two redis commands)
		setTimeout(function() { 
			redisCache(key, ttl, store, function getAfterRemoval(err, results) {
				callbacksCalled++
				assert.ifError(err);
				assert.equal(typeof results, 'number')
				assert.ok(wroteCache)
				redisCache.store.client.end()
			});
		}, 50)
	});

	beforeExit(function() {
		assert.equal(callbacksCalled, 4);
	});
};
