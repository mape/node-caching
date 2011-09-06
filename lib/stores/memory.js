function MemoryStore() {
	if (!(this instanceof MemoryStore)) {
		return new MemoryStore;
	}

	this.cache = {};
}

MemoryStore.prototype.get = function(key, callback){
	var self = this;
	process.nextTick(function() {
		callback(null, self.cache[key] || null);
	});
};

MemoryStore.prototype.set = function(key, ttl, result){
	this.cache[key] = result;
	if (ttl) {
		var self = this;
		setTimeout(function(){
			delete self.cache[key];
		}, ttl);
	}
};

MemoryStore.prototype.remove = function(pattern){
	if (~pattern.indexOf('*')) {
		var self = this;
		pattern = new RegExp(pattern.replace(/\*/g, '.*'), 'g');
		Object.keys(this.cache).forEach(function(key) {
			if (pattern.test(key)) {
				delete self.cache[key];
			}
		});
	} else {
		delete this.cache[pattern];
	}
};

module.exports = MemoryStore;
