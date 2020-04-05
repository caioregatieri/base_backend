'use strict'

const OneSignal = require('onesignal-node');

function send(message, data, to_ids, small_icon = null, large_icon = null){
    // console.log(configs, message, to_ids);
    return new Promise((resolve, reject) => {
        if (!message || !message.length) {
            reject({
                message: 'Notification require a message'
            });
            return;
        }

        if (!process.env.ONESIGNAL_USER_AUTH_KEY || !process.env.ONESIGNAL_REST_API_KEY || !process.env.ONESIGNAL_APP_ID) {
            reject({
                message: 'Onesignal not configurated'
            });
            return;
        }

        var myClient = new OneSignal.Client({    
            userAuthKey: process.env.ONESIGNAL_USER_AUTH_KEY,    
            app: { appAuthKey: process.env.ONESIGNAL_REST_API_KEY, appId: process.env.ONESIGNAL_APP_ID }    
        }); 

        if (to_ids)
            to_ids = Array.isArray(to_ids) ? to_ids : [to_ids];

        var notification = new OneSignal.Notification({    
            contents: {    
                en: message,      
            },  
            // include_player_ids: to_ids,
            small_icon: small_icon || null, // can not be an url
            large_icon: large_icon || null, //"http://url/ or resource_name" 
            android_accent_color: '66CCFF',
            android_background_layout: {
                "headings_color": "66CCFF",
                "contents_color": "FFFFFF"
            },
            // buttons: [
            //     {"id": "id1", "text": "Sim", "icon": "ic_menu_share"}, 
            //     {"id": "id2", "text": "Não", "icon": "ic_menu_send"}
            // ],
        }); 

        console.log(to_ids);

        //se não vier os ids manda para todos usuários ativos
        if (!to_ids || to_ids.length == 0) {
            // notification.postBody["included_segments"] = ["Active Users"];
            notification.postBody["included_segments"] = ["All"];
        } else {
            notification.postBody["include_player_ids"] = to_ids ;
        }

        if (data) {
            notification.postBody["data"] = data;  
        }

        myClient.sendNotification(notification, function (err, httpResponse, data) {    
            if (err) {    
                // console.log(err);
                reject(err);
            } else {    
                // console.log(data);
                resolve(data); 
            }    
        });
    });
}

module.exports = {
    send
};


    
  
    