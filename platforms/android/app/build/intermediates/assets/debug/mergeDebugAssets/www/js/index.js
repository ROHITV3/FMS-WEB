/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//I put some global variables here...
var deviceUUID;			//is obtainable in iOS, but is not used in this app...
var devicePlatform;		//device platform: ios, android etc...
//var pushNotification;	//push notification variable. It is declared publicly in the registerPN.js. It is used to register the device.
var deviceID;			//the device ID used to register with the server for PN.
var localStorage = window.localStorage;
var serverAddress = localStorage.getItem("serverAddress");
var interval;			//used locally in this class to auto-redirect the user to the V3Nity portal.
var retryRegisterPN;	//used locally in this class to re-register device for PN if it failed earlier.

/*
 * The local storage variables are:
 *		redirect
 *		devicePNRegistration
 *		portalPNRegistration
 *		deviceID
 *		deviceType
 *		serverAddress
 */


/*
 * 
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
		deviceReady();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {

        /*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        */

        console.log('\n>> Received Event: ' + id);
    }
};

function deviceReady()
{

	localStorage = window.localStorage;
	//webSettings.setDomStorageEnabled(true);
	deviceUUID = device.uuid;
	devicePlatform = device.platform;
	
	console.log("\n>> deviceReady() log! deviceUUID: " + deviceUUID + ", devicePlatform: " + devicePlatform);
        
	//registerDevice();
      registerFCMDevice()
        console.log("\n register device regardless");
	
//	//register the device. Should only occur on first run.
//	if(serverAddress === null || serverAddress === "")
//	{
//		console.log("\n>> deviceReady() serverAddress is null or empty string");
//		//must make sure that in the HTML page, the registerPN.js and pushNotificationHandler.js is included.
//
//	}
	//else
//	{
		//if the device already has the server address, redirect to the portal page.
		//make sure the V3Nity3Frame.html has javaScript to read the storage to load the intended portal.
//		console.log("\n>> deviceReady() serverAddress: >" + serverAddress + "<");
		//window.location.assign("V3Nity3Frame.html");

		if(localStorage.getItem("deviceID") != null || localStorage.getItem("deviceID") != false || localStorage.getItem("deviceID") != "" )
		{
		    console.log("\n>> deviceReady() already have deviceID");
		    receiveSuccessfulDevicePNRegistration();
		}
//		else
//		{
//			alert("Error Registering for Push Notification, Please ensure that your notification permission is enable.")
		    //registerDevice();
	//	}
//	}
}

function scan()
{
	stopCountDown();
	cordova.plugins.barcodeScanner.scan(
		function (result)
		{
			if (!result.cancelled)
			{
				if (result.format == "QR_CODE")
				{
					/*
					 navigator.notification.prompt("Please enter name of data",  function(input){
					 var name = input.input1;
					 var value = result.text;

					 var data = localStorage.getItem("LocalData");
					 console.log(data);
					 data = JSON.parse(data);
					 data[data.length] = [name, value];

					 localStorage.setItem("LocalData", JSON.stringify(data));

					 alert("Done");
					 });
					 */

					var value = result.text;
					var split = value.split(",");
					//alert('Data: ' + split[1]);

					//document.getElementById("ScannedData").innerHTML = '<a href="' + split[1] + '">Bring me to ' + split[1] + '</a>';

					//3/9/2017: set the portal to the one scanned in the QR code.

					console.log("\n>> QR Code results: " + result.text);
					//var fullAddress = split[1] + "/Common/login.jsp";
					var fullAddress = split[0] + "/Mobile/login.jsp";
					localStorage.setItem("serverAddress", fullAddress);
                    console.log('fullAddress --->',fullAddress)
					/*
					 * note to self: the sample QR code returns
					 * "v3,http://v3nity.com/V3Nity3,V3Nity"
					 */
					if(localStorage.getItem("serverAddress") === null || localStorage.getItem("serverAddress") === "")
					{
						/*
						//QR Code should link the user to the desired web portal.
						//for development, hard code the URL...

				
						*/
					   
					}

					//document.getElementById("ScannedData").innerHTML = '<a href="' + localStorage.getItem("serverAddress") + '">Bring me to ' + localStorage.getItem("serverAddress") + '</a>';

					//reminder: that the device id param is saved locally. over here, just move the view to V3Nity3Frame.html
					//document.getElementById("ScannedData").innerHTML = '<a href="' + "V3Nity3Frame.html" + '">Bring me to ' + localStorage.getItem("serverAddress") + '</a>';

					//by this point, the device PN registration and portal address should be ok
					V3NityFrame();

				}
				else
				{
					//restart the countdown.
					countDown();
				}
			}
			else
			{
				//restart the countdown.
				countDown();
			}
		},
		function (error)
		{
			//restart the countdown.
			countDown();
			alert("Scanning failed: " + error);
		}
   );

}

/*
 * To be called after the device has registered for PN.
 * @returns {undefined}
 */
function countDown()
{
    console.log("\n>> countdown()");
	//for testing, comment out this timer first...
    var timeLimit = 3;
	
	if(serverAddress === null || serverAddress === "")
	{
		timeLimit = 10;
	}
	//console.log('Interval function');
    interval = setInterval(function()
    {
        console.log('Interval function');
        //document.getElementById("countDown").innerHTML = 'Redirecting in ' + timeLimit;
		document.getElementById("countDown").innerHTML = "<button id=\"redirectCounter\">" + timeLimit + "</button>";
        timeLimit--;
        if(timeLimit <= -1)
        {
            console.log('timeLimit <= -1');
            clearInterval(interval);
            if(localStorage.getItem("serverAddress") === null || localStorage.getItem("serverAddress") === false || localStorage.getItem("serverAddress") === "")
            {
                console.log('X1');
                // Todo : Uncomment below line for production
             // localStorage.setItem("serverAddress", "https://www.v3nity.com/V3Nity3/Mobile/login.jsp"); // ?custom=lite attribute is added at V3NityFrame
              //  localStorage.setItem("serverAddress", "http://203.125.7.40/Fms3-web/Mobile/login.jsp");
           localStorage.setItem("serverAddress", "https://www.v3nity.com/V3Nity3UAT/Mobile/login.jsp"); // V3 UAT
          // localStorage.setItem("serverAddress", "http://192.168.254.40/Fms3-web/Mobile/login.jsp");
          //localStorage.setItem("serverAddress", "https://m.nsl.com.sg/V3NityMobile/Mobile/login.jsp");
         // localStorage.setItem("serverAddress", "http://203.125.7.40/Fms3-web/Mobile/login.jsp");  // Rohit UAT


            }
            V3NityFrame();
//            window.location.assign("V3Nity3Frame.html");
        }

    }, 1000);
}

function stopCountDown()
{
    console.log("\n>> stopCountdown()");
    clearInterval(interval);
}

function receiveSuccessfulDevicePNRegistration()
{
    console.log("\n>> receiveSuccessfulDevicePNRegistration");
    addQRCodeButton();
    countDown();
}

function receiveErrorDevicePNRegistration()
{
    navigator.notification.alert(
    "Error registering for Push Notification, please try again by closing and reopening the app.",         // message
      null, // callback
      "Push Notification Error",           // title
      'Ok'                  // buttonName
    );
    addQRCodeButton();
    countDown();
}

function addQRCodeButton()
{
    $("#QRButton").append('<button class="QRCodeScannerButton" id="ScanQRCode" > Switch server</button>');
    document.getElementById("ScanQRCode").addEventListener("click", scan);
}


document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown(e)
{ 
   e.preventDefault(); 
   //alert('Back Button is Pressed!');
   //navigator.app.exitApp();       //this will exit the app
   
   window['plugins'].appMinimize.minimize();
}
//function V3NityFrame()
//{
//        $('#startLoad').remove();
//        $('.mainFrame').show();
//	console.log("\n>> V3NityFrame()");
//
//	var serverAddress = localStorage.getItem("serverAddress");
//	var deviceID = localStorage.getItem("deviceID");
//	var deviceType = localStorage.getItem("deviceType");
//	var fullURL = serverAddress + "?os=" + deviceType + "&id=" + deviceID + "&custom=";
//        console.log("http://www.v3nity.com/PushNotification/Broadcast?message=V3Test&appName=V3NityPN&deviceType=1&deviceID="+deviceID)
//    //if device is not registered, there should not be any device ID...
//    if(deviceID === null || deviceID === false || deviceID === "")
//    {
//        registerFCMDevice()
//    }
//    else
//    {
//        document.getElementById("V3Nity3Portal-iframe").innerHTML = '<iframe src="' + fullURL + '" id="targetIFrame"></iframe>';
//    }
//}

function V3NityFrame() {
    $('#startLoad').remove();
    $('.mainFrame').show();
    console.log("\n>> V3NityFrame()");

    var serverAddress = localStorage.getItem("serverAddress");
    var deviceID = localStorage.getItem("deviceID");
    var deviceType = localStorage.getItem("deviceType");

    console.log("Server address:" + serverAddress);
    console.log("deviceid  " + deviceID);

    serverAddress = serverAddress.replace("watch?v=", "v/");
    var fullURL = serverAddress + "?os=" + deviceType + "&id=" + deviceID + "&custom=";
    console.log("\n>> full URL::: " + fullURL);

    if (deviceID === null || deviceID === false || deviceID === "") {
        // Re-register device if necessary
        console.log("\n>> deviceID is null, false or blank");
        registerFCMDevice();
    } else {
        // Open the URL in the system browser
        window.open(fullURL, '_system');
    }
}


app.initialize();