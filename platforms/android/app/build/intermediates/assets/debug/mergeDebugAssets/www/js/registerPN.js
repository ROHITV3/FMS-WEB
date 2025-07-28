/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var pushNotification;		//push notification variable. It is used to register the device.

function registerDevice()
{
//	alert("Begin registerDevice()");
//	console.log("\n>> registerDevice()");
	
        var push = PushNotification.init({
              android: {
                      senderID: "1046366413061",
                      forceShow : true ,
                      badge: 'true',
                      sound: 'true',
                      alert: 'true',
                      clearBadge : true
              },
              browser: {},
              ios: {},
              windows: {}
            });
            push.on('registration', function(data) {
                console.log('registration event: ' + data.registrationId);
                localStorage.setItem("deviceID", data.registrationId);
                localStorage.setItem("deviceType", 1);
                registered = true; 
                
            });
            push.on('error', function(e) {
                console.log("push error = " + e.message);
            });
            push.on('notification', function(data) {
                
               // console.log("TESTING  " + data.sound);
                
                console.log('notification event');
                console.log('notification data' + JSON.stringify(data));
                loadJob("all");
                navigator.notification.alert(
                  data.message,         // message
                  null, // callback
                  data.title,           // title
                  'Ok'                  // buttonName
                );
            });
            
//            window.localStorage["deviceOsId"] = 1; //store deviceOsId in localStorage
//            CHX commented below: 09 Nov 2018
            PushNotification.createChannel(
                function success()  {
                    console.log('success');
                },
                function fail(e) {
                    console.log('error message' + e.message);
                },
                {
                    id: 'geofencealert',
                    description: 'Notification Alert',
                    importance: 5,
                    vibration: true
                    
                }
            );
       
}

/*
 * Refer to registerDevice() -> in the pushNotification function, on registering
 * the device, it will look this function on success (android or Amazon-fireos).
 * Can rename if you want.
 * @param {type} result
 * @returns {undefined}
 */
function successHandler(result)
{
	console.log(">> successHandler(result): " + result);

        localStorage.setItem("devicePNRegistration", true);

	deviceID = result;
	//window.localStorage["deviceID"] = deviceID;
//	localStorage.setItem("deviceID", deviceID);

        if(device.platform.toLowerCase() === "android")
	{
		deviceType = 1;
		//window.localStorage["deviceType"] = deviceType;
		localStorage.setItem("deviceType", deviceType);
	}

	postSuccess();
}

/*
 * Refer to registerDevice() -> in the pushNotification function, on registering
 * the device, it will look this function on success (iOS and other devices).
 * Can rename if you want.
 * @param {type} result
 * @returns {undefined}
 */

/*
 * Refer to registerDevice() -> in the pushNotification function, on registering
 * the device, it will look this function on failure. Can rename if you want.
 */
function errorHandler(error)
{
	console.log("\n>> onNotification(e) errorHandler(error)");
	postError();
}

/*
 * To call this function on successful retrieval of device ID. Make sure your 
 * javaScript file has a function named receiveSuccessfulDevicePNRegistration()
 */
function postSuccess()
{
	receiveSuccessfulDevicePNRegistration();
}

/*
 * To call this function on unsuccessful retrieval of device ID. Make sure your
 * javaScript file has a function named receiveErrorDevicePNRegistration()
 */
function postError()
{
	receiveErrorDevicePNRegistration();
}