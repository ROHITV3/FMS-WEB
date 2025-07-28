/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function registerFCMDevice()
{
    
        window.pushNotification.registration((token) => {
          console.log(token);
          
          console.log('registration event: ' + token);
          localStorage.setItem("deviceID", token);
          localStorage.setItem("deviceType", 1);
          registered = true;           
          
        })    
    
        window.pushNotification.tapped((payload) => {
          console.log(payload);
          
//            navigator.notification.alert(
//                              "data.message",         // message
//                              null, // callback
//                              "data.title",           // title
//                              'Ok'                  // buttonName
//                            );          
          
        })
       
}



