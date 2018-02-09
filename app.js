//
// This is main file containing code implementing the Express server and functionality for the Express echo bot.
//
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1></body></html>";

// The rest of the code implements the routes for our Express server.
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Webhook validation
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
    
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

// Display the web page
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(messengerButton); 
  res.end();
});

// Message processing
app.post('/webhook', function (req, res) {
  // addPersistentMenu();
  // console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);   
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  
  
if(message.nlp.entities.special_request){
   
  if(message.nlp.entities.special_request[0].value === 'honey moon'){
    sendTextMessage(senderID, "We can offer special entertainment for marriage celebration. Please contact us for details.", "");
     }else if(message.nlp.entities.special_request[0].value === 'birthday'){
    sendTextMessage(senderID, "We can offer special entertainment for birthday celebration. Please contact us for details.", "");              
     }else if(message.nlp.entities.special_request[0].value === 'wheelchair'){
    sendTextMessage(senderID, "We don't have any complete barrier free cottages, but we will preferentially arrange cottages near parking lot or the cottage with lower steps for you.", "");                            
     }else{
    sendTextMessage(senderID, "Please contact us for more details for each special request.", "");
     }
   
   }else if(message.nlp.entities.season){
  if(message.nlp.entities.season[0].value === 'cherry blossom'){
    sendTextMessage(senderID, "It is always March to April.", ""); 
  }else if(message.nlp.entities.season[0].value === 'snow'){
    sendTextMessage(senderID, "It is always March to April.", "");            
  }else if(message.nlp.entities.season[0].value === 'autumn'){
    sendTextMessage(senderID, "It is always December to February.", ""); 
  }else {
    sendTextMessage(senderID, "Please feel free to ask us directly if there is any question about each season and the weather.", ""); 
  }
  
   }else if(message.nlp.entities.access){

    if(message.nlp.entities.access[0].value === 'shuttle bus'){
    sendTextMessage(senderID, "We offer free shuttle bus service for 10 or more guests to and from Kawaguchiko Station of Fuji Kyuko Line. Reservation and Inquiry by Telephone or Chat", "");
    }else if(message.nlp.entities.access[0].value === 'bus stop'){
    sendTextMessage(senderID, "Please take the Fuji Kyuko bus from Kawaguchiko Station.", "");         
    }else if(message.nlp.entities.access[0].value === 'parking lots'){
    sendTextMessage(senderID, "There are toll free car parking lots for a total of 60 cars at Country Cottage Ban.", "");
    }else if(message.nlp.entities.access[0].value === 'pick up'){
    sendTextMessage(senderID, "We provide shuttle service to Kawaguchiko Station, supermarket near the station, as well as FujiQ Highland. For other locations, please confirm with us.", "");
    }else {
    sendTextMessage(senderID, "Here is the access info.", "");  
    sendAccessInfo(senderID);
    }
    
     } else if(message.nlp.entities.internet){
     sendTextMessage(senderID, "Internet access in the rooms is included in the daily rate. Internet access is complimentary for guests staying in any cottage", "");
     
    } else if(message.nlp.entities.check_in_out){
     if(message.nlp.entities.check_in_out[0].value === 'check in'){
     sendTextMessage(senderID, "Check in time is from 15:00. Please contact us in advance when you need to check in later than 17:00", "");        
        } else if(message.nlp.entities.check_in_out[0].value === 'check out'){
     sendTextMessage(senderID, "Check out time is until 10:00", "");            
        } else if(message.nlp.entities.check_in_out[0].value === 'check in and check out'){
     sendTextMessage(senderID, "Check in time is from 15:00. Check out time is until 10:00", "");
        }

    } else if(message.nlp.entities.meal){
     sendTextMessage(senderID, "Thank you for asking about ", message.nlp.entities.meal[0].value);
    
    if(message.nlp.entities.meal[0].value === 'breakfast'){
     sendTextMessage(senderID, "Breakfast (Option) If you order by 20:00, freshly made breakfast will be picked up and delivered to your cottage by 8:00 the next morning!A Set: Makunouchi Box JPY 550 B Set: Onigiri (Rice Balls) JPY 450Breakfast at B’s CafeJPY 700 (Tax exlusive)Menu: Boiled egg, Toast, Yogult, Coffee etc.", "");       
    } else if(message.nlp.entities.meal[0].value === 'lunch'){
     sendTextMessage(senderID, "We don't have lunch service. Intead, uou can order food delivery from each cottage. And, there are good restaurants the stuff recommend. Please ask the front stuff for details.", "");
    } else if(message.nlp.entities.meal[0].value === 'dinner'){
     sendTextMessage(senderID, "Earthen Pot Set (for dinner)Make yourselves warm with Hot Pot! Earthen Pot Set (an earthen pot, a portable gas stove, a gas cylinder) is also available. How about having a hot pot party in winter to enjoy gifts from the mountains?*Food ingredients are not included in the set. Guests need to bring foods by themselves. The set includes: an earthen pot, a portable gas stove and a gas cylinder.Fee: JPY 1,500 (Tax exclusive) / per set", "");
    } else if(message.nlp.entities.meal[0].value === 'restaurant'){
     sendTextMessage(senderID, "There are Japanese and Wetern style restaurants nearby our cottage.", "");
    }else if(message.nlp.entities.meal[0].value === 'supermarket'){
     sendTextMessage(senderID, "Supermarket is 10 minutes away by car.", "");        
    }else if(message.nlp.entities.meal[0].value === 'convenience store'){
     sendTextMessage(senderID, "Convenience store is about 15 minutes on foot, about 3 to 4 minutes by car.", "");        
    }else {
     showFAQ(senderID);
    }

    } else if(message.nlp.entities.thanks){
     sendTextMessage(senderID, "You are welcome! I'm happy to support your stay!", "");     
    } else if(message.nlp.entities.yes){
     sendTextMessage(senderID, "Yes, we have or it is available in the cottage", "");
        if(message.nlp.entities.yes[0].value === 'pet'){
         sendTextMessage(senderID, "Please keep your pets in your own cage. 3,000 JPY (tax exclusive) / up to middle size dog, 5,000 JPY (tax exclusive) / bigger size dog.Please inform the property in advance.", "");  
       }
    } else if(message.nlp.entities.no){
     sendTextMessage(senderID, "No, we don't have or it is not available in the cottage", ""); 
    } else if(message.nlp.entities.request){
     sendTextMessage(senderID, "Hi, there! How can I help you?", "");
    } else if(message.nlp.entities.bbq){
       sendTextMessage(senderID, "Thank you for asking about BBQ.", "");     
       if(message.nlp.entities.bbq[0].value === 'cost'){
         sendTextMessage(senderID, "Price: JPY 3,500 / Set / Approx. 7~8 people (Tax exclusive) The set includes: (7~8 people) iron pans, grills, firelighters, tongs, lighters, scoops, 3kg charcoals, fans, cotton work gloves, hibashi(Japanese tongs)", "");
       } else if(message.nlp.entities.bbq[0].value === 'availableTime'){
         sendTextMessage(senderID, "From your check in time until  21:00", "");
       } else if(message.nlp.entities.bbq[0].value === 'explain'){
         sendTextMessage(senderID, "One set of BBQ tools for approx. 8 people includes iron pans, grills, firelighters, tongs, lighters, scoops, charcoals, fans, cotton work gloves Price: JPY 3,500 / Set / Approx. 8 people (Tax exclusive)", "");
       } else if(message.nlp.entities.bbq[0].value === 'reservation required'){
         sendTextMessage(senderID, "It is basically okay if you can sign up upon check-in, but guests booking more than 15 people building, please confirm with us beforehand just in case.", "");
       } else if(message.nlp.entities.bbq[0].value === 'book ingredients'){
         sendTextMessage(senderID, "We can offer BBQ ingridients as per your request. Please do make a reservation by latest time of 10am 1 day before your check in date.", "");
       }
       
    } else if(message.nlp.entities.destination || message.nlp.entities.origin){
//   console.log("Destination:", message.nlp.entities.destination[0].value, "Origin:",message.nlp.entities.origin[0].value);
    
//     const originText = "Origin:" + message.nlp.entities.origin[0].value + "  ";
//     const destinationText = "Destination:" + message.nlp.entities.destination[0].value;
//     sendTextMessage(senderID, originText, destinationText);
    showGoogleFlight(senderID);
    return;
    } else if(message.nlp.entities.sentiment){
    if(message.nlp.entities.sentiment[0].value === 'positive'){
      sendTextMessage(senderID, "I'm happy to hear that!", "");       
    } else{
      sendTextMessage(senderID, "I'm sorry to hear that", "");
    }
    } else if(message.nlp.entities.goodbye){
      sendTextMessage(senderID, "Good Bye!", "");
    } else if(message.nlp.entities.greetings){
      sendTextMessage(senderID, "Hello!", "");
    } else if(message.nlp.entities.activity){
      if(message.nlp.entities.activity[0].value === "bicycle"){
      sendTextMessage(senderID, "A total of 10 power assisted bicycles are available for rent. Ride and visit sightseeing spots and enjoy easygoing cycling!            Hours: 8:00~17:00 (we might change the working hours according to the seasons)Fare: JPY 1,000 / hour / bicycle + JPY 500 per additional hour", "");
         }else{
      sendTextMessage(senderID, "OK, I searched some useful resource based on your request: ", messageText);
      showActivityInfo(senderID);         
         }

    } else if(message.quick_reply){

      if(message.quick_reply.payload === "room"){
      sendTextMessage(senderID, "Thank you for selecting category. Here is the room info.", "");
      sendRoomOption(senderID);
      return;
       } else if(message.quick_reply.payload === "facility"){
      sendTextMessage(senderID, "Thank you for selecting category. Here is the facility info.", "");
      sendFacilityOption(senderID);
      return;
       } else if(message.quick_reply.payload === "photo"){
      sendTextMessage(senderID, "Thank you for selecting category. Here is the photo info.", "");
      sendPhoto(senderID);
      return;
       } else if(message.quick_reply.payload === "access"){
      sendTextMessage(senderID, "Thank you for selecting category. Here is the access info.", "");
      sendAccessInfo(senderID);
      return;
       } else if(message.quick_reply.payload === "spa"){
      sendTextMessage(senderID, "Thank you for selecting category. Here is the spa info.", "");
      sendSpaInfo(senderID);
      return;
       } else if(message.quick_reply.payload === "review"){
      sendTextMessage(senderID, "Thank you for selecting category. Here is the review info.", "");
      showReview(senderID);
      return;
       } else if(message.quick_reply.payload === "faq"){
      sendTextMessage(senderID, "Thank you for selecting category. Here is the FAQ", "");
      showFAQ(senderID);
      return;
       }

    } else if(messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    switch (messageText.toLowerCase()) {

      case 'start':
        sendFirstOption(senderID);
      break;
      
      case 'room':
        sendRoomOption(senderID);
      break;
        
      case 'facility':
        sendFacilityOption(senderID);
      break;
      
      case 'photo':
        sendPhoto(senderID);
      break;
        
      case 'access':
        sendAccessInfo(senderID);
      break;
          
      case 'spa':
        sendSpaInfo(senderID);
      break;
        
      case 'review':
        showReview(senderID);
      break;
        
      case 'faq':
        showFAQ(senderID);
      break;
        
      case 'contact':
        sendContactInfo(senderID);
      break;
        
      case 'address':
        sendTextMessage(senderID, "401-0304 Yamanashi Fujikawaguchiko Kawaguchi 2092 Japan", "");
      break;
                  
      default:
        sendSecondOption(senderID);

    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received by me! Thank you!", "");
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  if(payload === 'start'){
     sendFirstOption(senderID);
     return;
     } else if(payload === 'contact'){
     sendContactInfo(senderID);
     return;
     } else if(payload === 'address'){
     sendTextMessage(senderID, payload, ":401-0304 Yamanashi Fujikawaguchiko Kawaguchi 2092 Japan");
     return;
     } else {
     sendTextMessage(senderID, payload, "");
     return;
     }

}

//////////////////////////
// Sending helpers
//////////////////////////

function sendTextMessage(recipientId, messageText, optionalText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText + optionalText
    }
  };

  callSendAPI(messageData);
}

function sendContactInfo(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Contact info.",
          buttons:[{
            type: "web_url",
            url: "http://www.countrycottageban.com/en-gb",
            title: "Open Website"
          }, {
            type: "postback",
            title: "Address",
            payload: "address"
          }, {
            type: "phone_number",
            title: "Call Phone Number",
            payload: "+16505551234"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendFirstOption(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What information do you want to know?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Room",
          "payload":"room"
        },
        {
          "content_type":"text",
          "title":"Facility",
          "payload":"facility"
        },
        {
          "content_type":"text",
          "title":"Photo",
          "payload":"photo"
        },
        {
          "content_type":"text",
          "title":"Access",
          "payload":"access"
        },
        {
          "content_type":"text",
          "title":"Spa",
          "payload":"spa"
        },
        {
          "content_type":"text",
          "title":"Review",
          "payload":"review"
        },
        {
          "content_type":"text",
          "title":"FAQ",
          "payload":"faq"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendSecondOption(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "I am sorry that I don't understand your question. Our stuff will reply to you directly. Please refer to the below category until then.",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Room",
          "payload":"room"
        },
        {
          "content_type":"text",
          "title":"Facility",
          "payload":"facility"
        },
        {
          "content_type":"text",
          "title":"Photo",
          "payload":"photo"
        },
        {
          "content_type":"text",
          "title":"Access",
          "payload":"access"
        },
        {
          "content_type":"text",
          "title":"Spa",
          "payload":"spa"
        },
        {
          "content_type":"text",
          "title":"Review",
          "payload":"review"
        },
        {
          "content_type":"text",
          "title":"FAQ",
          "payload":"faq"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendRoomOption(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Standard cottage A",
            subtitle: "Budget friendly",               
            image_url: "https://t-ec.bstatic.com/images/hotel/max1024x768/351/35110468.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb/rooms/standard-cottage-a",
              title: "More info"
            }, {
              type: "web_url",
              url: "https://reservation.booking.expert/en-gb/search?hotel_id=780510&room_id=78051001",
              title: "Book now"
            }],
          }, {
            title: "Superior cottage A",
            subtitle: "Good for couple",               
            image_url: "https://t-ec.bstatic.com/images/hotel/max1024x768/243/24355185.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb/rooms/superior-cottage-a",
              title: "More info"
            }, {
              type: "web_url",
              url: "https://reservation.booking.expert/en-gb/search?hotel_id=780510&room_id=78051002",
              title: "Book now"
            }],
          }, {
            title: "Deluxe cottage with Mt. Fuji View",
            subtitle: "Nice view and wide space",               
            image_url: "https://t-ec.bstatic.com/images/hotel/max1024x768/280/28094063.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb/rooms/deluxe-cottage-with-mtfuji-view",
              title: "More info"
            }, {
              type: "web_url",
              url: "https://reservation.booking.expert/en-gb/search?hotel_id=780510&room_id=78051003",
              title: "Book now"
            }],
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendFacilityOption(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Front desk",
            subtitle: "Open at 15：00～23：00. Please check in and out at the front desk.",   
            image_url: "https://q-fa.bstatic.com/data/xphoto/500x375/338/33833743.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb/facilities",
              title: "More info"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb",
              title: "Book now"
            }],
          }, {
            title: "Amenity and Service",
            subtitle: "WiFi is available for free.",   
            image_url: "https://q-fa.bstatic.com/data/xphoto/500x375/338/33836943.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb/service",
              title: "More info"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb",
              title: "Book now"
            }],
          }, {
            title: "BBQ space for each cotttage",
            subtitle: "A set of BBQ tool is available with JPY3,500(tax exclusive).",   
            image_url: "https://r-fa.bstatic.com/data/xphoto/500x375/338/33836122.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb/facilities/bbq-house",
              title: "More info"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb",
              title: "Book now"
            }],
          }, {
            title: "Open air bath with Mt.Fuji view",
            subtitle: "Open at: 18:00 ~ 22:00 / 07:30am ~ 10:00am",
            image_url: "https://t-ec.bstatic.com/images/hotel/max1280x900/243/24355004.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb/view-spa",
              title: "More info"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb",
              title: "Book now"
            }],
          }, {
            title: "Cafe and Bar",
            subtitle: "Open at: 07:00～10:00 & 19:00～23:00 Please enjoy precious time.",
            image_url: "https://q-fa.bstatic.com/data/xphoto/500x375/338/33836456.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb/facilities/b1",
              title: "More info"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb",
              title: "Book now"
            }],
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}


function sendPhoto(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "cottage",  
            image_url: "https://q-fa.bstatic.com/data/xphoto/500x375/338/33833743.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-gb/photos#0",
              title: "More photo"
            }],
          }]
        }
      }
    }
    
  };  

  callSendAPI(messageData);
}

function sendAccessInfo(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Access info.",
            image_url: "https://q-fa.bstatic.com/data/xphoto/500x375/338/33837161.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/access",
              title: "Train/Bus"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/access/by-car",
              title: "Car"
            }, {
              type: "web_url",
              url: "https://www.google.com/maps/dir//Kawaguchiko+Country+Cottage+Ban,+Minamitsuru+District,+Yamanashi+Prefecture,+Japan/",
              title: "Map"
            }],
          }]
        }
      }
    }
    
  };  

  callSendAPI(messageData);
}

function sendSpaInfo(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Spa",
            image_url: "https://r-fa.bstatic.com/data/xphoto/500x375/338/33836888.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/view-spa",
              title: "More info."
            }],
          }]
        }
      }
    }
    
  };  

  callSendAPI(messageData);
}

function showReview(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Review sample",  
            image_url: "http://www.guestfolio.com/wp-content/uploads/2016/01/Engagement-TripAdvisor.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/reviews",
              title: "More review"
            }],
          }]
        }
      }
    }
    
  };  

  callSendAPI(messageData);
}

function showFAQ(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Frequently Asked Questions 1",
            image_url: "https://q-fa.bstatic.com/data/xphoto/500x375/338/33836977.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/faq",
              title: "Reservation"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/faq/check-in--out--access--shuttle-service",
              title: "Check in / out"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/faq/amenities--kitchen-stuffs",
              title: "Amenity"
            }],
          }, {
            title: "Frequently Asked Questions 2",
            image_url: "https://r-fa.bstatic.com/data/xphoto/500x375/338/33837034.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/faq/cuisine--shopping",
              title: "Food and Drink"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/faq/about-bbq",
              title: "BBQ rental"
            }, {
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/faq/others",
              title: "Other"
            }],
          }]
        }
      }
    }
    
  };  

  callSendAPI(messageData);
}

function showGoogleFlight(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Search Flight",  
            image_url: "https://photos-e1.flightcdn.com/photos/retriever/6e60f09c28ba2f5e9ed8143982f87bdf5b1a72dc",
            buttons: [{
              type: "web_url",
              url: "https://www.google.co.jp/flights",
              title: "Go to Google Flight"
            }],
          }]
        }
      }
    }
    
  };  

  callSendAPI(messageData);
}

function showActivityInfo(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Places to go information",
            image_url: "https://cache-graphicslib.viator.com/graphicslib/page-images/360x240/328131_Viator_Thinkstock_149087.jpg",
            buttons: [{
              type: "web_url",
              url: "http://www.countrycottageban.com/en-us/attractions",
              title: "Website"
            },{
              type: "web_url",
              url: "https://www.tripadvisor.com/Tourism-g1165976-Fujikawaguchiko_machi_Minamitsuru_gun_Yamanashi_Prefecture_Chubu-Vacations.html",
              title: "trip advisor"
            },{
              type: "web_url",
              url: "https://www.viator.com/Tokyo-attractions/Mt-Fuji/d334-a86",
              title: "Tour info."
            }],
          }]
        }
      }
    }
    
  };  

  callSendAPI(messageData);
}


function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

//Persistent Menu somehow doesn't work,,
function addPersistentMenu(){
 request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json:{
  "get_started":{
    "payload":"Thank you for your access! Nice to meet you. My name is Takeshi. I'm a chatbot to help your trip in this accommodation. How can I help you? "
   }
 }
}, function(error, response, body) {
    if (error) {
        console.log('Error sending messages: ', error)
    } else if (response.body.error) {
        console.log('Error: ', response.body.error)
    }
})
  request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json:{
"persistent_menu":[
    {
      "locale":"default",
      "call_to_actions":[
            {
              "title":"Info.",
              "type":"postback",
              "payload":"start"
            },
            {
              "type":"web_url",
              "title":"book",
              "url":"http://www.countrycottageban.com/en-us",
            },
            {
              "title":"Contact",
              "type":"postback",
              "payload":"contact"
            }
      ]
    }
  ]
}

}, function(error, response, body) {
    if (error) {
        console.log('Error sending messages: ', error)
    } else if (response.body.error) {
        console.log('Error: ', response.body.error)
    }
})

}


// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});