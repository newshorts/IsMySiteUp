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
var pages = ['http://54.189.214.115/'];
var port = process.env.PORT || 5050;
var tolerance = parseInt(process.env.TOLERANCE);
var flagCount = 0;
var notified = false;
var notifiedTimeout = 0;

app.disable('etag');

// DONE
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "GSPBetaGroup@gmail.com",
        pass: process.env.GMAIL_PHRASE
    }
});

// DONE
var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});


// DONE
setInterval(function() {
    
    // wait until polling interval is done
    if(notified && (notifiedTimeout < (process.env.NOTIFICATION_INTERVAL * 60 * 1000))) {
        notifiedTimeout += process.env.POLLING_INTERVAL * 1000;
        console.log('waiting - notification interval');
        return;
    }
    
    // poll the pages
    for(var i = 0; i < pages.length; i++) {
        poll(pages[i]);
    }
    
}, process.env.POLLING_INTERVAL * 1000);



function poll(page) {
    
    var _http = getProtocol();
    
    var options = {};
    var urlObj = url.parse(page);
    
    options.host = urlObj.host;
    options.path = urlObj.path + '?t=' + new Date().getTime();
    
    console.log(options)
    
    var req = _http.get(options, function(response) {
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));
        
        response.on('data', function() { /* do nothing */ });
        
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
    
    req.once('error', function(err) {
        console.log('Error: ' + err);
        console.log('code: ' + err.code);
        
        if(err.code == 'ECONNRESET') {
            flagCount++;
        }
        
        if(flagCount >= tolerance) {
            // reset the flags
            flagCount = 0;
            notify('Could not connect to server.');
        }
    });
    
}


// DONE
function getProtocol() {
    return (process.env.PROTOCOL == 'http') ? http : https;
}

// DONE
function notify(error) {
    // notify the user by thier chosen method
    var message = '';
    if(typeof error == 'String') {
        message = error;
    } else {
        for(var name in error) {
            message += " " + error[name] + ", " ;
        }
    }
    
    message += ' Date: ' + new Date();
    
    // stop the process until we have satisfied the notification interval
    notified = true;
    
    // reset the amount of time we wait to notify the user again
    notifiedTimeout = 0;
    
    var mailOptions = {
        from: "Server <server@server.com>", // sender address
        to: "mike_newell@gspsf.com, patrick_wong@gspsf.com", // list of receivers
        subject: "Galacontemplatingyou.com is down.", // Subject line
        text: "Galacontemplatingyou.com was determined to be down after failing to connect "+process.env.POLLING_INTERVAL+" times. Please log in the server and double check that web.js is running. Please also refer to the readme on the github at: https://github.com/GSPBetaGroup/Museum for more information. There is also a youtube video on restarting the server here: https://www.youtube.com/watch?v=iVsYMW5Ywt0. The server failed with the following messages: " + message, // plaintext body
        html: "<p>Galacontemplatingyou.com was determined to be down after failing to connect "+process.env.POLLING_INTERVAL+" times. Please log in the server and double check that web.js is running. <p>Please also refer to the readme on the github at: <a href=\"https://github.com/GSPBetaGroup/Museum\">https://github.com/GSPBetaGroup/Museum</a> for more information. There is also a youtube video on restarting the server here: <a href=\"https://github.com/GSPBetaGroup/Museum\">https://www.youtube.com/watch?v=iVsYMW5Ywt0</a>.</p> <p>The server failed with the following messages: " + message + "</p>" // html body
    }
    
    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
    });

}