'use strict';

//telegram
var token = '221361245:AAFv4i6j2FUz4SkBm2ICt2n4R9bpcJnG4Mk';
var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {polling: true});
var USER = 'jabaribell';

//pocket shit
var Pocket = require('node-pocket');
var consumerKey = '57149-733328295839ab57d143e3c4';
var p = new Pocket(consumerKey);
var options = {'url': 'https://telegram.me/skwirrelbot'}

var requestCode = '';
var accessToken = '';

function isUrlValid(url) {
    var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if(res == null)
        return false;
    else
        return true;
}

//so maybe
//1. send in any url and it checks to see if we have a request code and an access token
//a.  if no request token, then get one
//b.  and then get a access token based off of that... will there ever be an instance that we have an access token without a request token? i don't think so

//also we want to validate that its a url, let's do that... if it's a url -> cool carry on, if not then pop an error for any text that's entered

// var bot = new TelegramBot(token, {polling: {timeout: 1, interval: 100}});

// var opts = {
//   reply_markup: JSON.stringify(
//     {
//       force_reply: true
//     }
//   )};
//
// bot.sendMessage(USER, 'How old are you?', opts)
//   .then(function (sended) {
//     var chatId = sended.chat.id;
//     var messageId = sended.message_id;
//     bot.onReplyToMessage(chatId, messageId, function (message) {
//       console.log('User is %s years old', message.text);
//     });
//   });
//
// Any kind of message
bot.onText(/\/authorize/, function (msg) {
  var chatId = msg.chat.id;
  // photo can be: a file path, a stream or a Telegram file_id
  console.log('received message and sending photo');
  // var photo = 'owl.png';
  // bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
  p.getRequestToken(options, function(err, result) {
    if(err === null) {
      console.log("success! here is the request token: %s, redirect: %s", result.code, result.redirectUrl);
      // console.log("full re")
      //now we need access token
      requestCode = result.code;
      //if it's authorized, just keep going, if not show the url
      bot.sendMessage(chatId, result.redirectUrl);

      //looks like we need a url that sends u back ot the app - authorize in browser
      //spit out the url to the user
      // p.getAccessToken({'code': result.code}, function(err, data) {
      //   if(err === null) {
      //     console.log("success! here is the access token: %s", data.access_token);
      //   } else {
      //     console.log("error with access token!");
      //   }
      // });

    } else {
      console.log("error with request token!");
    }
  });
});

bot.onText(/\/test/, function(msg) {
  console.log("testing access with code: %s", requestCode);
  p.getAccessToken({'code': requestCode}, function(err, data) {
    if(err === null) {
      console.log("success! here is the access token: %s", data.access_token);
      accessToken = data.access_token;
    } else {
      console.log("error with access token!");
    }
  });
});

bot.onText(/\/start/, function(msg) {
  var chatId = msg.chat.id;
  bot.sendMessage(chatId, "Hey welcome to the bot!");
});

bot.onText(/\/add (.+)/, function (msg, match) {
  var chatId = msg.chat.id;
  var url = match[1];
  if(isUrlValid(url) == true) {
    bot.sendMessage(chatId, "Adding " + url);
    p = new Pocket(consumerKey, accessToken); //access token doesn't exist when we reset
    p.add({'url': url}, function(err, data) {
      if(err == null) {
        console.log('success in adding');;
      } else {
        console.log('failure in adding');;
      }
    });
  } else {
    bot.sendMessage(chatId, "Please enter a valid url.");
  }
});
//
// bot.onText(/\/echo (.+)/, function (msg, match) {
//   var fromId = msg.from.id;
//   var resp = match[1];
//   bot.sendMessage(fromId, resp);
// });


// https://getpocket.com/auth/authorize?request_token=YOUR_REQUEST_TOKEN&redirect_uri=YOUR_REDIRECT_URI


//this needs to happen when a user connects/ sends a message
