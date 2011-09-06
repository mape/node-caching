module.exports = function Caching(store) {
	store = store || 'memory';
	
	if (typeof store == 'string') {
		try {
			store = require('./stores/'+store.toLowerCase().trim())(arguments[1]);
		} catch(e) {
			throw new Error('There is no bundled caching store named "'+store+'"');
		}
	}

	var queues = {};

	var cacher = function(key, ttl, work, done) {
		store.get(key, function(err, args) {
			if (!err && args) {
				done.apply(null, args);
			} else if (queues[key]) {
				queues[key].push(done);
			} else {
				queues[key] = [done];
				work(function(){
					var args = Array.prototype.slice.call(arguments, 0);
					store.set(key, ttl, args);		
					queues[key].forEach(function(done){
						done.apply(null, args);
					});
					delete queues[key];
				});
			}
		});
	};
	cacher.remove = store.remove.bind(store);
	cacher.store = store;

	return cacher;
};