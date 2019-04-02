/* 
    Send BG data to different types of non-PubNub Clients
    
    Supported:
    1. Slack
    2. Lifx
    
    To-do:
    1. IFTTT
    2. SMS
    3. Others?
*/


// require modules
const db = require("kvstore");
const pubnub = require('pubnub');
const vault = require('vault');
const xhr = require('xhr');

export default (request) => {
    if (request.message.sgv) {
        return vault.get('SLACK_URL').then((slack_url) => {
            if (slack_url) {
                let bg_data = request.message;
                var message = {"text": "Latest BG reading: *"+ bg_data.sgv + "* at " + bg_data.localeDateString + ". *" + bg_data.direction +"* is the direction. The difference from last reading is _" + Math.floor(bg_data.avg_last_1_diffs) + "_. The average difference of the last 3 readings is _" + Math.floor(bg_data.avg_last_3_diffs) + "_","username": "markdownbot","mrkdwn": true}

                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(message)
            
                };
                
                // create a HTTP POST request to the slack API
                return xhr.fetch(slack_url, options).then((r) => {
                    return request.ok();
                })
                .catch((err) => {
                    console.log(err);
                    return request.abort();
                }); 
            } else {
                return request.ok();   
            }
            
        }).catch((err) => {
            console.log(err);
            return request.abort();
        });
    } else {
    
        return request.ok();
    }
    
};

