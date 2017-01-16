'use strict';
/**
 * Module dependencies.
 */

	var init = require('./config/init')(),
		config = require('./config/config'),
		mongoose = require('mongoose'),
		chalk = require('chalk'),
		winston = require('winston'),
		mongoSetup = require('./mongo-setup');


	 global.cluster = {};

	  //Better logging
	winston.remove(winston.transports.Console);
	if (config.isDevelopment) {
		// only log to console in development environment
		winston.add(winston.transports.Console, {
			timestamp: true,
			level: config.logLevel
		});
	}

	if (config.graylog.host !== undefined) {

		console.log ("graylog host: " + config.graylog.host + ':' + config.graylog.port );

		winston.add(require('winston-graylog2'), {
			name: 'Graylog',
			graylog: {
				servers: [{host: config.graylog.host, port: config.graylog.port}],
				facility: config.graylog.facility
			},
			level: config.logLevel
			/*,
			staticMeta: {environment: config.environment, source: os.hostname()}*/
		});
	}else{

		console.log ("No graylog host:port provided " );
	}

	/**
	 * Main application entry file.
	 * Please note that the order of loading is important.
	 */
	winston.info ("mongoDb connect to: " + config.db);
	winston.info ("graphite url: " + config.graphiteUrl);
	winston.info ("redis host: " + config.redisHost + ':' + config.redisPort );

	if(config.nodeCluster === true){

	var	cluster = require('cluster');

		if(cluster.isMaster) {
			var numWorkers = (require('os').cpus().length - 1 === 0 || config.debugMode) ? 1 : require('os').cpus().length - 1; /* save one core for daemon, unless there is only one core */

			winston.info('Master cluster setting up ' + numWorkers + ' workers...');

			for(var i = 0; i < numWorkers; i++) {
				cluster.fork();
			}

			cluster.on('online', function(worker) {
				winston.info('worker:' + worker.id + ', process ' + worker.process.pid + ' is online');
			});

			cluster.on('exit', function(worker, code, signal) {
				winston.error('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
				winston.info('Starting a new worker');
				cluster.fork();
			});



		} else {

			global.cluster[cluster.worker.id] = {};

			var db = mongoSetup.connect();

			var app = require('./config/express')(db);

			app.disable('etag');

			app.all('/*', function(req, res) {res.send('worker:' + cluster.worker.id + ', process ' + process.pid + ' says hello!').end();})

			var server = app.listen(config.port, function() {
				winston.info('worker:' + cluster.worker.id + ', process ' + process.pid + ' is listening to all incoming requests');
			});

			var io = require('socket.io').listen(server, {'transports': ['websocket']});

			var redis_io = require('socket.io-redis');
			var redis = require("redis");

			global.io = io;

			io.adapter(redis_io({host: config.redisHost, port: config.redisPort }));

			io.on('connection', function(socket) {

				winston.info('Client connected');

				// once a client has connected, we expect to get a ping from them saying what room they want to join
				socket.on('room', function(room) {

					socket.join(room);
					winston.info('Client joined room: ' + room);

				});

				socket.on('exit-room', function(room) {

					socket.leave(room);
					winston.info('Client left room: ' + room);


				});

				socket.on('disconnect', function() {
					winston.info('Client disconnected!');
				});
			});

			/* the leader should spawn the running tests child process */



			electLeader(cluster.worker.id);

		}


		}else {


		var db = mongoSetup.connect();

		var app = require('./config/express')(db);

		app.disable('etag');

		app.all('/*', function (req, res) {
			res.send('worker:' + cluster.worker.id + ', process ' + process.pid + ' says hello!').end();
		})

		var server = app.listen(config.port, function () {
			winston.info('node is listening to all incoming requests');
		});

		var io = require('socket.io').listen(server, {'transports': ['websocket']});

		var redis_io = require('socket.io-redis');
		var redis = require("redis");

		global.io = io;

		io.adapter(redis_io({host: config.redisHost, port: config.redisPort}));

		io.on('connection', function (socket) {

			winston.info('Client connected');

			// once a client has connected, we expect to get a ping from them saying what room they want to join
			socket.on('room', function (room) {

				socket.join(room);
				winston.info('Client joined room: ' + room);

			});

			socket.on('exit-room', function (room) {

				socket.leave(room);
				winston.info('Client left room: ' + room);


			});

			socket.on('disconnect', function () {
				winston.info('Client disconnected!');
			});
		});

		global.cluster[process.env.HOSTNAME] = {};

		/* the cluster leader should spawn the running tests child process */

		electLeader(process.env.HOSTNAME);

	}


	// Expose app
	exports = module.exports = app;





	function electLeader(id){



		var synchronizeRunningTests = require('./app/controllers/synchronize-running-tests.js');
		var leaderElectionController = require('./app/controllers/leader-election.server.controller.js');


		function synchronizeLoop(){

			synchronizeRunningTests.synchronizeRunningTestRuns(id);
		}


		setInterval(function(){

			/* Do leader election every 15 seconds */
			leaderElectionController.electLeader(id, function(leader){

				if(leader) {

					if (!global.cluster[id].intervalId){


						global.cluster[id].intervalId = setInterval(synchronizeLoop, 60 * 1000);

					}


				}else{

					if(global.cluster[id].intervalId){

						global.cluster[id].intervalId.cancel();
						delete global.cluster[id].intervalId;
					}
				}

			})


		}, 60 * 1000);
	}
