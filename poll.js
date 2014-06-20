/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var http = require('http'),
    https = require('https'),
    url = require('url'),
    express = require('express'),
    nodemailer = require("nodemailer");

var app = express();
var pages = ['http://google.com/'];
var port = process.env.PORT || 5050;
var tolerance = parseInt(process.env.TOLERANCE);
var flagCount = 0;
var notified = false;
var notifiedTimeout = 0;

var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});

setInterval(function() {
    
    // if we have already send a notification and its less than the interval they want to be notified
    if(notified && (notifiedTimeout < (process.env.NOTIFICATION_INTERVAL * 60 * 1000))) {
        notifiedTimeout += process.env.POLLING_INTERVAL * 1000;
        return;
    }
    
    for(var i = 0; i < pages.length; i++) {
        poll(pages[i]);
    }
    
}, process.env.POLLING_INTERVAL * 1000);

function poll(page) {
    
    var _http = getProtocol();
    
    var options = {};
    var urlObj = url.parse(page);
    
    options.host = urlObj.host;
    options.path = urlObj.path;
    
    console.log(options)
    
    var req = _http.get(options, function(response) {
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));
        
        var code = parseInt(response.statusCode);
        
        // success
        if(code >= 200 && code <= 299) {
            // reset the flags
            flagCount = 0;
            return;
        } 
        // redirection
        else if(code >= 300 && code <= 399) {
            // reset the flags
            flagCount = 0;
            return;
        }
        // error
        else if(code >= 400 && code <= 599) {
            // flag this 
            flagCount++;
            return;
        }
        
        if(flagCount >= tolerance) {
            // reset the flags
            flagCount = 0;
            notify(response);
        }
    });
    
    req.on('error', function(err) {
        console.log('Error: ' + err);
    });
}

function getProtocol() {
    return (process.env.PROTOCOL == 'http') ? http : https;
}

function notify(response) {
    // notify the user by thier chosen method
    
    // stop the process until we have satisfied the notification interval
    notified = true;
    
    // reset the amount of time we wait to notify the user again
    notifiedTimeout = 0;
    
    // warn the user
    
    
}