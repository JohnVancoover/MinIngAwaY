var NodeConf = require(__dirname + '/NodeConf.js')();

var Node = {
	childprocessHandle: null,
	
	cryptoHandle: null,
	
	fsHandle: null,
	
	httpHandle: null,
	
	httpsHandle: null,
	
	pathHandle: null,
	
	zlibHandle: null,
	
	init: function() {
		{
			Node.childprocessHandle = require('child_process');
		}
		
		{
			Node.cryptoHandle = require('crypto');
		}
		
		{
			Node.fsHandle = require('fs');
		}

		{
			Node.httpHandle = require('http');
		}

		{
			Node.httpsHandle = require('https');
		}

		{
			Node.pathHandle = require('path');
		}

		{
			Node.zlibHandle = require('zlib');
		}
	},
	
	dispel: function() {
		{
			Node.childprocessHandle = null;
		}
		
		{
			Node.cryptoHandle = null;
		}
		
		{
			Node.fsHandle = null;
		}
		
		{
			Node.httpHandle = null;
		}
		
		{
			Node.httpsHandle = null;
		}
		
		{
			Node.pathHandle = null;
		}
		
		{
			Node.zlibHandle = null;
		}
	},
	
	hashbase: function(strData) {
		var hashHande = Node.cryptoHandle.createHash('sha512');
		
		{
			hashHande.update(strData);
		}
		
		var strBase = hashHande.digest('base64');
		
		{
			strBase = strBase.replace(new RegExp('\\+', 'g'), '');
			strBase = strBase.replace(new RegExp('\\/', 'g'), '');
		}
		
		return strBase;
	},
	
	attrget: function(strStorage, strAttribute) {
		var objectData = {};
		
		{
			var strData = Node.fsHandle.readFileSync(__dirname + '/' + strStorage + '.attr').toString();
			
			if (strData === '') {
				strData = '{}';
			}
			
			objectData = JSON.parse(strData);
		}
		
		return objectData[strAttribute];
	},
	
	attrput: function(strStorage, strAttribute, objectValue) {
		var objectData = {};
		
		{
			var strData = Node.fsHandle.readFileSync(__dirname + '/' + strStorage + '.attr').toString();
			
			if (strData === '') {
				strData = '{}';
			}
			
			objectData = JSON.parse(strData);
		}
		
		{
			objectData[strAttribute] = objectValue;
		}
		
		{
			var strData = JSON.stringify(objectData);
			
			if (strData === '') {
				strData = '{}';
			}
			
			Node.fsHandle.writeFileSync(__dirname + '/' + strStorage + '.attr', strData);
		}
	}
};

var Aws = {
	awsHandle: null,
	
	storageHandle: null,
	
	messageHandle: null,
	
	init: function() {
		{
			Aws.awsHandle = require('aws-sdk');
			
			Aws.awsHandle.config.update({
				'accessKeyId': NodeConf.strAwsIdent,
				'secretAccessKey': NodeConf.strAwsKey,
				'region': 'us-east-1'
			});
		}
		
		{
			Aws.storageHandle = new Aws.awsHandle.S3();
		}
		
		{
			Aws.messageHandle = new Aws.awsHandle.SES();
		}
	},
	
	dispel: function() {
		{
			Aws.awsHandle = null;
		}
		
		{
			Aws.storageHandle = null;
		}
		
		{
			Aws.messageHandle = null;
		}
	}
};

var Express = {
	expressHandle: null,
	
	compressionHandle: null,
	
	cookieparserHandle: null,
	
	multerHandle: null,
	
	expresssessionHandle: null,
	
	cookiesessionHandle: null,
	
	connectpostgresHandle: null,
	
	serverHandle: null,
	
	httpHandle: null,
	
	init: function() {
		{
			Express.expressHandle = require('express');
		}
		
		{
			Express.compressionHandle = require('compression');
		}
		
		{
			Express.cookieparserHandle = require('cookie-parser');
		}
		
		{
			if (NodeConf.boolExpressUpload === true) {
				Express.multerHandle = require('multer');
			}
		}
		
		{
			if (NodeConf.strExpressSession === 'sessionCookie') {
				Express.expresssessionHandle = require('express-session');
				
				Express.cookiesessionHandle = require('cookie-session');
				
			} else if (NodeConf.strExpressSession === 'sessionPostgres') {
				Express.expresssessionHandle = require('express-session');
				
				Express.connectpostgresHandle = require('connect-pg-simple')(Express.expresssessionHandle);
				
			}
		}
		
		{
			Express.serverHandle = Express.expressHandle();
		}
		
		{
			Express.httpHandle = null;
		}
	},
	
	dispel: function() {
		{
			Express.expressHandle = null;
		}
		
		{
			Express.compressionHandle = null;
		}
		
		{
			Express.cookieparserHandle = null;
		}
		
		{
			Express.multerHandle = null;
		}
		
		{
			Express.expresssessionHandle = null;
		}
		
		{
			Express.cookiesessionHandle = null;
		}
		
		{
			Express.connectpostgresHandle = null;
		}
		
		{
			Express.serverHandle = null;
		}
		
		{
			Express.httpHandle = null;
		}
	},
	
	run: function() {
		{
			Express.serverHandle.enable('trust proxy');
			
			Express.serverHandle.use(Express.compressionHandle({
				'threshold': 0
			}));
			
			Express.serverHandle.use(Express.cookieparserHandle());
		}
		
		{
			if (NodeConf.boolExpressUpload === true) {
				Express.serverHandle.use(Express.multerHandle({
					'dest': __dirname + '/tmp',
					'limits': {
						'fieldNameSize': 64,
						'fileSize': 10 * 1024 * 1024,
						'files': 1
					}
				}));
			}
		}
		
		{
			if (NodeConf.strExpressSession === 'sessionCookie') {
				Express.serverHandle.use(Express.cookiesessionHandle({
					'secret': NodeConf.strExpressSecret,
					'resave': false,
					'saveUninitialized': true,
					'cookie': {
						'maxAge': 31 * 24 * 60 * 60 * 1000
					}
				}));
				
			} else if (NodeConf.strExpressSession === 'sessionPostgres') {
				Express.serverHandle.use(Express.expresssessionHandle({
					'secret': NodeConf.strExpressSecret,
					'resave': false,
					'saveUninitialized': true,
					'cookie': {
						'maxAge': 31 * 24 * 60 * 60 * 1000
					},
					'store': new Express.connectpostgresHandle({
						'pg': Postgres.postgresHandle,
						'conString': NodeConf.strPostgresServer,
						'tableName': 'Session'
					})
				}));
				
			}
		}
		
		{
			Express.httpHandle = Express.serverHandle.listen(NodeConf.intExpressPort);
		}
		
		{
			var functionInterval = function() {
				var FilesystemRead_strFiles = [];
				
				var functionFilesystemRead = function() {
					Node.fsHandle.readdir(__dirname + '/tmp', function(errorHandle, strFiles) {
						if (errorHandle !== null) {
							functionError();
							
							return;
						}
						
						{
							for (var intFor1 = 0; intFor1 < strFiles.length; intFor1 += 1) {
								FilesystemRead_strFiles.push(strFiles[intFor1]);
							}
						}
						
						functionFilesystemStatIteratorFirst();
					});
				};
				
				var FilesystemStatIterator_intIndex = 0;
				
				var functionFilesystemStatIteratorFirst = function() {
					if (FilesystemStatIterator_intIndex < FilesystemRead_strFiles.length) {
						functionFilesystemStat();
						
						return;
					}
					
					functionSuccess();
				};
				
				var functionFilesystemStatIteratorNext = function() {
					{
						FilesystemStatIterator_intIndex += 1;
					}
					
					functionFilesystemStatIteratorFirst();
				};
				
				var functionFilesystemStat = function() {
					Node.fsHandle.stat(__dirname + '/tmp/' + FilesystemRead_strFiles[FilesystemStatIterator_intIndex], function(errorHandle, statHandle) {
						if (errorHandle !== null) {
							functionError();
							
							return;
						}
						
						if (statHandle.ctime.getTime() < new Date().getTime() - (60 * 60 * 1000)) {
							functionFilesystemDelete();
							
							return;
						}
						
						functionFilesystemStatIteratorNext();
					});
				};
				
				var functionFilesystemDelete = function() {
					Node.fsHandle.unlink(__dirname + '/tmp/' + FilesystemRead_strFiles[FilesystemStatIterator_intIndex], function(errorHandle) {
						if (errorHandle !== null) {
							functionError();
							
							return;
						}
						
						functionFilesystemStatIteratorNext();
					});
				};
				
				var Errorsuccess_intTimestamp = new Date().getTime();
				
				var functionError = function() {
					var dateHandle = new Date();
					
					console.log('');
					console.log('------------------------------------------------------------');
					console.log('- Timestamp: ' + dateHandle.toISOString());
					console.log('- Origin: NodeRect - Express');
					console.log('- Duration: ' + (dateHandle.getTime() - Errorsuccess_intTimestamp));
					console.log('- Status: Error');
					console.log('------------------------------------------------------------');
				};
				
				var functionSuccess = function() {
					var dateHandle = new Date();
					
					console.log('');
					console.log('------------------------------------------------------------');
					console.log('- Timestamp: ' + dateHandle.toISOString());
					console.log('- Origin: NodeRect - Express');
					console.log('- Duration: ' + (dateHandle.getTime() - Errorsuccess_intTimestamp));
					console.log('- Status: Success');
					console.log('------------------------------------------------------------');
				};
				
				functionFilesystemRead();
			};
			
			setInterval(functionInterval, 5 * 60 * 1000);
		}
	}
};

var Geoip = {
	geoipHandle: null,
	
	init: function() {
		{
			Geoip.geoipHandle = require('geoip-lite');
		}
	},
	
	dispel: function() {
		{
			Geoip.geoipHandle = null;
		}
	}
};

var Hypertextmin = {
	hypertextminHandle: null,
	
	init: function() {
		{
			Hypertextmin.hypertextminHandle = require('html-minifier');
		}
	},
	
	dispel: function() {
		{
			Hypertextmin.hypertextminHandle = null;
		}
	}
};

var Mime = {
	mimeHandle: null,
	
	init: function() {
		{
			Mime.mimeHandle = require('mime');
		}
	},
	
	dispel: function() {
		{
			Mime.mimeHandle = null;
		}
	}
};

var Mustache = {
	mustacheHandle: null,
	
	init: function() {
		{
			Mustache.mustacheHandle = require('mustache');
		}
	},
	
	dispel: function() {
		{
			Mustache.mustacheHandle = null;
		}
	}
};

var Phantom = {
	// INFO: sudo apt-get install fontconfig
	
	phantomjsHandle: null,
	
	init: function() {
		{
			Phantom.phantomjsHandle = require('phantomjs');
		}
	},
	
	dispel: function() {
		{
			Phantom.phantomjsHandle = null;
		}
	}
};

var Postgres = {
	postgresHandle: null,
	
	clientHandle: null,
	
	init: function() {
		{
			Postgres.postgresHandle = require('pg');
			
			Postgres.postgresHandle.defaults.parseInt8 = true;
		}
		
		{
			Postgres.postgresHandle.connect(NodeConf.strPostgresServer, function(errorHandle, clientHandle, functionDone) {
				{
					Postgres.clientHandle = clientHandle;
				}
				
				{
					Postgres.clientHandle.functionQuery = Postgres.clientHandle.query;
					
					Postgres.clientHandle.query = function(configHandle, functionCallback) {
						Postgres.clientHandle.functionQuery(configHandle, function(errorHandle, resultHandle) {
							{
								if (errorHandle !== null) {
									if (configHandle.log === true) {
										console.log('ERROR');
										console.dir(configHandle);
										console.dir(errorHandle);
									}
								}
							}
							
							{
								functionCallback(errorHandle, resultHandle);
							}
						});
					}
				}
			});
		}
	},
	
	dispel: function() {
		{
			Postgres.postgresHandle = null;
		}
		
		{
			Postgres.clientHandle = null;
		}
	}
};

var Recaptcha = {
	init: function() {
		
	},
	
	dispel: function() {
		
	},
	
	verify: function(strResponse, strIp, functionError, functionSuccess) {
		var requestHttp = Node.httpsHandle.request({
			'host': 'www.google.com',
			'port': 443,
			'path': '/recaptcha/api/siteverify?secret=' + encodeURIComponent(NodeConf.strRecaptchaPrivate) + '&response=' + encodeURIComponent(strResponse) + '&remoteip=' + encodeURIComponent(strIp),
			'method': 'GET'
		}, function(responseHttp) {
			var strContent = '';
			
			responseHttp.setEncoding('UTF-8');
			
			responseHttp.on('data', function(strData) {
				strContent += strData;
			});
			
			responseHttp.on('end', function() {
				var objectContent = JSON.parse(strContent);
				
				if (objectContent.success === undefined) {
					functionError();
					
					return;
					
				} else if (objectContent.success === false) {
					functionError();
					
					return;
					
				}
				
				functionSuccess();
			});
		});
		
		requestHttp.on('error', function(errorHandle) {
			functionError();
		});
		
		requestHttp.setTimeout(3 * 1000, function() {
			requestHttp.abort();
		});
		
		requestHttp.end();
	}
};

var Socket = {
	socketHandle: null,
	
	serverHandle: null,
	
	httpHandle: null,
	
	init: function() {
		{
			Socket.socketHandle = require('socket.io');
		}
		
		{
			Socket.serverHandle = Socket.socketHandle();
		}
		
		{
			Socket.httpHandle = null;
		}
	},
	
	dispel: function() {
		{
			Socket.socketHandle = null;
		}
		
		{
			Socket.serverHandle = null;
		}
		
		{
			Socket.httpHandle = null;
		}
	},
	
	run: function() {
		{
			Socket.serverHandle.attach(Express.httpHandle);
			
			Socket.serverHandle.origins('*:*');
		}
	}
};

var Xml = {
	xmldocHandle: null,	
	
	saxHandle: null,
	
	init: function() {
		{
			Xml.xmldocHandle = require('xmldoc');
		}
		
		{
			Xml.saxHandle = require('sax');
		}
	},
	
	dispel: function() {
		{
			Xml.xmldocHandle = null;
		}
		
		{
			Xml.saxHandle = null;
		}
	}
};

module.exports = function() {
	{
		Node.init();
	}
	
	{
		if (NodeConf.boolAws === true) {
			Aws.init();
		}
		
		if (NodeConf.boolExpress === true) {
			Express.init();
		}
		
		if (NodeConf.boolGeoip === true) {
			Geoip.init();
		}
		
		if (NodeConf.boolHypertextmin === true) {
			Hypertextmin.init();
		}
		
		if (NodeConf.boolMime === true) {
			Mime.init();
		}
		
		if (NodeConf.boolMustache === true) {
			Mustache.init();
		}
		
		if (NodeConf.boolPhantom === true) {
			Phantom.init();
		}
		
		if (NodeConf.boolPostgres === true) {
			Postgres.init();
		}
		
		if (NodeConf.boolRecaptcha === true) {
			Recaptcha.init();
		}
		
		if (NodeConf.boolSocket === true) {
			Socket.init();
		}
		
		if (NodeConf.boolXml === true) {
			Xml.init();
		}
	}

	{
		if (NodeConf.boolExpress === true) {
			Express.run();
		}
		
		if (NodeConf.boolSocket === true) {
			Socket.run();
		}
	}
	
	return {
		'Node': Node,
		'Aws': Aws,
		'Express': Express,
		'Geoip': Geoip,
		'Hypertextmin': Hypertextmin,
		'Mime': Mime,
		'Mustache': Mustache,
		'Phantom': Phantom,
		'Postgres': Postgres,
		'Recaptcha': Recaptcha,
		'Socket': Socket,
		'Xml': Xml
	};
};