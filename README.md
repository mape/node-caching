# node-caching

Makes working with caching easier.

## Installation

Via [npm](http://github.com/isaacs/npm):

    $ npm install caching

## Pseudo code example
    var Caching = require('caching');
    var cache = new Caching('redis'); /* use 'memory' or 'redis' */

    var ttl = 60 * 1000; // 1minute;
    cache('twitter-users', ttl, function(passalong) {
    	getMostActiveTwitterUser(function(err, userName) {
    		fetchTwitterFollowers(userName, passalong); // passalong replaces function(err, userList) {}
    	})
    }, function(err, userList) {
    	console.log(userList);
    });

## Code example
    var Caching = require('caching');
    var cache = new Caching('redis'); /* use 'memory' or 'redis' */
    
    setInterval(function() {
    	cache('key', 10000 /*ttl in ms*/, function(passalong) {
    		// This will only run once, all following requests will use cached data.
    		setTimeout(function() {
    			passalong(null, 'Cached result');
    		}, 1000);
    	}, function(err, results) {
    		// This callback will be reused each call
    		console.log(results);
    	});
    }, 100);


## Built in stores
* Memory
* Redis

## Api

    cache(key, ttl, runIfNothingInCache, useReturnedCachedResults);

### arguments[0]
Key, `'myKey'`
### arguments[1]
Time To Live in ms, `60*30*1000`
### arguments[2]
Callback that will run if results aren't already in cache store.

    function(passalong) {
    	setTimeout(function() {
			passalong(null, 'mape', 'frontend developer', 'sweden');
    	}, 1000);
    }

### arguments[3]
Callback that is called every time the method runs.

    function(err, name, position, location) {
    	console.log(userList);
    }
