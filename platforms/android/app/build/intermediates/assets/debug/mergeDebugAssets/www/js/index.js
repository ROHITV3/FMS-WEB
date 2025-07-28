window.localStorage["version"] = "4.1.4b"; //set app version number
// var network = "zonglipub"; //global variable that decides which databaseIP to connect to
var initialheight; //used to record initial screen height
//var databaseIP = 'http://v3nity.com/V3Nity4CMS/'; //global databaseIP variable
//var databaseIP = 'http://203.125.7.40/V3nity4'; //global .40 

//var databaseIP = 'http://203.125.7.40/V3nity4OmSree/';

var databaseIP = 'http://www.v3nity.com:80/V3Nity4/'; //global databaseIP variable

//http://203.125.7.40/V3nity4Feedback

var lang; //global variable to store languageJson
var spinnerDelay = 50;
var appDirectory;
var uploadDirectory;
var $photoPreviewPointer;
var $picPointer;
var pictureSource;
var destinationType;
var jobInterval;
var gpsInterval;
var pendingJobsRetryInterval;
var bluetoothInterval;
var refreshRate = 120000; //2minutes
var gpsRate = 60000; //1minutes
var list; //store json of locally stored joblist
var uploadInterval; //used to store uploadQueue's settimeout function
var uploadFirstCall = 10000; //time delay before uploadQueue is first called
var uploadDelay = 30000; //time delay between jobs, 30,000 = 30 secs
var $sigdiv;
var $drawdiv;
var uploadCount = 0;
var logDirectory;
var wifiAttribute = 0;
var disableGps = 0;
var lastsenttime = [];
var lastsentid = '';
var startJobBeaconId = '';
var sendInterval = 115000;
var timeZone = 8.0;
var zoneId = 'Asia/Singapore';
var utcOffset = 28800;
var direct = 0;
var devstatus = 0;
var UAT = 0;
var LIVE = 1;
var DEBUG_MODE = 0;
var db;
var otptimerId;
var captureStartEndLocation = true;
var isStartJob = false;
var START_JOB_EVENT = 1023;
var $videoPointer;
var $videoPreviewPointer;

var isJobHistoryCheck = false;
var mobileCompulsoryAdhocLocation = true;
var mobileCompulsoryEndCoordinate = true;

var autoRefresh = true;

var $geotagPointer;

var jobDuration = 1; 
var jobDurationTimer;
var jobEndedInTime = true;

var downloadTimer;
var synArr = [];
var galleryResize = 0;

function initializeCordova(success, failure) 
{
    var timer = window.setInterval(function () {
        if (window.device) {
            window.clearInterval(timer);
            success();
        };
    }, 100);
    window.setTimeout(function () { //failsafe
        if (!window.device) { //phonegap failed
            window.clearInterval(timer);
            failure();
        }
        ;
    }, 5000); //5 seconds
}
;
window.onload = function () {
	
	document.addEventListener('deviceready', function() {
      console.log('Device ready');

      window.open = cordova.InAppBrowser.open;

      initializeCordova(() => {
        console.log('Cordova Initializing Success');
        setup();
      }, () => {
        console.log('Cordova Initializing Failed');
      });
    });


    initializeCordova(function success() {
        console.log("Cordova Initializing Success");
        setup();
        
        
//        document.addEventListener("pause", function() {
//            cordova.plugins.backgroundMode.disable();
//        }, false);
//        
//        document.addEventListener("resume", function() {
//            cordova.plugins.backgroundMode.enable();
//        }, false);
        //setupLocation();
    }, function failure() {
        console.log("Cordova Initalizing Failed");
    });

};
function initializeCordova(success, failure) {
  console.log('cordova:', window.cordova);
  console.log('cordova.InAppBrowser:', window.cordova ? cordova.InAppBrowser : 'cordova undefined');

  if (window.cordova && cordova.InAppBrowser) {
    success();
  } else {
    failure();
  }
}

function setupLocation()
{
    spinInLocation();
    navigator.geolocation.getCurrentPosition(function success()
    {
        console.log("Location Initializing Success");
        spinOut();

    }, function error() {
        console.log("Location Initalizing Failed");
        spinOut();
        navigator.notification.alert("Please check that location service is enabled and that you are not under shelter."
                , function () {}, "Unable to Capture Location", '✔');
    },
            {timeout: 30000});
}


function receiveErrorDevicePNRegistration() { // these are for push notification

}
function receiveSuccessfulDevicePNRegistration() {

}

function onPushNotification() { //Refresh job when there is new push notification sent
    if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
}

function setup() {
    initialheight = $('body').height();
    document.addEventListener("backbutton", onBackKeyDown, false);

    var permissions = cordova.plugins.permissions;

    var permissionList = [
        permissions.CAMERA,
        permissions.ACCESS_COARSE_LOCATION,
        permissions.ACCESS_FINE_LOCATION,
        permissions.ACCESS_NETWORK_STATE,
        permissions.READ_EXTERNAL_STORAGE,
        permissions.WRITE_EXTERNAL_STORAGE
    ];


    db = new Database('v3nity.db');
    db.open();

    var columns = [];
    var checkColumns = [];

    columns = [];
    columns.push({name: "id", type: "int", primaryKey: false, nullable: false});
    columns.push({name: "weburl", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "send", type: "int", primaryKey: false, nullable: true});
    db.create('locations', columns, null);
    
    columns = [];
    columns.push({name: "id", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "job_id", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "duration", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "status", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "template_name", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "job_type_id", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "schedule_dt", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "location", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "latitude", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "longitude", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "description", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "preview", type: "text", primaryKey: false, nullable: false});
    columns.push({name: "details", type: "text", primaryKey: false, nullable: false});
    db.create('jobdetails', columns, null);

    permissions.checkPermission(permissionList, function (status)
    {
        if (status.hasPermission)
        {
                
//                db = new Database('v3nity.db');
//                db.open();
//                
//                var columns = [];
//                var checkColumns = [];
//                
//                columns = [];
//                columns.push({name: "id", type: "int", primaryKey: false, nullable: false});
//                columns.push({name: "weburl", type: "text", primaryKey: false, nullable: false});
//                columns.push({name: "send", type: "int", primaryKey: false, nullable: true});
//                db.create('locations', columns, null);
                
        } else
        {
            permissions.requestPermissions(
                permissionList,
                function(status) 
                {
                    if (!status.hasPermission)
                    {
                        alert('Please enable camera / location / storage permissions for application to work properly.')
                    }
                },
                function error() 
                {
                   //  alert('Please enable camera / storage / location permissions for application to work properly.');
                }
            );
        }
    });
    
    
//    sms.requestPermission(function() {
//        //CONFIGURATION
//        var options = {
//            replaceLineBreaks: false, // true to replace \n by a new line, false by default
//            android: {
//                intent: 'INTENT'  // send SMS with the native android SMS messaging
//                //intent: '' // send SMS without opening any other app
//            }
//        };
//
//        var success = function () { alert('Message sent successfully'); };
//        var error = function (e) { alert('Message Failed:' + e); };
//        sms.send('94376506', 'Hello There!', options, success, error);
//        
//    }, function(error) {
//        console.info('[WARN] Permission not accepted')
//        // Handle permission not accepted
//    });
    
    document.addEventListener("resume", onResume, false);
    
    window.onerror = function (message, file, line)
    {
        writeLogs("error from listener on " + file + " at " + line + ": " + message);
        //console.log("error from listener on " + file + " at " + line + ": " + message);
    }
    
    
//    alert(device.version);
//    
//    if(device.version >= 11){
//        
//        window.plugins.launcher. launch(
//           {packageName:'my.package',
//           dataType:'text/plain',
//               extras: [
//                   {"name":"android.intent.extra.TEXT", "value":"text", "dataType":"CharArray"}
//               ]}, successCallback, errorCallback);        
//        
//    }
    
    
    /*
     * for cleansolution
     */
//    window.localStorage["assetLabel"] = 'CS-49';
//    window.localStorage["databaseIP"] = 'http://v3nity.com:80/V3Nity4';
//    window.localStorage["customer"] = 'Clean Solutions WAM';
//    window.localStorage["unitId"] = 'CS-049';
    

    // Important: register device for PN services!
    // Uses function in registerPN.js.
    // DEPRECATED for ANDROID 8.0.0 and higher
    //registerDevice();
    registerFCMDevice();

    if (localStorage.getItem("databaseIP") != null) {
        databaseIP = window.localStorage["databaseIP"]; //get databaseIP from localStorage
        $('#customer').html('<h4>' + localStorage.getItem("customer") + '</h4>'); //get customer's name from localstorage
        $("#registerDeviceBtn").val(localStorage.getItem("assetLabel")); //get device name from localstorage
        $("#unitId").val(localStorage.getItem("unitId")); //get unitId from localstorage
        $("#registerDeviceText").show();
    } else {
        $("#registerShell").show();
    }

    if (window.localStorage["language"] != null) {
        lang = JSON.parse(window.localStorage["languageJson"]);
        setLanguage();
    } else {
        changeLanguage("en")
    }

    $("#registerDeviceText").bind('click', function () {
        $("#registerDeviceText").toggle();
        $("#registerShell").toggle();
    })
    

    $("#registerDeviceBtn").bind('click', function () {
        $("#registerDeviceBtn").blur();
        cordova.plugins.barcodeScanner.scan(
                function (result) {
                    console.log("Bcoderesult :- " + result.text);
                    if (result.text.length > 10) {
                        if (result.text.substring(0, 8) != "{ 'url':"){
                            result.text = atob(result.text);
                        }
                    }
                    if (result.text.substring(0, 8) == "{ 'url':" || result.text == "") {
                        if (result.text != "") {
                            var newQR = JSON.parse(result.text.replace(/'/g, '"')); //replace '' with ""  { 'url': 'http://192.168.254.35:8080/V3nity/', 'customer': 'Tampines West Community Club', 'label': 'TWCC 1', 'unitId': '12345' }
                            window.localStorage["databaseIP"] = newQR.url; // localStorage - after log out, won't store data
                            databaseIP = window.localStorage["databaseIP"]; //get databaseIP from localStorage
                            //
                            if (window.localStorage["databaseIP"] == 'http://www.v3nity.com:80/V3Nity4/')
                            {
                                window.localStorage["databaseIP"] = 'https://www.v3nity.com/V3Nity4/';
                                databaseIP = 'https://www.v3nity.com/V3Nity4/';
                            }
//                            console.log('****databaseIP: ' + databaseIP);
                            window.localStorage["customer"] = newQR.customer;
                            $('#customer').html('<h4>' + localStorage.getItem("customer") + '</h4>');
                            window.localStorage["assetLabel"] = newQR.label;
                            $("#registerDeviceBtn").val(localStorage.getItem("assetLabel"));
                            window.localStorage["unitId"] = newQR.unitId;
                            $("#unitId").val(localStorage.getItem("unitId")); //get unitId from localstorage
                            $("#registerDeviceText").toggle();
                            $("#registerShell").toggle();
                            changeLanguage("en");
                        }
                    } else {
                        navigator.notification.alert(lang.Mobile018, function () {
                        }, lang.Mobile017, '✔');
                    }
                },
                function (error) {
                    navigator.notification.alert(lang.Mobile018, function () {
                    }, lang.Mobile019, '✔');
                    console.log("barcodescan error: " + error);
                }
        );
    });
    
    //https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/getDirectory for create and exclusive logic
    var folder = "WAM";
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 1, function (fileSys) {
        fileSys.root.getDirectory(folder, {create: true, exclusive: false}, function (directory) {
            appDirectory = directory;
            console.log("App directory initialized.");
            appDirectory.getDirectory("Upload", {create: true, exclusive: false}, function (directory) {
                uploadDirectory = directory;
                console.log("Upload directory initialized.");
            }, fail);

            appDirectory.getDirectory("Log", {create: true, exclusive: true}, function (directory) { //check if there is a log folder, if yes goto error handler, else create
                afterGetDirectory(directory);
            }, function getFile(error) {
                console.log("Log directory Error: " + error.code);
                appDirectory.getDirectory("Log", {create: false}, function (directory) {
                    afterGetDirectory(directory);
                }, fail);
            });
        }, fail);
    }, fail);

    function fail(error) {
        console.log("App directory Error: " + error.code);
        if (error.code == 2) {
            alert("Permission for accessing Storage denied, kindly go to your setting and allow this permission. Do restart the App afterward. ");
            window.plugins.spinnerDialog.hide();
            window.plugins.spinnerDialog.show(null, "Storage, Location & Camera Permissions required for App to be fully functional. Kindly enable it at your Settings.", true);
        }
    }

    function afterGetDirectory(directory) {
        logDirectory = directory;
        clearCache();
        createFile(); // create logFile
        deleteFile(); // delete logFile > 7 days.
        deleteUploadJobFile();
        
        if (window.localStorage["databaseIP"] == 'http://202.40.233.199:80/V3Nity4/')
        {
            //alert ('IP Switch')
            window.localStorage["databaseIP"] = 'http://www.v3nity.com:80/V3Nity4/';
            databaseIP = 'http://www.v3nity.com:80/V3Nity4/';
        }
        
        if (window.localStorage["databaseIP"] == 'http://www.v3nity.com:80/V3Nity4/')
        {
            window.localStorage["databaseIP"] = 'https://www.v3nity.com/V3Nity4/';
            databaseIP = 'https://www.v3nity.com/V3Nity4/';
        }
        
        if (localStorage.getItem("loginUser") != null && localStorage.getItem("loginPassword") != null) {
            $("#loginUser").val(localStorage.getItem("loginUser")); //get loginUser from localstorage
            $("#loginPassword").val(localStorage.getItem("loginPassword")); //get loginPassword from localstorage
            $("#unitId").val(localStorage.getItem("unitId")); //get unitId from localstorage
            login();
        }
    }

    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;

    $sigdiv = $("#signatureview");
    $drawdiv = $("#drawingview");

    if ($(window).height() > 749) {
        console.log("greater than 746 ");
//        $drawdiv.jSignature({
//            'lineWidth': 0,
//            'width': 576,
//            'height': 720,
//            'background-color': 'transparent',
//            'decor-color': 'transparent',
//        });
//        $drawdiv.css({"width": 576, "height": 720, "border": "1px solid black", "margin": "0 auto"});

        $drawdiv.jSignature({
            'lineWidth': 0,
            'width': 480,
            'height': 400,
            'background-color': 'transparent',
            'decor-color': 'transparent',
        });
        $drawdiv.css({"width": 480, "height": 400, "border": "1px solid black", "margin": "0 auto"});

        $sigdiv.jSignature({
            'lineWidth': 0,
            'width': 480,
            'height': 400,
            'background-color': 'transparent',
            'decor-color': 'transparent',
        });
        $sigdiv.css({"width": 480, "height": 400, "border": "1px solid black", "margin": "0 auto"});
    } else {
        console.log("less than 746 ");
        $drawdiv.jSignature({
            'lineWidth': 0,
            'width': 280,
            'height': 350,
            'background-color': 'transparent',
            'decor-color': 'transparent',
        });

        $drawdiv.css({"width": 280, "height": 350, "border": "1px solid black", "margin": "0 auto"});

        $sigdiv.jSignature({
            'lineWidth': 0,
            'width': 300,
            'height': 250,
            'background-color': 'transparent',
            'decor-color': 'transparent',
        });

        $sigdiv.css({"width": 300, "height": 250, "border": "1px solid black", "margin": "0 auto"});

    }

    // This function doesn't work with older versions of android
    window.dispatchEvent(new Event('resize'));

    $('#signaturepopup .verifyBtn .verify0').bind('click', function () {
        $('#signaturepopup').hide();
        confirmSign(1);
    });
    $('#signaturepopup .verifyBtn .verify1').bind('click', function () {
        $('#signaturepopup').hide();
        confirmSign(2);
    });
    $('#signaturepopup .verifyBtn .verify0,#signaturepopup .verifyBtn .verify1').bind('vmousedown', function () {
        $(this).css('background-color', '#b2b2b2');
    }).bind('vmouseup', function () {
        $(this).css('background-color', '#f5f5f5');
    }).bind('vmousecancel', function () {
        $(this).css('background-color', '#f5f5f5');
    });

    $('#drawingpopup .verifyBtn .verify0').bind('click', function () {
        $('#drawingpopup').hide();
        confirmDraw(1);
    });
    $('#drawingpopup .verifyBtn .verify1').bind('click', function () {
        $('#drawingpopup').hide();
        confirmDraw(2);
    });
    $('#drawingpopup .verifyBtn .verify0,#drawingpopup .verifyBtn .verify1').bind('vmousedown', function () {
        $(this).css('background-color', '#b2b2b2');
    }).bind('vmouseup', function () {
        $(this).css('background-color', '#f5f5f5');
    }).bind('vmousecancel', function () {
        $(this).css('background-color', '#f5f5f5');
    });


    $('.navBtn').bind('vmousedown', function () { //opacity toggle feedback effect
        $(this).css('opacity', '0.7');
    }).bind('vmouseup', function () {
        $(this).css('opacity', '1.0');
    }).bind('vmousecancel', function () {
        $(this).css('opacity', '1.0');
    });

    $('#settingsBtn').bind('click', function () {

        var getlanguage_URL = databaseIP + "/Controller/mobile_controller.jsp?type=system&action=language";
        $.ajax({
            url: getlanguage_URL,
            type: 'GET',
            success: function (data) {
                if (data.result) {
                    $("#languageSelect").html("");
                    for (i = 0; i < data.data.length; i++) {
                        $("#languageSelect").append("<option value='" + data.data[i].code + "'>" + data.data[i].name + "</option>");
                    }
                    if (window.localStorage["language"] != null) {
                        $("#languageSelect").find('option[value="' + window.localStorage["language"] + '"]').attr("selected", true);
                    }
                    $("#languageSelect").change(function () {
                        changeLanguage($(this).val());
                    })
                    
                    if (window.localStorage["calendarMode"] != null) {
                        $("#calendarModeSelect").find('option[value="' + window.localStorage["calendarMode"] + '"]').attr("selected", true);
                    }
                    $("#calendarModeSelect").change(function () {
                        changeCalendarMode($(this).val());
                    })
                    
                    spinIn();
                    $.mobile.changePage("#settings", {transition: 'fade'});
                    spinOut();
                } else {
                    //
                }
            },
            error: function (error, errorText, errorThrown) {
                console.log("getLanguage error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
                spinOut();
            }
        })
    });
    $('#settings .backBtn').bind('click', function () {
        spinIn();
        //do something here to apply settings before going back
        setTimeout(function () {
            $.mobile.changePage("#index", {transition: 'fade', reverse: 'true'});
            spinOut();
        }, 500);
    });
    
//    function on() {
//      document.getElementById("overlay").style.display = "block";
//    }
//
//    function off() {
//      document.getElementById("overlay").style.display = "none";
//    }

    $('#syncjobList .backBtn').bind('click', function () {
        spinIn();
        setTimeout(function () {
            $.mobile.changePage("#main", {transition: 'fade', reverse: 'true'});
            clearInterval(downloadTimer);
            spinOut();
        }, 500);
    });    
    
    $('#main .uploadCount').bind('click', function () {
        
        $.mobile.changePage("#syncjobList", {transition: "fade"});
        showUploadJobFile("all");
        
        var timeleft = 20;
        downloadTimer = setInterval(function(){
        timeleft--;
            if(timeleft <= 0){
              timeleft = 20;
              showUploadJobFile("all");  
            }   
        },1000);
        
    });    
    
    $('#ManualRegistrationBtn').bind('click', function(){
//        $("#loginmanualUser").val('');
//        $("#loginmanualPassword").val('');
//        on();
        window.location = "#ManualDeviceRegistrationPage";

        var url = databaseIP;
        var host =  new URL(url).hostname;
        var pathname = new URL(url).pathname;
        pathname = pathname.replace(/\//g, '');
        $("#domain").val(host);
        $("#applicationName").val(pathname);
        $("#labelName").val(localStorage.getItem("assetLabel"));                
        $("#companyName").val(localStorage.getItem("customer"));                
        $("#unitIdName").val(localStorage.getItem("unitId"));  
        $("#offlineRecords").val(localStorage.getItem("mobileRecords"));  
        //console.log("DataValue :- " + localStorage.getItem("mobileRecords"));

        if (localStorage.getItem("mobileRecords") == null) {
            $("#offlineRecords").val("1000");
        }
    });
    
//    $('#btnmCancel').bind('click', function () {
//        off();
//    });
    
    $('#btnmOk').on('click', function () {
        
        var user = $('#loginmanualUser').val(), password = $('#loginmanualPassword').val();
        
        if (user.length != 0 && password.length != 0 ) {
            
            console.log("ip: " + databaseIP);   
            
            var loginmURL = databaseIP + "Controller/mobile_controller.jsp?type=system&action=getcustomerid"
                    + "&uname=" + encodeURIComponent(user)
                    + "&pwd=" + encodeURIComponent(password);
            console.log("loginmURL: " + loginmURL);   
        
            $.ajax({
                url: loginmURL,
                type: 'GET',
                timeout: 30000,
                success: function (data) {
                    
                    if (data.result) {
                        
                        window.localStorage['customerid'] = data.customer_id;
                        window.localStorage['customername'] = data.customer;
                        spinOut();
                        off();
                        
                        window.location = "#ManualDeviceRegistrationPage";

                        var url = databaseIP;
                        var host =  new URL(url).hostname;
                        var pathname = new URL(url).pathname;
                        pathname = pathname.replace(/\//g, '');
                        $("#domain").val(host);
                        $("#applicationName").val(pathname);
                        $("#labelName").val(localStorage.getItem("assetLabel"));                
                        $("#companyName").val(localStorage.getItem("customer"));                
                        $("#unitIdName").val(localStorage.getItem("unitId"));  
                        $("#offlineRecords").val(localStorage.getItem("mobileRecords"));  
                        //console.log("DataValue :- " + localStorage.getItem("mobileRecords"));
                        
                        if (localStorage.getItem("mobileRecords") == null) {
                            $("#offlineRecords").val("1000");
                        }
                        
                    } 
                    else 
                    {
                        navigator.notification.alert(lang.Mobile007, function () {
                        }, lang.Mobile006, '✔');
                        $("#loginmanualPassword").val(''); // clear loginPassword field
                        $('#loginmanualPassword').focus();
                        spinOut();
                        //off();
                    }
                },
                error: function (error, errorText, errorThrown) {
                    console.log("Error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                    $("#loginmanualUser").val(''); //clear loginUser field
                    $("#loginmanualPassword").val(''); // clear loginPassword field
                    navigator.notification.alert(lang.Mobile009, function () {
                    }, lang.Mobile008, '✔');
                    spinOut();
                    off();
                }
            })
          
        } else {
            if (user.length == 0) {
                navigator.notification.alert(lang.Mobile011, function () {
                }, lang.Mobile010, '✔');
            } else if (password.length == 0) {
                navigator.notification.alert(lang.Mobile012, function () {
                }, lang.Mobile010, '✔');
            } 
        }        
        
    });
    
    
    $('.SaveBtn').bind('click', function(){
        var applicationName = $('#applicationName').val(), unitid = $('#unitIdName').val(), company = $('#companyName').val(), label = $('#labelName').val() , offlineRecords = $('#offlineRecords').val() ;
        var domain = 'http://' + $('#domain').val() + '/' + applicationName + '/';
        var result = "";
        if(domain.length != 0 && applicationName.length != 0 && unitid.length != 0){
            
            spinIn();
           
            var registrationUrl = domain + "/Controller/mobile_controller.jsp?type=system&action=checkcustomer&unitid=" + unitid;
            
            $.ajax({
                url: registrationUrl,
                type: 'GET',
                timeout: 15000,
                success: function (data) {
                    
                    if (data.result) {
                        window.localStorage["databaseIP"] = domain;                         // localStorage - after log out, won't store data
                        databaseIP = window.localStorage["databaseIP"]; //get databaseIP from localStorage
                        console.log('****databaseIP: ' + databaseIP);
                        if(company.length == 0){
                           $('#companyName').val(" ");
                        }
                        window.localStorage["customer"] = company;
                        window.localStorage["mobileRecords"] = offlineRecords;
                        $("#offlineRecords").val(localStorage.getItem("mobileRecords"));
                        $('#customer').html('<h4>' + localStorage.getItem("customer") + '</h4>');
                        if(company.length == 0){
                           $('#labelName').val(" ");
                        }
                        if(offlineRecords.length == 0){
                           $('#offlineRecords').val("1000");
                        }  
                        
                        console.log("offlineRecords = " + offlineRecords);
                        
                        window.localStorage["assetLabel"] = label;
                        $("#registerDeviceBtn").val(localStorage.getItem("assetLabel"));
                        window.localStorage["unitId"] = unitid;
                        $("#unitId").val(localStorage.getItem("unitId")); //get unitId from localstorage
                        
                        spinOut();
                        $.mobile.changePage("#index", {transition: 'fade', reverse: 'true'});                       
                    } else {
                        $("#languageSelect").find('option[value="' + window.localStorage["language"] + '"]').attr("selected", true);
                        spinOut();                        
                        navigator.notification.alert('Please fill correct details.', function () {
                            }, 'Credential Mismatch' , '✔');                        
                    }
                },
                error: function (error, errorText, errorThrown) {
                    navigator.notification.alert('Please fill correct details.', function () {
                            }, 'Credential Mismatch' , '✔');
                    spinOut();
                }
            })            
        }else{
            if(domain.length == 0){
                navigator.notification.alert('Please enter your Domain.', function () {
                    }, 'Missing Field' , '✔');
            }else if(applicationName.length == 0){
                navigator.notification.alert('Please enter your Application Name.', function () {
                    }, 'Missing Field' , '✔');
            }else if(unitid.length == 0){
                navigator.notification.alert('Please enter your unit ID.', function () {
                    }, 'Missing Field' , '✔');
            }
        }
                  
    });
    
    $('.CancelBtn').bind('click', function(){
        spinIn();
        //do something here to apply settings before going back
        setTimeout(function () {
            $.mobile.changePage("#index", {transition: 'fade', reverse: 'true'});
            spinOut();
        }, 500);
    });
    
    $('#ManualDeviceRegistrationPage .backBtn').bind('click', function () {
        spinIn();
        //do something here to apply settings before going back
        setTimeout(function () {
            $.mobile.changePage("#index", {transition: 'fade', reverse: 'true'});
            spinOut();
        }, 500);
    });
	
    var inputSearchBox = document.getElementById('inputSearch');
    inputSearchBox.onkeyup = function(){
       $('#main .jobList li').each(function()
       {
           if($(this).attr('location_desc').toString().toUpperCase().indexOf(inputSearchBox.value.toString().toUpperCase()) >= 0
                   || $(this).attr('job_name').toString().toUpperCase().indexOf(inputSearchBox.value.toString().toUpperCase()) >= 0)
           {
               $(this).css("display","list-item");
           }
           else 
           {
               $(this).css("display","none");
           }
       }); 
    };		
	

    $('#logoutNav').bind('click', function () {
        if (localStorage.getItem("uploadQueue") == "[]" || window.localStorage["uploadQueue"] == undefined) {
            
            console.log("A11");
            
            navigator.notification.confirm(
                    lang.Mobile025,
                    confirmLogout,
                    lang.Mobile024,
                    ["✘", "✔"]
                    );
        } else {
            navigator.notification.alert(lang.Mobile027, function () {
            }, lang.Mobile026, '✔');
        }
    });
    
    $('#calendarNav').bind('click', function () 
    {
        // this to cater for offline data
        $('#main .jobList ul').html(''); 
        $('#main .jobCount span').html('0'); 
        jobsLoaded = 0;
        allJob = [];
        // this to cater for offline data
    
        backToCalendar();
    });
    
    $('.adhocBtn').bind('click', function () {
        var driverid = window.sessionStorage["userID"];
        var formtemplate_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=downloadFormTemplates&driver=" + driverid;
       
        
        $.ajax({
            url: formtemplate_URL,
            type: 'GET',
            timeout: 30000,
            success: function (data) {
                if (data.result) {
                    var form_name = data.arrFormName.split(",");
                    var form_id = data.arrFormId.split(",");
                    var form_options = "";
                    for (i = 0; i < form_id.length; i++) {
                        form_options = form_options + "<option value='" + form_id[i] + "'>" + form_name[i] + "</option>";
                    }
                    
                    
                    var form_cust_option ="";
                    
                    if (data.jobCustomerName != null && !data.jobCustomerName == '')
                    {
                        //alert('here!')
                        var form_cust_name = data.jobCustomerName.split(",");
                        var form_cust_id = data.jobCustomerId.split(",");

                        form_cust_option = form_cust_option + "<option value='0'>" + "</option>";
                        
                        for (var j = 0; j < form_cust_id.length; j++) 
                        {
                            form_cust_option = form_cust_option + "<option value='" + form_cust_id[j] + "'>" + form_cust_name[j] + "</option>";
                        }
                        
                        //alert(form_cust_option)
                    }
                    
                    confirmPopup(
                            "<div class='adhocForm'><label>" + lang.Mobile029 + "</label><select id='ftempid'>" + form_options + "</select><br><br>" +
                            "<label>" + "Customer" + "</label><select id='ftempcust'>" + form_cust_option + "</select><br><br>" +
                            "<label>" + lang.Mobile030 + "</label><input type='number' value='10' placeholder='" + lang.Mobile031 + "' ><br><br>" +
                            "<label>" + lang.Mobile032 + "</label><textarea maxlength='100' rows='2' placeholder='" + lang.Mobile033 + "'></textarea><br><br>" +
                            "<label>Description </label><input id='adDesc' maxlength='900' rows='2' placeholder='Description'></input></div>"
                            , confirmAdhoc, lang.Mobile028, ["✘", "✔"]);
                    
                    
                    
                } else {
                    console.log("adhoc_form_types fail: result returns fail.");
                }
            },
            error: function (error, errorText, errorThrown) {
                console.log("adhoc_form_types error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                spinOut();
            }
        });
    });

    $('#main .refreshBtn').bind('click', function () {
        if (isJobHistoryCheck  == true) {
            loadHistoryJob("all");
         } else {
            loadJob("all");
         }

        //ocrScanData();

    });
	
	
    $(".autorefreshBtn").bind("click", function () { 
         var img_type = $('#autorefreshimg').attr("src") ;
         if(img_type == "img/ref_on.png") 
         {
             autoRefresh = false;
             $('#autorefreshimg').attr('src', 'img/ref_off.png');
             window.plugins.toast.show("Job auto-refresh turned OFF", 'long', 'center', 
                    function(success){}, function(error){});            
         }
         else if(img_type == "img/ref_off.png") 
         {
             autoRefresh = true;
             $('#autorefreshimg').attr('src', 'img/ref_on.png');
             window.plugins.toast.show("Job auto-refresh turned ON", 'long', 'center', 
                                function(success){}, function(error){});             
         } 
    }); 	
	
    $('#form .saveBtn').bind('click', function () {
        spinIn();
        writeLogs("form saveBtn clicked,  id = " + window.sessionStorage["selected_id"]);
        resetFormSaver();
        newSaveDividedForm(window.sessionStorage["selected_file"], false, false, '', false);
    });


    bindSubmitBtn();
    
    function bindSubmitBtn() 
    {
        $('#form .submitBtn').on('touchstart', function (e) 
        {
            $(this).off('touchstart');
//            var beaconId = sessionStorage.getItem('beacon_id');

            clearTimeout(otptimerId);

            var confirmSubmitstat = checkBeaconSubmit();
            
            if ($('.otp-field')[0]) {        
                
                var chkOtp = true;   
                $('.verify-otp').each(function(){
                    if($(this).data('verified') === 'false' || $(this).data('verified') === undefined)
                    {
                        chkOtp = false;
                    }
                });                
                if(!chkOtp)
                {
                    navigator.notification.alert("OTP not verified.", function () {
                    }, "Submit failed.", '✔');
                }else {
                    if (confirmSubmitstat) 
                    {
        //                sessionStorage.removeItem('beacon_id');
                        console.log("A12");
                        navigator.notification.confirm(
                                lang.Mobile111,
                                confirmSubmit,
                                lang.Mobile112,
                                ["✘", "✔"]
                                );
                    } 
                    else 
                    {
                        navigator.notification.alert('Please move nearer to location.', function () {
                        }, 'Alert', '✔');
                    } 
                    
                }
                
            }else{
                
                if (confirmSubmitstat) 
                {
    //                sessionStorage.removeItem('beacon_id');
                    console.log("A13");
                    navigator.notification.confirm(
                            lang.Mobile111,
                            confirmSubmit,
                            lang.Mobile112,
                            ["✘", "✔"]
                            );
                } 
                else 
                {
                    navigator.notification.alert('Please move nearer to location.', function () {
                    }, 'Alert', '✔');
                }                
                
            }
            
            
            // how to disable touchstartevent from firing twice

            
            setTimeout(function () {
                bindSubmitBtn();
            }, 1000);
        });
    }

        
    bindBackBtn();
    function bindBackBtn() {
//        sessionStorage.removeItem('beacon_id');
        $('#form .backBtn').on('touchstart', function () {
            $(this).off('touchstart');
            console.log("A14");
            navigator.notification.confirm(
                    lang.Mobile078,
                    confirmBackForm,
                    lang.Mobile077,
                    ["✘", "✔"]
                    );
            setTimeout(function () {
                bindBackBtn();
            }, 1000);
        });
    }

    $(".queuelistBtn").bind("click", function () { //yyy
        navigator.notification.alert("Please note that you are entering the queue list that is used for bug fixing. If you encounter any issues, remember to screenshot it and send it to us.", function () {
            $.mobile.changePage("#queue", {transition: 'flip'});
            initQueueList();
        }, "Enter Queue List", 'OK');
    });
    
    $(".HistoryBtn").bind("click", function () { 
         var img_type = $('#historyimg').attr("src") ;
         if(img_type == "img/currentjob.png") {
             isJobHistoryCheck = true;
             $('#historyimg').attr('src', 'img/historyjob.png');
             loadHistoryJob("all");
         }else if(img_type == "img/historyjob.png") {
             isJobHistoryCheck = false;
             $('#historyimg').attr('src', 'img/currentjob.png');
             loadJob("all");
         }
    });


    cordova.plugins.diagnostic.isGpsLocationEnabled(
            function (enabled)
            {
                console.log("GPS location isY " + (enabled ? "enabled" : "disabled"));
                if (!enabled)
                {
                    console.log("A15");
                    navigator.notification.confirm(
                            "Go to location settings?",
                            goToLocationSettings,
                            "GPS Location Not Enabled",
                            ["✘", "✔"]
                            );
                }
            }, function (error) {
        console.error("The following error occurred: " + error);
    }
    );

    navigator.globalization.getDatePattern(function (s)
    {
        var tz = s.timezone;

        timeZone = tz.replace(/GMT/g, '');

        zoneId = s.iana_timezone;

        utcOffset = parseInt(s.utc_offset, 10) + parseInt(s.dst_offset, 10);

    });
    
    //CHX2020
//    setTimeout(function()
//    {
//        cordova.plugins.backgroundMode.on('activate', function () {
//            console.log("Disabled webview optimizations");
//            cordova.plugins.backgroundMode.disableWebViewOptimizations();
//        });
//        cordova.plugins.backgroundMode.enable();
//    }, 500);
    
    
}


function ocrScanData(){

    navigator.camera.getPicture(onSuccess, onFail, { quality: 100, correctOrientation: true });

    function onSuccess(imageData) {
          textocr.recText(0, /*3,*/ imageData, onSuccess, onFail); // removed returnType (here 3) from version 2.0.0
          // for sourceType Use 0,1,2,3 or 4
          // for returnType Use 0,1,2 or 3 // 3 returns duplicates[see table]
          function onSuccess(recognizedText) {
                //var element = document.getElementById('pp');
                //element.innerHTML=recognizedText;
                //Use above two lines to show recognizedText in html
                console.log(recognizedText);
               // console.log(JSON.stringify(recognizedText));
                console.log("data here " + (JSON.stringify(recognizedText.lines.linetext.toString())));
                
                //alert(recognizedText);
          }
          function onFail(message) {
                alert('Failed because: ' + message);
          }
    }
    function onFail(message) {
          alert('Failed because: ' + message);
    }    
    
}

function checkBeaconSubmit() 
{
    var output = false;
    
    if (startJobBeaconId === '-1')
    {
        output = true;
    }
    else
    {
        var beaconId = checkLastDetectedBeacons(startJobBeaconId);
    
        if (beaconId !== '') 
        {
            output = true;
        }
    }
    
    return output;
}

function onResume()
{
    cordova.plugins.diagnostic.isGpsLocationEnabled
    (
        function (enabled)
        {
            if (!enabled)
            {
                console.log("A16");
                navigator.notification.confirm(
                        "Go to location settings?",
                        goToLocationSettings,
                        "GPS Location Not Enabled",
                        ["✘", "✔"]
                        );
            }
        }, 
        function (error) 
        {
            console.error("The following error occurred: " + error);
        }   
    );
}

function goToLocationSettings(response) {
    if (response == 2)
    { //if Yes
        cordova.plugins.diagnostic.switchToLocationSettings();
    } 
    else
    {
        navigator.notification.alert('Please enable GPS location first.',
        function ()
        {
            onResume();
        }, 'Unable to Proceed', '✔');
    }
}


function clearCache() { // clear cacher folder that store photo image from camaera, the camera plugin will auto store in local cache for android
    var cacheDir = "";
    window.resolveLocalFileSystemURL(cordova.file.externalCacheDirectory, function (dir) {
        cacheDir = dir;
        var directoryReader = dir.createReader();
        directoryReader.readEntries(readAllFilesSuccess, readAllFilesFail);
    }, errorCallback);

    function readAllFilesFail(error) {
        console.log("Failed to list directory contents: " + error.code);
    }
    function readAllFilesSuccess(entries) {
        for (var i = 0; i < entries.length; i++) {
            cacheDir.getFile(entries[i].name, {create: false}, function (fileEntry) {
                fileEntry.remove(function () {
                    console.log('File removed.');
                }, errorCallback1);
            }, errorCallback2);
        }
    }
    function errorCallback(error) {
        console.log("ERROR with getting directory path : " + error.code);
    }
    function errorCallback1(error) {
        console.log("ERROR with removing file: " + error.code);
    }
    function errorCallback2(error) {
        console.log("ERROR with getting file  : " + error.code);
    }
}

function createFile() {
    var now = getCurrentDateTime(5);
    var logFileName = now + "log.txt"

    logDirectory.getFile(logFileName, {create: true, exclusive: true}, function (fileEntry) {
        //alert('File creation successfull!');
        console.log("Log File creation successfully");
    }, errorCallback);

    function errorCallback(error) {
        console.log("Log Creation Error, code 12 = File Path Exist, code = " + error.code)
    }
}

function writeLogs(logText) {
    var now = getCurrentDateTime(5);
    var logFileToday = now + "log.txt"

    // need to check if it is today log
    logText = logText + " Time " + new Date();
//    console.log(logText);
    if (typeof logDirectory == 'undefined') {
        return false;
    }
    logDirectory.getFile(logFileToday, {create: false}, function (fileEntry) {
        writeContent(fileEntry);
    }, function failToGetTodayLogFile() { // if cant get today logFile, then it will create and write into it
        logDirectory.getFile(logFileToday, {create: true, exclusive: true}, function (fileEntry) {
            writeContent(fileEntry);
        }, errorCallback1);
    });

    function writeContent(fileEntry) { // if there are multiple entries in the same seconds, it might overwrite same line of logs. 
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {
            fileWriter.seek(fileWriter.length); // Start write position at EOF.
            // Create a new Blob and write it to log.txt.
            fileWriter.write(new Blob([logText + '\n'], {type: 'text/plain'}));
            //console.log("write to log file successfully " + logFileToday + "Content : " + logText);
        }, errorCallback);
    }

    function errorCallback(error) {
        console.log("errorWritingLog + " + error.code + error.message);
    }
    function errorCallback1(error) {
        console.log("error Getting Log File + " + error.code + error.message);
    }
}

function deleteFile() { // this is to delete the log file > 7 days.
    console.log("deletingFile");
    var lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 8);

    var directoryReader = logDirectory.createReader();
    directoryReader.readEntries(readAllFilesSuccess, readAllFilesFail);

    function readAllFilesFail(error) {
        alert("Failed to list directory contents: " + error.code);
    }
    function readAllFilesSuccess(entries) {
        if (entries.length < 7) {
            console.log("Nothing to Delete, Log Files are kept for 7 days");
        } else
        {
            for (var i = 0; i < entries.length; i++) {
                entries[i].file(function (file) {

                    var fileDateText = file.name.substring(0, 8).split("-");
                    var fileDate = new Date("20" + fileDateText[2], fileDateText[1] - 1, fileDateText[0]);
                    //console.log("file.name " + file.name.substring(0,8) + " " + fileDate);

                    if (lastWeekDate.getTime() > fileDate.getTime()) {
                        logDirectory.getFile(file.name, {create: false}, function (fileEntry) {
                            console.log("removing file name " + file.name);
                            fileEntry.remove(function () {
                                console.log('File removed.');
                            }, errorCallback);
                        }, errorCallback1);
                    }
                });
            }
        }
    }
    function errorCallback(error) {
        console.log("ERROR with removing file: " + error.code)
    }
    function errorCallback1(error) {
        console.log("ERROR with finding file : " + error.code)
    }
}

$(function () {
    $('#confirmPopup').popup();
});


function onBackKeyDown() {

}

function onResize() {
    if ($('body').height() < initialheight) { //keyboard up
        $('#settingsBtn').hide();
        $('#customer').hide();
        $('#version').hide();
        $('[data-role=header]').hide();
        $('[data-role=footer]').hide();
    } else { //keyboard hidden
        $('#settingsBtn').show();
        $('#customer').show();
        $('#version').show();
        $('[data-role=header]').show();
        $('[data-role=footer]').show();
    }
}

function confirmLogout(response) {
    if (response == 2) { //if OK
        logout();
    } //else do nothing
}

function confirmExit(response) {
    if (response == 2) { //if OK
        spinIn();
        window.clearInterval(jobInterval);
        window.clearInterval(gpsInterval);
        window.clearInterval(pendingJobsRetryInterval);
        stopBluetooth();
        window.clearTimeout(uploadInterval);
        navigator.app.exitApp();
        spinOut();
    } //else do nothing
}

function confirmAdhoc(response) {
    if (response == 2)
    { //if OK
        
        var user_id = window.sessionStorage["userID"];
        //var templateid = $('#confirmPopup select').val();
        var duration = $('#confirmPopup input[type="number"]').val();
        var location = $('#confirmPopup textarea').val();
		
		var templateid = $('#ftempid').val();
        var customerid = $('#ftempcust').val() ;
		var adhocDesc = $('#adDesc').val() ;
        
        if (customerid == "") {
            customerid = 0;
        }
        
        var chkAdhocLocationCondition = true;
        
        if (mobileCompulsoryAdhocLocation == true){
            if (location.length == 0) {    
                chkAdhocLocationCondition = true;
                navigator.notification.alert("Unable to create adhoc job. Please specify location.", function () {
                        }, "Location Not Specified", '✔');
            }else {
                chkAdhocLocationCondition = false;
            }            
        }else {
            chkAdhocLocationCondition = false;
        }
        
        if(chkAdhocLocationCondition == false){
           
            if (templateid != null && duration != null )
            {
                spinIn();
                var JSONText = {};
                JSONText.driver = parseInt(user_id);
                JSONText.templateid = parseInt(templateid);
                JSONText.jobCustomerId = parseInt(customerid);
                JSONText.duration = parseInt(duration);
                JSONText.location = location;
				JSONText.description = adhocDesc;
                JSONText.timezone = timeZone;
                JSONText.zoneid = zoneId;
                JSONText.utcoffset = utcOffset;
                JSONText = JSON.stringify(JSONText);

                var createAdhoc_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=adhoc";

                $.ajax({
                    type: 'POST',
                    url: createAdhoc_URL,
                    data: JSONText,
                    contentType: "application/json",
                    dataType: "json",
                    cache: false,
                    timeout: 30000,
                    success: function (data) {
                        if (data.result) {
                            spinOut();
                            navigator.notification.alert(lang.Mobile035, function () {
                            }, lang.Mobile034, '✔');
                            if (isJobHistoryCheck  == true) {
                               loadHistoryJob("all");
                            } else {
                               loadJob("all");
                            }  
                        } else {
                            spinOut();
                            console.log("createAdhoc failed: " + data.text);
                            if (data.text == "No report found in system with this form.") {
                                navigator.notification.alert(data.text, function () {
                                }, lang.Mobile036, '✔');
                            } else {
                                navigator.notification.alert(lang.Mobile037, function () {
                                }, lang.Mobile036, '✔');
                            }
                        }
                    },
                    error: function (error, errorText, errorThrown) {
                        spinOut();
                        console.log("createAdhoc error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                        navigator.notification.alert(lang.Mobile009, function () {
                        }, lang.Mobile036, '✔');
                    }
                });
            } else {
                navigator.notification.alert(lang.Mobile038, function () {
                }, lang.Mobile036, '✔');
            }              
            
        }
        
    } //else do nothing
}

function confirmPopup(confirmtext, func, confirmtitle, confirmbtns) {
    $('#confirmPopup .confirmTitle').html(confirmtitle);
    $('#confirmPopup .confirmText').html(confirmtext);
    $('#confirmPopup .confirmBtn').html("");

    for (i = 0; i < confirmbtns.length; i++) {
        $('#confirmPopup .confirmBtn').append('<div class="confirm' + i + '">' + confirmbtns[i] + '</div>');
        $('#confirmPopup .confirmBtn .confirm' + i).bind('click', function () {
            $('#confirmPopup').popup('close');
            func(parseInt($(this).attr('class').slice(-1)) + 1);
        }).bind('vmousedown', function () {
            $(this).css('background-color', '#b2b2b2');
        }).bind('vmouseup', function () {
            $(this).css('background-color', '');
        }).bind('vmousecancel', function () {
            $(this).css('background-color', '');
        });
        ;
    }

    $('#confirmPopup').popup();
    $('#confirmPopup').popup("open");
    $('#confirmPopup').on({//prevents background from scrolling when popup is up
        popupbeforeposition: function () {
            $('body').on('touchmove', false); // look like this is not really working, tried on adhoc button it still manage to scroll;
        },
        popupafterclose: function () {
            $('body').off('touchmove');
        }
    });
}


function confirmPopupImages(confirmtext, func, confirmtitle, confirmbtns) { // carter for only camera and gallery popup
    $('#confirmPopupImages .confirmTitle').html(confirmtitle);
    $('#confirmPopupImages .confirmText').html(confirmtext);
    $('#confirmPopupImages .confirmBtn').html("");

    for (i = 0; i < confirmbtns.length; i++) {
        $('#confirmPopupImages .confirmBtn').append('<div class="confirm' + i + '">' + confirmbtns[i] + '</div>');
        $('#confirmPopupImages .confirmBtn .confirm' + i).bind('click', function () {
            $('#confirmPopupImages').popup('close');
            func(parseInt($(this).attr('class').slice(-1)) + 1);
        }).bind('vmousedown', function () {
            $(this).css('background-color', '#b2b2b2');
        }).bind('vmouseup', function () {
            $(this).css('background-color', '');
        }).bind('vmousecancel', function () {
            $(this).css('background-color', '');
        });
        ;
    }

    $('#confirmPopupImages').popup();
    $('#confirmPopupImages').popup("open");
    $('#confirmPopupImages').on({//prevents background from scrolling when popup is up
        popupbeforeposition: function () {
            $('body').on('touchmove', false);
            $('#confirmPopupImages').css('display', 'block');
        },
        popupafterclose: function () {
            $('body').off('touchmove');
            $('#confirmPopupImages').css('display', 'none');
        }
    });
}

function spinIn() {
    window.plugins.spinnerDialog.show(null, null, true);
}

function spinInPhoto() {
    window.plugins.spinnerDialog.show(null, "Processing Photo..", true);
}

function spinInLocation() {
    window.plugins.spinnerDialog.show(null, "Getting location..", true);
}

function spinInVideo() {
    window.plugins.spinnerDialog.show(null, "Processing Video..", true);
}

function spinOut() {
    setTimeout(function () {
        window.plugins.spinnerDialog.hide();
    }, spinnerDelay);
}

function changeCalendarMode(modeValue)
{
    if (modeValue == '0')
    {
        window.localStorage["calendarMode"] = '0';
    }
    else
    {
        window.localStorage["calendarMode"] = '1';
    }
}

function changeLanguage(langcode) { // take live server's ip
    if (databaseIP == null)
    {
        return;
    }

    spinIn();
    console.log("Setting language to " + langcode);
    var language_url = databaseIP + "/Controller/mobile_controller.jsp?type=system&action=language&code=" + langcode;
    $.ajax({
        url: language_url,
        type: 'GET',
        timeout: 30000,
        success: function (data) {
            if (data.result) {
                window.localStorage["language"] = langcode;
                window.localStorage["languageJson"] = JSON.stringify(data.data);
                lang = JSON.parse(window.localStorage["languageJson"]);
                setLanguage();
                spinOut();
            } else {
                $("#languageSelect").find('option[value="' + window.localStorage["language"] + '"]').attr("selected", true);
                spinOut();
            }
        },
        error: function (error, errorText, errorThrown) {
            console.log("getLanguage error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
            spinOut();
        }
    })
}

function setLanguage() {
    /** Words in HTML **/
    $('#version').html('<h5>' + lang.Mobile022 + ' ' + localStorage.getItem("version") + '</h5>');
    $("#signaturepopup .verifyTitle").html(lang.Mobile001);
    $("#signaturepopup .verifyText span").html(lang.Mobile002);
    $("#index .loginLogoText").html(lang.Mobile003);
    $("#loginUser").attr("placeholder", lang.Mobile004);
    $("#loginPassword").attr("placeholder", lang.Mobile005);
    $("#registerDeviceBtn").attr("placeholder", lang.Mobile015);
    $("#registerDeviceText").html(lang.Mobile016);
    $("#index .loginBtn").attr("value", lang.Mobile021)
    $("#settings [data-role=header] h1").html(lang.Mobile106);
    $("#languageHeader").html(lang.Mobile107);
    $("#main .lastUpdate").html(lang.Mobile023 + " <span>-</span>")
}

    

function login() {
    var user = $('#loginUser').val(), password = $('#loginPassword').val(), unitid = $('#unitId').val();
    var deviceID = localStorage.getItem("deviceID");
    var deviceType = localStorage.getItem("deviceType");

    
     // databaseIP = "http://v3nity.com/V3Nity4UAT/" ;
     // databaseIP = 'http://203.125.7.40/V3nity4/'; //global .40 

    if (databaseIP != "" && databaseIP != undefined) {
        if (user.length != 0 && password.length != 0 && unitid.length != 0) { //if user & password & unitid fields are not empty
           var networkState = navigator.connection.type;
           if (networkState !== Connection.NONE) {
               
                spinIn();
    //            console.log(">> Logging In " + user + " To " + databaseIP + "...");
                var loginURL = databaseIP + "/Controller/mobile_controller.jsp?type=system&action=login"
                        + "&username=" + encodeURIComponent(user)
                        + "&password=" + encodeURIComponent(password)
                        + "&unitId=" + encodeURIComponent(unitid)
                        + "&deviceId=" + encodeURIComponent(deviceID)
                        + "&deviceType=" + encodeURIComponent(deviceType)
                        + "&ver=" + encodeURIComponent(window.localStorage["version"]);
                console.log("loginURL: " + loginURL);

                $.ajax({
                    url: loginURL,
                    type: 'GET',
                    timeout: 40000,
                    success: function (data) 
                    {
                        if (data.result) {
                            
                            
                            window.localStorage["loginsuccessdata"] = JSON.stringify(data);

                            getCurrentLocationNew(34,'');

                            if (localStorage.getItem("mobileRecords") == null) {
                                window.localStorage["mobileRecords"] = "1000";
                            }                        

                            console.log(">> Log In Success...");
                            window.localStorage['loginUser'] = user;
                            window.localStorage['loginPassword'] = password;
                            window.localStorage['unitId'] = unitid;

                            window.sessionStorage["userID"] = data.data.id;
                            window.sessionStorage["username"] = data.data.username;
                            window.sessionStorage["driver"] = data.data.driver;
                            window.sessionStorage["assetId"] = data.data.assetId;
							galleryResize = data.data.galleryResize;
							
                            window.localStorage['galleryHeight'] = data.data.galleryHeight;
                            window.localStorage['galleryWidth'] = data.data.galleryWidth;
                            window.localStorage['galleryQuality'] = data.data.galleryQuality;							

                            if (data.data.beacons)
                            {
                                window.sessionStorage["beaconId"] = JSON.stringify(data.data.beacons);
                                var beacons = JSON.parse(window.sessionStorage.getItem("beaconId"));
                                for (var i = 0 ; i < beacons.length ; i++)
                                {
                                    lastsenttime[i] = 0;
                                }
                            }
    //                        console.log('beacons', data.data.beacons);

                            // set defaults
                            window.sessionStorage["bluetoothScanRate"] = 20000;
                            window.sessionStorage["bluetoothStopScanRate"] = 10000;
                            window.sessionStorage["bluetoothRSSI"] = -100;


                            if (data.data.bluetoothScanRate)
                            {
                                // this is in seconds
                                var btScanRate = JSON.stringify(data.data.bluetoothScanRate);
                                window.sessionStorage["bluetoothScanRate"] = parseInt(btScanRate,10) * 1000;
                            }

                            if (data.data.bluetoothStopScanRate)
                            {
                                // this is in seconds
                                var btStopScanRate = JSON.stringify(data.data.bluetoothStopScanRate);
                                window.sessionStorage["bluetoothStopScanRate"] = parseInt(btStopScanRate,10) * 1000;
                            }

                            if (data.data.bluetoothRSSI)
                            {
                                // this should be a negative value
                                window.sessionStorage["bluetoothRSSI"] = JSON.stringify(data.data.bluetoothRSSI);
                            }


                            if (data.data.camQuality)
                            {
                                var theQuality = parseFloat(data.data.camQuality);

                                if (theQuality > 0.0 && theQuality <= 1.0)
                                {
                                    window.sessionStorage["imgQuality"] = 100 * theQuality;
                                } else
                                {
                                    // default quality used
                                    window.sessionStorage["imgQuality"] = 40;
                                }
                            } 
                            else
                            {
                                // default quality used
                                window.sessionStorage["imgQuality"] = 40;
                            }

                            if (data.data.camScale)
                            {
                                var theScale = parseFloat(data.data.camScale)

                                if (theScale > 0.5 && theScale <= 2.5)
                                {
                                    window.sessionStorage["imgDimension"] = 400 * theScale;
                                } else
                                {
                                    window.sessionStorage["imgDimension"] = 400;
                                }
                            } 
                            else
                            {
                                window.sessionStorage["imgDimension"] = 400;
                            }

                            //console.log("Text=" + data.text + ", User=" + data.data.username + ", ID=" + data.data.id + ", Driver=" + data.data.driver + ", AssetId=" + data.data.assetId);
                            writeLogs("\n Text=" + data.text + ", User=" + data.data.username + ", ID=" + data.data.id + ", Driver=" + data.data.driver + ", AssetId=" + data.data.assetId);
                            $("#unitId").hide();

                            if (data.data.gpsRefreshRate != undefined && data.data.gpsRefreshRate > 0) { // customer attributes GPSRefreshRate=60000s
                                gpsRate = data.data.gpsRefreshRate;
                            } else {
                                gpsRate = 60000; // reset back to original
                            }


                            if (data.data.mobileJobCaptureLocation)
                            {
                                console.log("^^^ Enable capture loc");
                                captureStartEndLocation = true;
                            } 
                            else
                            {
                                console.log("^^^ Disable capture loc");
                                captureStartEndLocation = false;
                            }

                            if (data.data.mobileCompulsoryAdhocLocation){
                                mobileCompulsoryAdhocLocation = true;
                            } else{
                                mobileCompulsoryAdhocLocation = false;
                            }
                            if (data.data.mobileCompulsoryEndCoordinate){
                                mobileCompulsoryEndCoordinate = true;
                            } else{
                                mobileCompulsoryEndCoordinate = false;
                            } 
                            
                            
                            if (data.data.mobileEnforceJobDurationSeconds != undefined && data.data.mobileEnforceJobDurationSeconds > 0) { 
                                    jobDuration = data.data.mobileEnforceJobDurationSeconds ;
                            } else {
                                    jobDuration = 1; // reset back to original
                            }	



                          //  gpsRate = 60000;

    //                        cordova.plugins.backgroundMode.enable();
    //                        cordova.plugins.backgroundMode.setEnabled(true);
    //                        cordova.plugins.backgroundMode.on('activate', function () {
    //                            cordova.plugins.backgroundMode.disableWebViewOptimizations();
    //                        });


                           // CHX2019
                            if (appDirectory != undefined && uploadDirectory != undefined) 
                            {
                                setTimeout(function () {
                                    getUserLocation();
                                    gpsInterval = window.setInterval(function () {
                                        getUserLocation();
                                    }, gpsRate);
                                    pendingJobsRetryInterval = window.setInterval(function () {
                                        sendPendingStatusUpdates();
                                    }, 10000);
                                    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) { //if there is files in the uploadQueue
                                        writeLogs("Login, Initiate Job Queue, Jobs in Upload Queue : " + localStorage.getItem("uploadQueue"));
                                        uploadInterval = setTimeout(function () {
                                            newUploadQueue();
                                        }, uploadFirstCall);
                                    }
                                }, 1000);
                            } else {
                                setTimeout(function () {
                                    getUserLocation();
                                    gpsInterval = window.setInterval(function () {
                                        getUserLocation();
                                    }, gpsRate);
                                    pendingJobsRetryInterval = window.setInterval(function () {
                                        sendPendingStatusUpdates();
                                    }, 10000);
                                    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) { //if there is files in the uploadQueue
                                        uploadInterval = setTimeout(function () {
                                            newUploadQueue();
                                        }, uploadFirstCall);
                                    }
                                }, 400);
                            }

                            // CHX2019
                            if (window.localStorage["calendarMode"] === '1')
                            {
                                $.mobile.changePage("#calendar", {transition: "fade"});
                            }
                            else
                            {
                                $.mobile.changePage("#main", {transition: "fade"});
                            }
                            spinOut();

    //                        console.log('window.sessionStorage["bluetoothScanRate"]: ' + window.sessionStorage["bluetoothScanRate"])
                            window.clearTimeout(bluetoothInterval);
                            bluetoothInterval = setInterval(function()
                                {
    //                                console.log('scanning...');
                                    checkBluetoothInterval();
                                }, window.sessionStorage["bluetoothScanRate"]);
                        } 
                        else 
                        {
                            navigator.notification.alert(lang.Mobile007, function () {
                            }, lang.Mobile006, '✔');
                            $("#loginPassword").val(''); // clear loginPassword field
                            $('#loginPassword').focus();
                            spinOut();
                        }

                        if (data.data.wifiAttribute) { // Customer attributes MobileWifi=1
                            if (data.data.wifiAttribute == 1) {
                                wifiAttribute = 1;
                            } else {
                                wifiAttribute = 0;
                            }
                        } else {
                            wifiAttribute = 0;
                        }

                        if (data.data.disableGps) { // Customer attributes MobileWifi=1
                            if (data.data.disableGps == 1) {
                                disableGps = 1;
                            } else {
                                disableGps = 0;
                            }
                        } else {
                            disableGps = 0;
                        }
                    },
                    error: function (error, errorText, errorThrown) {
                        console.log("Error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                        localStorage.removeItem('loginUser'); //remove loginUser from localStorage
                        localStorage.removeItem('loginPassword'); //remove loginPassword from localStorage
                        $("#loginUser").val(''); //clear loginUser field
                        $("#loginPassword").val(''); // clear loginPassword field
                        navigator.notification.alert(lang.Mobile009, function () {
                        }, lang.Mobile008, '✔');
                        spinOut();
                    }
                });
               
               
           }else {
                               
                            var data = JSON.parse(window.localStorage["loginsuccessdata"]);
               
                            getCurrentLocationNew(34,'');

                            if (localStorage.getItem("mobileRecords") == null) {
                                window.localStorage["mobileRecords"] = "1000";
                            }                        

                            console.log(">> Log In Success...");
                            window.localStorage['loginUser'] = user;
                            window.localStorage['loginPassword'] = password;
                            window.localStorage['unitId'] = unitid;

                            window.sessionStorage["userID"] = data.data.id;
                            window.sessionStorage["username"] = data.data.username;
                            window.sessionStorage["driver"] = data.data.driver;
                            window.sessionStorage["assetId"] = data.data.assetId;

                            if (data.data.beacons)
                            {
                                window.sessionStorage["beaconId"] = JSON.stringify(data.data.beacons);
                                var beacons = JSON.parse(window.sessionStorage.getItem("beaconId"));
                                for (var i = 0 ; i < beacons.length ; i++)
                                {
                                    lastsenttime[i] = 0;
                                }
                            }
    //                        console.log('beacons', data.data.beacons);

                            // set defaults
                            window.sessionStorage["bluetoothScanRate"] = 20000;
                            window.sessionStorage["bluetoothStopScanRate"] = 10000;
                            window.sessionStorage["bluetoothRSSI"] = -100;


                            if (data.data.bluetoothScanRate)
                            {
                                // this is in seconds
                                var btScanRate = JSON.stringify(data.data.bluetoothScanRate);
                                window.sessionStorage["bluetoothScanRate"] = parseInt(btScanRate,10) * 1000;
                            }

                            if (data.data.bluetoothStopScanRate)
                            {
                                // this is in seconds
                                var btStopScanRate = JSON.stringify(data.data.bluetoothStopScanRate);
                                window.sessionStorage["bluetoothStopScanRate"] = parseInt(btStopScanRate,10) * 1000;
                            }

                            if (data.data.bluetoothRSSI)
                            {
                                // this should be a negative value
                                window.sessionStorage["bluetoothRSSI"] = JSON.stringify(data.data.bluetoothRSSI);
                            }


                            if (data.data.camQuality)
                            {
                                var theQuality = parseFloat(data.data.camQuality);

                                if (theQuality > 0.0 && theQuality <= 1.0)
                                {
                                    window.sessionStorage["imgQuality"] = 100 * theQuality;
                                } else
                                {
                                    // default quality used
                                    window.sessionStorage["imgQuality"] = 40;
                                }
                            } 
                            else
                            {
                                // default quality used
                                window.sessionStorage["imgQuality"] = 40;
                            }

                            if (data.data.camScale)
                            {
                                var theScale = parseFloat(data.data.camScale)

                                if (theScale > 0.5 && theScale <= 2.5)
                                {
                                    window.sessionStorage["imgDimension"] = 400 * theScale;
                                } else
                                {
                                    window.sessionStorage["imgDimension"] = 400;
                                }
                            } 
                            else
                            {
                                window.sessionStorage["imgDimension"] = 400;
                            }

                            //console.log("Text=" + data.text + ", User=" + data.data.username + ", ID=" + data.data.id + ", Driver=" + data.data.driver + ", AssetId=" + data.data.assetId);
                            writeLogs("\n Text=" + data.text + ", User=" + data.data.username + ", ID=" + data.data.id + ", Driver=" + data.data.driver + ", AssetId=" + data.data.assetId);
                            $("#unitId").hide();

                            if (data.data.gpsRefreshRate != undefined && data.data.gpsRefreshRate > 0) { // customer attributes GPSRefreshRate=60000s
                                gpsRate = data.data.gpsRefreshRate;
                            } else {
                                gpsRate = 60000; // reset back to original
                            }


                            if (data.data.mobileJobCaptureLocation)
                            {
                                console.log("^^^ Enable capture loc");
                                captureStartEndLocation = true;
                            } 
                            else
                            {
                                console.log("^^^ Disable capture loc");
                                captureStartEndLocation = false;
                            }

                            if (data.data.mobileCompulsoryAdhocLocation){
                                mobileCompulsoryAdhocLocation = true;
                            } else{
                                mobileCompulsoryAdhocLocation = false;
                            }
                            if (data.data.mobileCompulsoryEndCoordinate){
                                mobileCompulsoryEndCoordinate = true;
                            } else{
                                mobileCompulsoryEndCoordinate = false;
                            }
                            
                            
                            if (data.data.mobileEnforceJobDurationSeconds != undefined && data.data.mobileEnforceJobDurationSeconds > 0) { 
                                    jobDuration = data.data.mobileEnforceJobDurationSeconds ;
                            } else {
                                    jobDuration = 1; // reset back to original
                            }	



                          //  gpsRate = 60000;

    //                        cordova.plugins.backgroundMode.enable();
    //                        cordova.plugins.backgroundMode.setEnabled(true);
    //                        cordova.plugins.backgroundMode.on('activate', function () {
    //                            cordova.plugins.backgroundMode.disableWebViewOptimizations();
    //                        });


                           // CHX2019
                            if (appDirectory != undefined && uploadDirectory != undefined) 
                            {
                                setTimeout(function () {
                                    getUserLocation();
                                    gpsInterval = window.setInterval(function () {
                                        getUserLocation();
                                    }, gpsRate);
                                    pendingJobsRetryInterval = window.setInterval(function () {
                                        sendPendingStatusUpdates();
                                    }, 10000);
                                    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) { //if there is files in the uploadQueue
                                        writeLogs("Login, Initiate Job Queue, Jobs in Upload Queue : " + localStorage.getItem("uploadQueue"));
                                        uploadInterval = setTimeout(function () {
                                            newUploadQueue();
                                        }, uploadFirstCall);
                                    }
                                }, 1000);
                            } else {
                                setTimeout(function () {
                                    getUserLocation();
                                    gpsInterval = window.setInterval(function () {
                                        getUserLocation();
                                    }, gpsRate);
                                    pendingJobsRetryInterval = window.setInterval(function () {
                                        sendPendingStatusUpdates();
                                    }, 10000);
                                    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) { //if there is files in the uploadQueue
                                        uploadInterval = setTimeout(function () {
                                            newUploadQueue();
                                        }, uploadFirstCall);
                                    }
                                }, 400);
                            }

                            // CHX2019
                            if (window.localStorage["calendarMode"] === '1')
                            {
                                $.mobile.changePage("#calendar", {transition: "fade"});
                            }
                            else
                            {
                                $.mobile.changePage("#main", {transition: "fade"});
                            }
                            spinOut();

    //                        console.log('window.sessionStorage["bluetoothScanRate"]: ' + window.sessionStorage["bluetoothScanRate"])
                            window.clearTimeout(bluetoothInterval);
                            bluetoothInterval = setInterval(function()
                                {
    //                                console.log('scanning...');
                                    checkBluetoothInterval();
                                }, window.sessionStorage["bluetoothScanRate"]);               
        
           }
            
        } else {
            if (user.length == 0) {
                navigator.notification.alert(lang.Mobile011, function () {
                }, lang.Mobile010, '✔');
            } else if (password.length == 0) {
                navigator.notification.alert(lang.Mobile012, function () {
                }, lang.Mobile010, '✔');
            } else if (unitid.length == 0) {
                navigator.notification.alert('Please enter your unit ID.', function () {
                }, lang.Mobile010, '✔');
            }
        }
    } else {
        navigator.notification.alert(lang.Mobile014, function () {
        }, lang.Mobile013, '✔');
    }
    
}





function getCurrentLocationNew(eventId,job_id) {
    
    console.log("New Modify function");
    
    var geoOptions = {enableHighAccuracy: true, timeout: 10000};
    navigator.geolocation.getCurrentPosition(function (position)
    {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        sendLocationNew(lat, lng,eventId,job_id);
        
    }, function (error) {
        geolocFail();
    }, geoOptions);

    function geolocFail() {
        console.log("Get User LongLat Failed or Timed Out");
    }
}

function sendLocationNew(lat, lng,  eventId, job_id) 
{
    var user_id = window.sessionStorage["userID"];
    var asset_id = window.sessionStorage["assetId"];
    var unit_id = window.localStorage['unitId'];
    
    var updateUserGps_URL = '';
    
    updateUserGps_URL = databaseIP + "Controller/mobile_controller.jsp?type=track&action=gps&driver=" + encodeURIComponent(user_id) + "&assetId=" + encodeURIComponent(asset_id) + "&longitude=" + encodeURIComponent(lng) + "&latitude=" + encodeURIComponent(lat) + "&event=" + encodeURIComponent(eventId) + "&unitId=" + encodeURIComponent(unit_id) + "&direct=1&reference=" + job_id;

    console.log('********SENDING GPS NEW: ' + updateUserGps_URL);

    $.ajax({
        url: updateUserGps_URL,
        type: 'GET',
        timeout: 10000,
        success: function (data) {
            if (data.result) {
                //                console.log("result = true; update to gps;");
            } else {
                //                console.log("result = false; no update to gps.fail to update gps");
            }
        },
        error: function (error, errorText, errorThrown) {
            console.log("updateUserGps error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
        }
    });
    
}

function logout() 
{
    // CHX2021 remove ID
    var networkState = navigator.connection.type;
    
    if (networkState !== Connection.NONE) 
    {
        var driverId = window.sessionStorage["userID"];
        var logoutURL = databaseIP + "/Controller/mobile_controller.jsp?type=system&action=logout"
                + "&driverId=" + driverId;
        console.log("logoutURL: " + logoutURL);

        $.ajax({
            url: logoutURL,
            type: 'GET',
            timeout: 15000,
            success: function (data) 
            {
                
            },
            error: function (error, errorText, errorThrown) {
                
            }
        });
    }
    
    
    // this to cater for offline data
    $('#main .jobList ul').html(''); 
    $('#main .jobCount span').html('0'); 
    jobsLoaded = 0;
    allJob = [];
    // this to cater for offline data

    $('#mainSelectedDate').val('');                    
    deleteLocalData();

    window.clearInterval(jobInterval);
    window.clearInterval(gpsInterval);
    window.clearInterval(pendingJobsRetryInterval);
    window.clearTimeout(bluetoothInterval);
    stopBluetooth();
    clearTimeout(uploadInterval);
    sessionStorage.clear(); //clear sessionStorage data
    localStorage.removeItem('loginUser'); //remove loginUser from localStorage
    localStorage.removeItem('loginPassword'); //remove loginPassword from localStorage
    localStorage.removeItem('unit_id'); //remove loginPassword from localStorage
    $("#loginUser").val(''); //clear loginUser field
    $("#loginPassword").val(''); // clear loginPassword field

    setTimeout(function () {
        $.mobile.changePage("#index", {transition: 'fade', reverse: 'true'});
        spinOut();
    }, 500);
                    
    
    
    //CHX2020
//    cordova.plugins.foregroundService.stop();
}

function backToCalendar()
{
    // this to cater for offline data
    $('#main .jobList ul').html(''); 
    $('#main .jobCount span').html('0'); 
    jobsLoaded = 0;
    allJob = [];
    // this to cater for offline data
    
//    $('#mainSelectedDate').val('');                    
    
    spinIn();
    window.clearInterval(jobInterval);
    setTimeout(function () {
        $.mobile.changePage("#calendar", {transition: 'fade', reverse: 'true'});
        spinOut();
    }, 500);
}

function getUserLocation() {
    var referenceId = 0;
    var referenceType = 0;
    var networksArray = [];
    var options = {};

    if (wifiAttribute == 1) {
//        console.log('wifi attr 1')
        
        WifiWizard.isWifiEnabled(
        function (result) 
        { //depend weather this is needed, but it is working now. 
            if (result === false)
            {
                WifiWizard.setWifiEnabled(true, function () {
//                    console.log('=== IS ENABLED')
                    //console.log("Successfully enabled wifi in this device");
                }, function () {
//                    console.log('=== FAILED TO ENABLE')
                    //console.log("Failed to Enable Wifi in this device");
                });
            }
        }, 
        function () 
        {
            //console.log("Wifi Disabled");
        });
        
        
        WifiWizard.startScan(function () {
            //console.log("WifiWizard success");
        }, function () {});  // seem like sometime it will get cached response instead.    
        // https://developer.android.com/about/versions/oreo/background-location-limits 

        WifiWizard.getScanResults(options, function (networks) 
        {
            networks.sort(sort_by('level', {})); // sort according to signal strength. 
            for (var i = networks.length - 3; i < networks.length; i++) 
            {
                if (i < 0) 
                {
                    getCurrentLocation(); // if no wifi then go directly to get GPS
                    return false;
                }
                networksArray.push([networks[i]['BSSID'], networks[i]['level'], networks[i]['SSID']]);
                
                //console.log(i + ': ' + networks[i]['BSSID'] + ' -- ' + networks[i]['SSID']);
            }
            // only return value when the wifi details are already in our database. ** SSID1 is the strongest signal strength with lowest negative rate.
            var returnwifi_url = databaseIP + "/Controller/mobile_controller.jsp?type=hotspot&action=get&ssid1=" + encodeURIComponent(networksArray[2][0]) + "&ssid2=" + encodeURIComponent(networksArray[1][0]) + "&ssid3=" + encodeURIComponent(networksArray[0][0])
                    + "&quality1=" + encodeURIComponent(networksArray[2][1]) + "&quality2=" + encodeURIComponent(networksArray[1][1]) + "&quality3=" + encodeURIComponent(networksArray[0][1]) + "&mode=0&name1=" + encodeURIComponent(networksArray[2][2]) + "&name2=" + encodeURIComponent(networksArray[1][2]) + "&name3=" + encodeURIComponent(networksArray[0][2]);

            writeLogs(networksArray[2][0] + " q: " + networksArray[2][1] + " 2 " + networksArray[1][0] + " q: " + networksArray[1][1] + " 3: " + networksArray[0][0] + " q: " + networksArray[0][1]);
            
            //console.log("=== calls returnwifi_url: " + returnwifi_url);
            
            /*
             *  New function to capture more wifis
             */
            
            var amtOfNetworksUsed = 0;
            var MAX_NETWORKS = 10;
            var newNetworksArray = [];
            var ssidList = '';
            var qualityList = '';
            var toastData = '';
            var sqlData = '';
            var referencedData = '';
            
            
            if (networks.length > MAX_NETWORKS)
            {
                amtOfNetworksUsed = MAX_NETWORKS;
            }
            else
            {
                amtOfNetworksUsed = networks.length;
            }
            
            for (var i = 0; i < networks.length; i++) 
            {
                //console.log('SCANNED >> ' + i + ': ' + networks[i]['SSID'] + ' xx ' + networks[i]['BSSID'] +  ' -- ' + networks[i]['level'])
                if (sqlData !== '') sqlData += ',';
                sqlData += '\'' + networks[i]['BSSID'] + '\'';
            }
            
            
            for (var i = networks.length-1; i > networks.length-1-amtOfNetworksUsed; i--) 
            {
                newNetworksArray.push([networks[i]['BSSID'], networks[i]['level'], networks[i]['SSID']]);
                
                if (ssidList !== '') ssidList += ',';
                ssidList += encodeURIComponent(networks[i]['BSSID']);
                
                if (qualityList !== '') qualityList += ',';
                qualityList += encodeURIComponent(networks[i]['level']);
                
                if (toastData !== '') toastData += '\n';
                toastData += networks[i]['SSID'] + ': ' + encodeURIComponent(networks[i]['level']);
                
                //console.log('USED FOR REF >> ' + networks[i]['SSID'] + ' xx ' + networks[i]['BSSID'] +  ' -- ' + networks[i]['level'])
                if (referencedData !== '') referencedData += ',';
                referencedData += '\'' + networks[i]['BSSID'] + '\'';
                
                if ( i == 0) break;
                
            }
//            
            
            //console.log('new_returnwifi_url', new_returnwifi_url);
            
//            console.log('sqlData', sqlData);
//            console.log('referencedData', referencedData);


            //var new_returnwifi_url = databaseIP + "/Controller/mobile_controller.jsp?type=hotspot&action=search&mode=0&s=" + ssidList + "&q=" + qualityList;
            
            var new_returnwifi_url = '';
            
            var geoOptions = {enableHighAccuracy: true, timeout: 25000};
            navigator.geolocation.getCurrentPosition(function (position)
            {
                new_returnwifi_url = databaseIP + "/Controller/mobile_controller.jsp?type=hotspot&action=search&mode=0&s=" + ssidList + "&q=" + qualityList + "&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude ;   
                
                    if (DEBUG_MODE)
                    {
                        window.plugins.toast.show(toastData, 'long', 'center', 
                                function(success)
                                {
                                    //console.log('toast success: ' + a)
                                }, 
                                function(error)
                                {
        //                            alert('toast error: ' + b)
                                });
                    }                
                
                    $.ajax({
                        url: new_returnwifi_url,
                        type: 'GET',
                        success: function (data) {
                            if (data.result) {
                                if (data.data !== undefined) {
                                    //alert("nearby wifi name  " + testName  +"\nlevel" + data.data[0].Level + " location " + data.data[0].location);
                                    writeLogs("id =  " + data.data[0].id + " location = " + data.data[0].location + " level " + data.data[0].Level);
                                    // *****id return is the table column id ** NOT THE PATTERN 
                                    referenceId = data.data[0].id;
                                    var locId = data.data[0].location;
                                    var levelId = data .data[0].Level;


                                    if (DEBUG_MODE)
                                    {
                                        window.plugins.toast.show('Has referenceId: ' + referenceId + '\nLocation: ' + locId
                                                                        + '\nLevel: ' + levelId, 'long', 'center', 
                                            function(success)
                                            {
                                                //console.log('toast success: ' + a)
                                            }, 
                                            function(error)
                                            {
                    //                            alert('toast error: ' + b)
                                            });
                                    }

        //                            console.log('refId: ' + referenceId);
        //                            console.log('refType: ' + referenceType);

                                    getCurrentLocation(130, referenceId, referenceType); // lat, lng, location, eventId, referenceId, referenceType
                                } else {
                                    if (DEBUG_MODE)
                                    {
                                        window.plugins.toast.show('No references returned!', 'long', 'center', 
                                            function(success)
                                            {
                                                //console.log('toast success: ' + a)
                                            }, 
                                            function(error)
                                            {
                    //                            alert('toast error: ' + b)
                                            });
                                    }
                                    //alert("nearby wifi name " + testName + " Unable to pinpoint location, no matching found in the algo");
                                }
                            } else {
                                if (DEBUG_MODE)
                                    {
                                        window.plugins.toast.show('No references returned!', 'long', 'center', 
                                            function(success)
                                            {
                                                //console.log('toast success: ' + a)
                                            }, 
                                            function(error)
                                            {
                    //                            alert('toast error: ' + b)
                                            });
                                    }
                                getCurrentLocation();
                            }
                        },
                        error: function (error, errorText, errorThrown) {
                            console.log("returnwifi error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                            getCurrentLocation();
                        }
                    });                
                
                
            }, function (error) {
                
            }, geoOptions);


        }, function (error, errorText, errorThrown) {
            getCurrentLocation();
        });
    } else {
        getCurrentLocation();
    }
}

//function getCurrentLocation(eventId, referenceId, referenceType) {
//    var geoOptions = {enableHighAccuracy: true, timeout: 10000};
//    navigator.geolocation.getCurrentPosition(function (position)
//    {
//        var lat = position.coords.latitude;
//        var lng = position.coords.longitude;
//        if (eventId === 130 || eventId === 27) 
//        {
//            sendLocation(lat, lng, "", eventId, referenceId, referenceType);
//        } 
//        else 
//        {
//            sendLocation(lat, lng, "", "", "", "");
//        }
//    }, function (error) {
//        //checkGPSService();
//        //no need to send. No Wifi location nor GPS locations
//        
//        console.log("Get User LongLat Failed or Timed Out");
//        
////        geolocFail();
////        if (eventId === 130) {
////            sendLocation(0, 0, "", eventId, referenceId, referenceType);
////        }
//    }, geoOptions);
//
//    function geolocFail() {
//        console.log("Get User LongLat Failed or Timed Out");
//    }
//}



function getCurrentLocation(eventId, referenceId, referenceType) {
    var geoOptions = {enableHighAccuracy: true, timeout: 25000};
    navigator.geolocation.getCurrentPosition(function (position)
    {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        
        if (eventId === 130 || eventId === 27) 
        {
            sendLocation(lat, lng, "", eventId, referenceId, referenceType);
        }
        else if (eventId === START_JOB_EVENT) 
        {
            $('.form-sheet').attr("start-lat", lat);
            $('.form-sheet').attr("start-lon", lng);
        }
        else 
        {
            sendLocation(lat, lng, "", "", "", "");
        }
    }, function (error) {
        geolocFail();
    }, geoOptions);


    function geolocFail() {
        
        var geoOptions = {enableHighAccuracy: false, timeout: 25000};
        navigator.geolocation.getCurrentPosition(function (position)
        {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            if (eventId === 130 || eventId === 27)  
            {
                sendLocation(lat, lng, "", eventId, referenceId, referenceType);
            }
            else if (eventId === START_JOB_EVENT) 
            {
                $('.form-sheet').attr("start-lat", lat);
                $('.form-sheet').attr("start-lon", lng);
            }
            else {
                sendLocation(lat, lng, "", "", "", "");
            }
        }, function (error) {
            if (eventId === 130 || eventId === 27)  
            {
                sendLocation(0, 0, "", eventId, referenceId, referenceType);
            }
            else if (eventId === START_JOB_EVENT) 
            {
                $('.form-sheet').attr("start-lat", "0.0");
                $('.form-sheet').attr("start-lon", "0.0");
            }
        }, geoOptions);
    }
}

function sendLocation(lat, lng, location, eventId, referenceId, referenceType) 
{
    var user_id = window.sessionStorage["userID"];
    var asset_id = window.sessionStorage["assetId"];
    var unit_id = window.localStorage['unitId'];
    
    var updateUserGps_URL = '';
    
    var beaconIndex = 0;
    
    
    if (eventId !== "") 
    { 
        // if you want to insert stuff into dev server, use direct = 1;
        var send = false;
        var date = new Date();
        ((lastsentid === '') || (lastsentid !== referenceId)) ? send = true : send = false;
        
        var beacons = JSON.parse(window.sessionStorage["beaconId"]);
        for (var i = 0 ; i < beacons.length ; i++)
        {
            if (beacons[i].unit_id === referenceId)
            {
                beaconIndex = i;
                break;
            }
        }
        
        //console.log("Interval +" + sendInterval);
        
        var interval = date.getTime() - lastsenttime[beaconIndex];
        
        if ((interval >= sendInterval) || (send)) 
        {
            send = true;
            lastsentid = referenceId;
            lastsenttime[beaconIndex] = date.getTime();
            
            if (direct){
                 updateUserGps_URL = databaseIP + "Controller/mobile_controller.jsp?type=track&action=gps&driver=" + encodeURIComponent(user_id) + "&assetId=" + encodeURIComponent(asset_id) + "&longitude=" + encodeURIComponent(lng) + "&latitude=" + encodeURIComponent(lat)
                + "&event=" + encodeURIComponent(eventId) + "&direct=" + encodeURIComponent(direct) + "&reference=" + encodeURIComponent(referenceId) + "&referenceType=" + encodeURIComponent(referenceType) + "&unitId=" + encodeURIComponent(unit_id);
            }
            else{
                updateUserGps_URL = databaseIP + "Controller/mobile_controller.jsp?type=track&action=gps&driver=" + encodeURIComponent(user_id) + "&assetId=" + encodeURIComponent(asset_id) + "&longitude=" + encodeURIComponent(lng) + "&latitude=" + encodeURIComponent(lat)
                + "&event=" + encodeURIComponent(eventId) + "&reference=" + encodeURIComponent(referenceId) + "&referenceType=" + encodeURIComponent(referenceType) + "&unitId=" + encodeURIComponent(unit_id);
            }
        }
        
//        console.log('****GPS BeaconIndex ' + beaconIndex + ' --- ' + send + ' -- last sent for ' + referenceId + ': ' + lastsenttime[beaconIndex]);
    } 
    else 
    {
        send = true;
        updateUserGps_URL = databaseIP + "Controller/mobile_controller.jsp?type=track&action=gps&driver=" + encodeURIComponent(user_id) + "&assetId=" + encodeURIComponent(asset_id) + "&longitude=" + encodeURIComponent(lng) + "&latitude=" + encodeURIComponent(lat) + "&unitId=" + encodeURIComponent(unit_id);
    }
    
    
    var today = new Date();

    var dateTimeId = today.getDate() + "/" + (today.getMonth()+1) + "/" + today.getFullYear() + " " + + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    updateUserGps_URL = updateUserGps_URL + "&timestamp=" + encodeURIComponent(dateTimeId) ;
    
    if (disableGps)
    {
        return;
    }
    
    if (send) 
    {
        console.log('********SENDING GPS: ' + updateUserGps_URL);
        
        $.ajax({
            url: updateUserGps_URL,
            type: 'GET',
            timeout: 30000,
            success: function (data) {
                if (data.result) {
//                    console.log("Location send");
                    //                console.log("result = true; update to gps;");
                } else {
                    //                console.log("result = false; no update to gps.fail to update gps");
                    console.log("Location failed");
                    saveLocationInLocal(updateUserGps_URL);      // Save Data in Mobile when result false from database
                }
            },
            error: function (error, errorText, errorThrown) {
                console.log("updateUserGps error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
                saveLocationInLocal(updateUserGps_URL);       // Save Data in Mobile when result false from database
            }
        });
    }
    
    sendLocationToServerOfflineMode();
    
}

function deleteLocalData(){
    
    var exist = 0 ;
    
    console.log('Deleted Start'); 
    
    db.getAll('locations',function(results) {
        console.log('N Result ' + JSON.stringify(results)); 
        if (results.rows.length > 0){
            for (var i = 0; i < results.rows.length; i++) {
            console.log('SendValue ' + results.rows.item(i).send); 
                if(results.rows.item(i).send === 1 ){
                    console.log('SendValue1 ' + results.rows.item(i).send); 
                    exist = 1;
                }                
            }
        }
    },null);
    
    if (exist == 0) {
        console.log('exist ' + exist); 
        db.deleteAll('locations',function(results)
        {
               console.log('mobile data deleted'); 
        },null);        
        
    }
    
}

function saveLocationInLocal(weburl) {
        var today = new Date();

        var dateTimeId = today.getFullYear()+ "" + (today.getMonth()+1)+""+today.getDate() + today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();

        columns = [];
        columns.push({name: "id", value: dateTimeId});
        columns.push({name: "weburl", value: weburl});
        columns.push({name: "send", value: "1"});
        checkColumns = [];
        checkColumns.push({name: "id", value: dateTimeId});
        db.updateOrAdd('locations',columns,checkColumns,
        function(error)
        {
            console.log('error: ' + error.message);
        });
}

function sendLocationToServerOfflineMode() {
    
    db.getAll('locations',function(results) {
//        console.log("TotalLength :- " + results.rows.length );
        if (results.rows.length > 0){
            for (var i = 0; i < results.rows.length; i++)
            {
//                console.log("Value of Send :- " +results.rows.item(i).send);
                
                if(results.rows.item(i).send === 1 ){
                    
//                    console.log("Value of Send in Case 1  :- " +results.rows.item(i).send);
                    
                    var url = "";
                    url = results.rows.item(i).weburl;

                    var id = "";
                    id = results.rows.item(i).id;


                    $.ajax({
                        url: url,
                        type: 'GET',
                        timeout: 30000,
                        success: function (data) {
                            if (data.result) {
                                
                                console.log('Updated' );
                                
                                columns = [];
                                columns.push({name: "id", value: id});
                                columns.push({name: "weburl", value: url});
                                columns.push({name: "send", value: "0"});
                                checkColumns = [];
                                checkColumns.push({name: "id", value: id});
                                db.updateOrAddNew('locations',columns,checkColumns,
                                function(error)
                                {
                                    console.log('error: ' + error.message);
                                },
                                function(success)
                                {
                                    sendLocationToServerOfflineMode();
                                    console.log('success DB: ' + success.message);
                                });   
//                                                               
                               
                            } else {
                                
                                console.log('Not Updated' );
                                
                            }
                        },
                        error: function (error, errorText, errorThrown) {
                            console.log("updateUserGps error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
                        }
                    });
                    
                    break;
                
                }
                
            }
//            console.log("LoopEnd  "  );
           
        }
        
    },null);
    
}

var count;
var counter;
var jobsLoaded = 0;
var allJob = [];


function loadJob(type) {
    var tuploadQueue = [];
    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
        tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
        uploadCount = tuploadQueue.length;
        $('.uploadCount span').html(uploadCount); //update Upload count	
    } else {
        $('.uploadCount span').html("0"); //update Upload count
    }
    var user_id = window.sessionStorage["userID"];
    var fetch = 10;
    var offset = 0;
    var downloadURL;
    var newJob; //boolean to determine whether there were new jobs loaded
    
    var networkState = navigator.connection.type; 
    if (networkState !== Connection.NONE) {
            db.deleteAll('jobdetails',function(results)
            {
                console.log('mobile jobs data deleted');  
                if (type == "all") 
                {
                    loadDownload("all");
                    newJob = false;
                } else if (type == "new") {
                    loadDownload("new");
                    newJob = false;
                }                        
            },null);          
    }else {
        if (type == "all") 
        {
            loadDownload("all");
            newJob = false;
        } else if (type == "new") {
            loadDownload("new");
            newJob = false;
        }     
    }
    
    function loadDownload(type) {
            
        if ($('#mainSelectedDate').val() !== '')
        {
            if (type == "all") {
                downloadURL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=downloadfromcalendar&selectedDate=" + $('#mainSelectedDate').val()
                                + "&fetch=" + fetch + "&offset=" + offset + "&driver=" + user_id + "&mode=2";
            } else if (type == "new") {
                downloadURL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=downloadfromcalendar&selectedDate=" + $('#mainSelectedDate').val()
                                + "&fetch=" + fetch + "&offset=" + offset + "&driver=" + user_id + "&mode=1";
            }
        }
        else
        {
            if (type == "all") {
                downloadURL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=download&fetch=" + fetch + "&offset=" + offset + "&driver=" + user_id + "&mode=2";
            } else if (type == "new") {
                downloadURL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=download&fetch=" + fetch + "&offset=" + offset + "&driver=" + user_id + "&mode=1";
            }
        }
        
        
        //// Offline load job functionality added 
        
        if (networkState !== Connection.NONE) {
            
//            console.log("downloadURL: " + downloadURL);

            $.ajax({
                url: downloadURL,
                type: 'GET',
                timeout: 30000,
                success: function (data) 
                {
                    if (data.result)
                    {
                        // only reset if successfully retrieve
                        if (parseInt(offset,10) == 0)
                        {
                            $('#main .jobList ul').html(''); //clear list
                            $('#main .jobCount span').html('0'); //reset count
                            jobsLoaded = 0;
                            allJob = [];                          
                            
                        }

                        if (data.data.total != 0)
                        {
                            var receivedJob = [];
                            count = 0;

                            var uploadQueueArr = [];
                            if (window.localStorage["uploadQueue"])
                            {
                                uploadQueueArr = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
                            }

                            while (data.data.jobs[count])
                            {
                                
                                columns = [];
                                columns.push({name: "id", value: data.data.jobs[count].id});
                                columns.push({name: "job_id", value: data.data.jobs[count].job_id});
                                columns.push({name: "duration", value: data.data.jobs[count].duration});
                                columns.push({name: "status", value: data.data.jobs[count].status});
                                columns.push({name: "template_name", value: data.data.jobs[count].template_name});
                                columns.push({name: "job_type_id", value: data.data.jobs[count].job_type_id});
                                columns.push({name: "schedule_dt", value: data.data.jobs[count].schedule_dt});
                                columns.push({name: "location", value: data.data.jobs[count].location});
                                columns.push({name: "latitude", value: data.data.jobs[count].latitude});
                                columns.push({name: "longitude", value: data.data.jobs[count].longitude});
                                columns.push({name: "description", value: data.data.jobs[count].description});
                                columns.push({name: "preview", value: data.data.jobs[count].preview});
                                columns.push({name: "details", value: data.data.jobs[count].details});
                                checkColumns = [];
                                checkColumns.push({name: "id", value: data.data.jobs[count].id});
                                db.updateOrAdd('jobdetails',columns,checkColumns,
                                function(error)
                                {
                                    console.log('error:JobData ' + error.message);
                                });	                                
                                
                                var duration = data.data.jobs[count].duration;
                                var schedule_dt = data.data.jobs[count].schedule_dt;
                                var format_dt = schedule_dt.slice(0, 4) + "/" + schedule_dt.slice(4, 6) + "/" + schedule_dt.slice(6, 8) + " " + schedule_dt.slice(8, 10) + ":" + schedule_dt.slice(10, 12) + ":" + schedule_dt.slice(12, 14);
                                var id = data.data.jobs[count].id;

                                var jobIsUploading = false;
                                for (var i = 0 ; i < uploadQueueArr.length ; i++)
                                {
                                    var jobIdOnlyArr = uploadQueueArr[i].split("_");
                                    if (jobIdOnlyArr[0] == id)
                                    {
    //                                    console.log('xxx same job id... dont proceed!')
                                        jobIsUploading = true;
                                        break;
                                    }
                                }
                                if (jobIsUploading)
                                {
                                    count++;
                                    continue;
                                }

                                var job_type_id = data.data.jobs[count].job_type_id;
                                var job_type;
                                if (job_type_id == "1") {
                                    job_type = lang.Mobile108;
                                } else if (job_type_id == "2") {
                                    job_type = lang.Mobile109;
                                } else if (job_type_id == "3") {
                                    job_type = lang.Mobile110;
                                };
                                var job_location = data.data.jobs[count].location;
                                var latitude = data.data.jobs[count].latitude;
                                var longitude = data.data.jobs[count].longitude;
                                var status = data.data.jobs[count].status;
                                var description = data.data.jobs[count].description;
                                description = description.replace("'", "");
                                //var description = "Enforcement Visit<br>Warrant No : WA077109/2018<br>Summon No : 4180064362<br>Offender name : ROSALIE HOE SWEE LIAN<br>Instruction : Visit and Arrest<br><a class=\"e-warrant\" target=\"_blank\" href=\"http://www.africau.edu/images/default/sample.pdf\">WA0771092018.pdf</a>";
                                var job_number = data.data.jobs[count].job_id;
                                var preview = '';
                                if (data.data.jobs[count].preview != "PGRpdiBjbGFzcz0iam9iLXByZXZpZXciPjwvZGl2Pg==") {
                                    preview = data.data.jobs[count].preview;
                                }
                                var template_name = data.data.jobs[count].template_name;
                                var details = Base64.decode(data.data.jobs[count].details);
                                var html_file = id + "_" + schedule_dt + "_" + user_id + ".v3";
                                if ($('li[job_id=' + id + ']').length == 0)
                                { //check if alrdy exist in local
    //                                console.log('here if 1')
                                    $('#main .jobList ul').append("<li name='" + html_file + "' location_desc='" + description + job_location  + "' job_name='" + template_name + "' job_id='" + id + "' job_type_id='" + job_type_id + "' job_status='" + status + "' latitude='" + latitude + "' longitude='" + longitude + "'>" +
                                            "<span class='job-title'><img src='img/location.png' /><span class='job-value job-location'>" + job_location + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/job.png' /><span class='job-value job-name'>" + template_name + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/description.png' /><span class='job-value job-description'>" + description + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/type.png' /><span class='job-value job-type'>" + job_type + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/schedule.png' /><span class='job-value job-dt'>" + format_dt + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/status.png' /><span class='job-value job-status'>" + stat(status) + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/id.png' /><span class='job-value job-id'>" + job_number + "</span></span><br>" +
                                            Base64.decode(preview) +
                                            "</li>");
                                    if (latitude != 0 && longitude != 0) {
                                        $('li[job_id=' + id + ']').prepend("<span class='job-title' style='border-bottom:2px solid #eeeeee;margin:5px;'><img src='img/navigate.png' /><span class='job-value job-navigate' style='color:blue;font-weight:bold!important'>" + lang.Mobile054 + "</span></span>");
                                    }
                                } else
                                { //else update
                                    $('#main .jobList li[job_id=' + id + ']').attr('name', html_file);
                                    $('#main .jobList li[job_id=' + id + ']').attr('job_name', template_name);
									$('#main .jobList li[job_id=' + id + ']').attr('location_desc', description + job_location);
                                    $('#main .jobList li[job_id=' + id + ']').attr('job_id', id);
                                    $('#main .jobList li[job_id=' + id + ']').attr('job_type_id', job_type_id);
                                    $('#main .jobList li[job_id=' + id + ']').attr('job_status', status);
                                    $('#main .jobList li[job_id=' + id + ']').attr('latitude', latitude);
                                    $('#main .jobList li[job_id=' + id + ']').attr('longitude', longitude);
                                    $('#main .jobList li[job_id=' + id + ']').html("<span class='job-title'><img src='img/location.png' /><span class='job-value job-location'>" + job_location + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/job.png' /><span class='job-value job-name'>" + template_name + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/description.png' /><span class='job-value job-description'>" + description + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/type.png' /><span class='job-value job-type'>" + job_type + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/schedule.png' /><span class='job-value job-dt'>" + format_dt + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/status.png' /><span class='job-value job-status'>" + stat(status) + "</span></span><br>" +
                                            "<span class='job-title'><img src='img/id.png' /><span class='job-value job-id'>" + job_number + "</span></span><br>" +
                                            Base64.decode(preview));
                                    if (latitude != 0 && longitude != 0 && $('li[job_id=' + id + '] .job-navigate').length == 0) {
                                        $('li[job_id=' + id + ']').prepend("<span class='job-title' style='border-bottom:2px solid #eeeeee;margin:5px;'><img src='img/navigate.png' /><span class='job-value job-navigate' style='color:blue;font-weight:bold!important'>" + lang.Mobile054 + "</span></span>");
                                    }
                                }
                                if (type == "all")
                                {
                                    allJob.push(id);
                                    newDownload(html_file, details);

                                    if (status == "2")
                                    { //if it's scheduled planned job
                                        receivedJob.push(id); //push in array for status change to received
                                        $('#main .jobList li[job_id=' + id + ']').attr('job_status', '12'); //update status display in advanced
                                        console.log('new for id ' + id + ', count = ' + count);
                                        $('#main .jobList li[job_id=' + id + '] .job-status').html("<mark style='background-color:#CBA2E4;border-radius:5px;padding:0 10px;color:#FFFFFF;'>New</mark>");
                                    }
                                    jobsLoaded++;
                                    $('#main .jobCount span').html(jobsLoaded);
                                } else if (type == "new")
                                {
                                    if (status == "2")
                                    {
                                        newJob = true;
                                        allJob.push(id);
                                        newDownload(html_file, details);

                                        receivedJob.push(id); //push in array for status change to received
                                        $('#main .jobList li[job_id=' + id + ']').attr('job_status', '12'); //update status display in advanced
                                        console.log('new for id ' + id + ', count = ' + count);
                                        $('#main .jobList li[job_id=' + id + '] .job-status').html("<mark style='background-color:#CBA2E4;border-radius:5px;padding:0 10px;color:#FFFFFF;'>New</mark>");
                                        jobsLoaded++;
                                        $('#main .jobCount span').html(jobsLoaded);
                                    } else if (status == "8" || status == "9" || status == "12" || status == "13") { //ended/handover/received/uploading job that is likely to be a broadcast
                                        offset++;
                                    }
                                    count++;
                                }
                            }
                            var now = getCurrentDateTime(4);
                            $('#main .lastUpdate span').html(now);

                            if (receivedJob.length != 0) {
                                updateReceived(data.data.total); //update server on received jobs.
                            } else {
                                fetchAgain(data.data.total);
                            }
                            function updateReceived(totalloaded) {
                                var receivedJobString = receivedJob.toString();
                                var receivedStatus = "12";

                                var now = new Date();
                                var now = two(now.getDate()) + two(now.getMonth() + 1) + now.getFullYear() + two(now.getHours()) + two(now.getMinutes()) + two(now.getSeconds());

                                // add in driver id.
                                var user_id = window.sessionStorage["userID"];
                                var statuschange_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=statusChange&jobScheduleIds=" + receivedJobString + "&statusId=" + receivedStatus + "&driverId=" + user_id + "&dateTime=" + now;


                                console.log('AATESTING3 ' + statuschange_URL );

                                $.ajax({
                                    url: statuschange_URL,
                                    type: 'GET',
                                    timeout: 30000,
                                    success: function (data) {
                                        if (data.result) {
                                            writeLogs("statuschange success: Received " + receivedJobString);
                                            //console.log("statuschange success: Received " + receivedJobString);
                                            fetchAgain(totalloaded);
                                        } else {
                                            // console.log("statuschange fail: " + data.text + ". Retrying");
                                            writeLogs("updateReceived, statuschange fail: " + data.text + ". Retrying. Possible Loop");
                                            //updateReceived(); //retry lack one parameter and seem to go into infitie loop
                                        }
                                    },
                                    error: function (error, errorText, errorThrown) {
                                        writeLogs("loadDownload, statuschange error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
                                        //console.log("statuschange error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                                    }
                                });
                            }
                            function fetchAgain(totalloaded) {
                                if (totalloaded != 0)
                                { //check if there may be more jobs to add to queue
//                                    console.log("Fetching again");
                                    if (type == "all")
                                    {
                                        offset = offset + fetch;
                                        loadDownload("all");
                                    } else if (type == "new") {
                                        console.log("TYPE NEW");
                                        loadDownload("new");
                                    }
                                } 
                                else 
                                { //no more jobs to fetch, proceed to bind list items
                                    $('#main .jobList li').off('click');
                                    $('#main .jobList li').one('click', function () {
                                        if ($(this).attr('name') != null && $(e.target).attr('class') != "job-value job-navigate"  && $(e.target).attr('class') != "e-warrant") {
                                            
                                            var timeleft = jobDuration;
                                            jobEndedInTime = false ;
                                            jobDurationTimer = setInterval(function(){
                                                timeleft--;
                                                if(timeleft <= 0){
                                                        clearInterval(jobDurationTimer);
                                                        jobEndedInTime = true ;  
                                                }
                                            },1000); 
        
                                            goForm($(this).attr('job_id'), $(this).attr('name'), $(this).attr('job_name'), $(this).attr('job_type_id'), $(this).attr('job_status'), false);
                                        }
                                    });
                                    $('#main .jobList .job-navigate').unbind('click'); //xxx
                                    $('#main .jobList .job-navigate').bind('click', function () {
                                        var lat = $(this).parent().parent().attr('latitude');
                                        var lng = $(this).parent().parent().attr('longitude');
                                        if (lat != "0" && lng != "0" && lat != undefined && lng != undefined) {
                                            $("#confirmPopup").css({"width": "240px"});
    //                                        var staticmap = 'https://maps.googleapis.com/maps/api/staticmap?center=' + lat + ',' + lng + '&zoom=15&size=260x260&maptype=roadmap&markers=color:red%7C' + lat + ',' + lng;
                                            var staticmap = 'http://www.v3nity.com:80/V3Nity4/googleapi?type=map&action=static&lat=' + lat + '&lon=' + lng + '&maptype=roadmap&zoom=15&width=260&height=260'; // not using databaseIP cause only V3Nity4 have this new function as of 20 sep
                                            confirmPopup(
                                                    "<div style='min-width:260px;min-height:260px'><img src='" + staticmap + "' style='max-height:100%;max-width:100%'/></div>"
                                                    , function (response) {
                                                        rebindMainJobList();
                                                        if (response == 2) { //if Yes
                                                            if (device.platform == "android" || device.platform == "Android") {
                                                                console.log("device platform is " + device.platform);
                                                                window.open('google.navigation:q=' + lat + ',' + lng, '_system');
                                                            } else {
                                                                console.log("device platform is " + device.platform);
                                                                window.open('http://maps.google.com/?q=' + lat + ',' + lng, '_system');
                                                            }
                                                            $("#confirmPopup").css({"width": "initial"});
                                                        } else {
                                                            //else do nothing	
                                                            $("#confirmPopup").css({"width": "initial"});
                                                        }
                                                    }, lang.Mobile053, ["✔", "➡"]);
                                        } else {
                                            // navigator.notification.alert('Unable to show map. Location coordinates are not available for this job.',function(){},'Coordinates Unavailable','✔');										
                                        }
                                    });
                                    
                                    $('#main .jobList .e-warrant').unbind('click');
                                    $('#main .jobList .e-warrant').bind('click', function () {
                                        console.log("Open PDF1");
                                        console.log($(this).attr('href'));
                                        //var str = "http://www.africau.edu/images/default/sample.pdf";
                                        cordova.InAppBrowser.open($(this).attr('href'), '_system', 'location=yes');
                                        //window.open(str, '_system', 'location=yes')
                                       // window.open(str, '_blank', 'location=yes')
                                       rebindMainJobList();
                                       //loadJob("all");
                                       
                                    });                                
                                    
                                }
                            }

                            // spinOut()
                        } 
                        else if (jobsLoaded != 0)
                        { //no more jobs to fetch, proceed to bind list items
    //                        console.log("Fetching Finished.");
    //                        console.log("ALL JOBS: " + allJob.toString());
                            $('#main .jobList li').off('click');
                            $('#main .jobList li').one('click', function (e) {
                                if ($(this).attr('name') != null && $(e.target).attr('class') != "job-value job-navigate"  && $(e.target).attr('class') != "e-warrant") {
                                    
                                    var timeleft = jobDuration;
                                    jobEndedInTime = false ;
                                    jobDurationTimer = setInterval(function(){
                                        timeleft--;
                                        if(timeleft <= 0){
                                                clearInterval(jobDurationTimer);
                                                jobEndedInTime = true ;  
                                        }
                                    },1000); 
        
                                    goForm($(this).attr('job_id'), $(this).attr('name'), $(this).attr('job_name'), $(this).attr('job_type_id'), $(this).attr('job_status'));
                                }
                            });
                            $('#main .jobList .job-navigate').unbind('click'); 
                            $('#main .jobList .job-navigate').bind('click', function () {
                                var lat = $(this).parent().parent().attr('latitude');
                                var lng = $(this).parent().parent().attr('longitude');
                                if (lat != "0" && lng != "0" && lat != undefined && lng != undefined) {
                                    $("#confirmPopup").css({"width": "240px"});
    //                                var staticmap = 'https://maps.googleapis.com/maps/api/staticmap?center=' + lat + ',' + lng + '&zoom=15&size=260x260&maptype=roadmap&markers=color:red%7C' + lat + ',' + lng;
                                    var staticmap = 'http://www.v3nity.com:80/V3Nity4/googleapi?type=map&action=static&lat=' + lat + '&lon=' + lng + '&maptype=roadmap&zoom=15&width=260&height=260'
                                    confirmPopup(
                                            "<div style='height:260px'><img src='" + staticmap + "' style='max-height:100%;max-width:100%'/></div>"
                                            , function (response) {
                                                rebindMainJobList();
                                                if (response == 2) { //if Yes
                                                    if (device.platform == "android" || device.platform == "Android") {
                                                        console.log("device platform is " + device.platform);
                                                        window.open('google.navigation:q=' + lat + ',' + lng, '_system');
                                                    } else {
                                                        console.log("device platform is " + device.platform);
                                                        window.open('http://maps.google.com/?q=' + lat + ',' + lng, '_system');
                                                    }
                                                    $("#confirmPopup").css({"width": "initial"});
                                                } else {
                                                    //else do nothing
                                                    $("#confirmPopup").css({"width": "initial"});
                                                }
                                            }, "Map", ["✔", "➡"]);
                                } else {
                                    // navigator.notification.alert('Unable to show map. Location coordinates are not available for this job.',function(){},'Coordinates Unavailable','✔');								
                                }
                            });
                            
                            $('#main .jobList .e-warrant').unbind('click');
                            $('#main .jobList .e-warrant').bind('click', function () {
                                console.log("Open PDF2");
                                console.log($(this).attr('href'));
                                //var str = "http://www.africau.edu/images/default/sample.pdf";
                                //window.open(str, '_system', 'location=yes')
                                cordova.InAppBrowser.open($(this).attr('href'), '_system', 'location=yes');
                                rebindMainJobList();
                                //loadJob("all");
                              //  window.open(str, '_blank', 'location=yes')
                            });                                
                            
                            if (newJob)
                            { //if new jobs is loaded in loadNew
                                navigator.notification.beep(1);
                                navigator.vibrate(1000);
                            }
                            updateJob();
                        } else
                        {
                            localStorage.removeItem("localJobList");
                            // $('#main .jobList ul').html('<li style="text-align:center"><br>No Jobs Available</li>');
                            $('#main .jobCount span').html("0");
                            var now = getCurrentDateTime(4);
                            $('#main .lastUpdate span').html(now);
                            // spinOut()
                        }
                    } else {
                        // navigator.notification.alert('Failed to load job list. ID does not exist.',function(){},'Loading Failed','✔');
                        // // spinOut()
                        // logout();
                    }
                },
                error: function (error, errorText, errorThrown) {
                    writeLogs("loadDownload, Error: " + error.code + " errorText: " + errorText + " errorThrown: " + errorThrown);
                    //console.log("Error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                }
            });

        }else {
            
            
            
            ////Load Offline job 
            $('#main .jobList ul').html(''); //clear list
            $('#main .jobCount span').html('0'); //reset count
            jobsLoaded = 0;
            allJob = [];
            
            var receivedJob = [];
            count = 0;

            var uploadQueueArr = [];
            if (window.localStorage["uploadQueue"])
            {
                uploadQueueArr = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
            }

            db.getAll('jobdetails',function(results) {
                console.log('N Result ' + JSON.stringify(results)); 
                if (results.rows.length > 0){
                    
                    for (var i = 0; i < results.rows.length; i++) {
                        
                        var duration = results.rows.item(i).duration;
                        var schedule_dt = results.rows.item(i).schedule_dt;
                        var format_dt = schedule_dt.slice(0, 4) + "/" + schedule_dt.slice(4, 6) + "/" + schedule_dt.slice(6, 8) + " " + schedule_dt.slice(8, 10) + ":" + schedule_dt.slice(10, 12) + ":" + schedule_dt.slice(12, 14);
                        var id = results.rows.item(i).id;
                        
                        var jobIsUploading = false;
                        for (var j = 0 ; j < uploadQueueArr.length ; j++)
                        {
                            var jobIdOnlyArr = uploadQueueArr[j].split("_");
                            if (jobIdOnlyArr[0] == id)
                            {
                                jobIsUploading = true;
                                break;
                            }
                        }                        
                        if (jobIsUploading)
                        {
                            count++;
                            continue;
                        }                        

                        var job_type_id = results.rows.item(i).job_type_id;
                        var job_type;
                        if (job_type_id == "1") {
                            job_type = lang.Mobile108;
                        } else if (job_type_id == "2") {
                            job_type = lang.Mobile109;
                        } else if (job_type_id == "3") {
                            job_type = lang.Mobile110;
                        };
                        var job_location = results.rows.item(i).location;
                        var latitude = results.rows.item(i).latitude;
                        var longitude = results.rows.item(i).longitude;
                        var status = results.rows.item(i).status;
                        var description = results.rows.item(i).description;
                        var job_number = results.rows.item(i).job_id;
                        var preview = '';
                        if (results.rows.item(i).preview != "PGRpdiBjbGFzcz0iam9iLXByZXZpZXciPjwvZGl2Pg==") {
                            preview = results.rows.item(i).preview;
                        }
                        var template_name = results.rows.item(i).template_name;
                        var details = Base64.decode(results.rows.item(i).details);
                        var html_file = id + "_" + schedule_dt + "_" + user_id + ".v3";                        
                        
                        if ($('li[job_id=' + id + ']').length == 0)
                        { //check if alrdy exist in local
                            $('#main .jobList ul').append("<li name='" + html_file + "' location_desc='" + description + job_location  + "' job_name='" + template_name + "' job_id='" + id + "' job_type_id='" + job_type_id + "' job_status='" + status + "' latitude='" + latitude + "' longitude='" + longitude + "'>" +
                                    "<span class='job-title'><img src='img/location.png' /><span class='job-value job-location'>" + job_location + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/job.png' /><span class='job-value job-name'>" + template_name + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/description.png' /><span class='job-value job-description'>" + description + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/type.png' /><span class='job-value job-type'>" + job_type + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/schedule.png' /><span class='job-value job-dt'>" + format_dt + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/status.png' /><span class='job-value job-status'>" + stat(status) + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/id.png' /><span class='job-value job-id'>" + job_number + "</span></span><br>" +
                                    Base64.decode(preview) +
                                    "</li>");
                            if (latitude != 0 && longitude != 0) {
                                $('li[job_id=' + id + ']').prepend("<span class='job-title' style='border-bottom:2px solid #eeeeee;margin:5px;'><img src='img/navigate.png' /><span class='job-value job-navigate' style='color:blue;font-weight:bold!important'>" + lang.Mobile054 + "</span></span>");
                            } 
                        } else
                        { //else update
                            $('#main .jobList li[job_id=' + id + ']').attr('name', html_file);
                            $('#main .jobList li[job_id=' + id + ']').attr('job_name', template_name);
							$('#main .jobList li[job_id=' + id + ']').attr('location_desc', description + job_location);
                            $('#main .jobList li[job_id=' + id + ']').attr('job_id', id);
                            $('#main .jobList li[job_id=' + id + ']').attr('job_type_id', job_type_id);
                            $('#main .jobList li[job_id=' + id + ']').attr('job_status', status);
                            $('#main .jobList li[job_id=' + id + ']').attr('latitude', latitude);
                            $('#main .jobList li[job_id=' + id + ']').attr('longitude', longitude);
                            $('#main .jobList li[job_id=' + id + ']').html("<span class='job-title'><img src='img/location.png' /><span class='job-value job-location'>" + job_location + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/job.png' /><span class='job-value job-name'>" + template_name + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/description.png' /><span class='job-value job-description'>" + description + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/type.png' /><span class='job-value job-type'>" + job_type + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/schedule.png' /><span class='job-value job-dt'>" + format_dt + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/status.png' /><span class='job-value job-status'>" + stat(status) + "</span></span><br>" +
                                    "<span class='job-title'><img src='img/id.png' /><span class='job-value job-id'>" + job_number + "</span></span><br>" +
                                    Base64.decode(preview));
                            if (latitude != 0 && longitude != 0 && $('li[job_id=' + id + '] .job-navigate').length == 0) {
                                $('li[job_id=' + id + ']').prepend("<span class='job-title' style='border-bottom:2px solid #eeeeee;margin:5px;'><img src='img/navigate.png' /><span class='job-value job-navigate' style='color:blue;font-weight:bold!important'>" + lang.Mobile054 + "</span></span>");
                            }
                        }
                        if (type == "all")
                        {
                            allJob.push(id);
                            newDownload(html_file, details);

                            if (status == "2")
                            { //if it's scheduled planned job
                                receivedJob.push(id); //push in array for status change to received
                                $('#main .jobList li[job_id=' + id + ']').attr('job_status', '12'); //update status display in advanced
                                console.log('new for id ' + id + ', count = ' + count);
                                $('#main .jobList li[job_id=' + id + '] .job-status').html("<mark style='background-color:#CBA2E4;border-radius:5px;padding:0 10px;color:#FFFFFF;'>New</mark>");
                            }
                            jobsLoaded++;
                            $('#main .jobCount span').html(jobsLoaded);
                        } else if (type == "new")
                        {
                            if (status == "2")
                            {
                                newJob = true;
                                allJob.push(id);
                                newDownload(html_file, details);

                                receivedJob.push(id); //push in array for status change to received
                                $('#main .jobList li[job_id=' + id + ']').attr('job_status', '12'); //update status display in advanced
                                console.log('new for id ' + id + ', count = ' + count);
                                $('#main .jobList li[job_id=' + id + '] .job-status').html("<mark style='background-color:#CBA2E4;border-radius:5px;padding:0 10px;color:#FFFFFF;'>New</mark>");
                                jobsLoaded++;
                                $('#main .jobCount span').html(jobsLoaded);
                            } else if (status == "8" || status == "9" || status == "12" || status == "13") { //ended/handover/received/uploading job that is likely to be a broadcast
                                offset++;
                            }
                            count++;
                        }  
                                         
                        console.log('N Result data ' + id); 
                        
                    }
                    
                    var now = getCurrentDateTime(4);
                    $('#main .lastUpdate span').html(now);  
                    
                    //no more jobs to fetch, proceed to bind list items
                    $('#main .jobList li').off('click');
                    $('#main .jobList li').one('click', function () {
//                        if ($(this).attr('name') != null && $(e.target).attr('class') != "job-value job-navigate") {
//                            goForm($(this).attr('job_id'), $(this).attr('name'), $(this).attr('job_name'), $(this).attr('job_type_id'), $(this).attr('job_status'), false);
//                        }
                        if ($(this).attr('name') != null ) {
                            
                            var timeleft = jobDuration;
                            jobEndedInTime = false ;
                            jobDurationTimer = setInterval(function(){
                                timeleft--;
                                if(timeleft <= 0){
                                        clearInterval(jobDurationTimer);
                                        jobEndedInTime = true ;  
                                }
                            },1000); 
        
                            goForm($(this).attr('job_id'), $(this).attr('name'), $(this).attr('job_name'), $(this).attr('job_type_id'), $(this).attr('job_status'), false);
                        }                        
                    });
                    $('#main .jobList .job-navigate').unbind('click'); //xxx
                    $('#main .jobList .job-navigate').bind('click', function () {
                        var lat = $(this).parent().parent().attr('latitude');
                        var lng = $(this).parent().parent().attr('longitude');
                        if (lat != "0" && lng != "0" && lat != undefined && lng != undefined) {
                            $("#confirmPopup").css({"width": "240px"});
//                                        var staticmap = 'https://maps.googleapis.com/maps/api/staticmap?center=' + lat + ',' + lng + '&zoom=15&size=260x260&maptype=roadmap&markers=color:red%7C' + lat + ',' + lng;
                            var staticmap = 'http://www.v3nity.com:80/V3Nity4/googleapi?type=map&action=static&lat=' + lat + '&lon=' + lng + '&maptype=roadmap&zoom=15&width=260&height=260'; // not using databaseIP cause only V3Nity4 have this new function as of 20 sep
                            confirmPopup(
                                    "<div style='min-width:260px;min-height:260px'><img src='" + staticmap + "' style='max-height:100%;max-width:100%'/></div>"
                                    , function (response) {
                                        rebindMainJobList();
                                        if (response == 2) { //if Yes
                                            if (device.platform == "android" || device.platform == "Android") {
                                                console.log("device platform is " + device.platform);
                                                window.open('google.navigation:q=' + lat + ',' + lng, '_system');
                                            } else {
                                                console.log("device platform is " + device.platform);
                                                window.open('http://maps.google.com/?q=' + lat + ',' + lng, '_system');
                                            }
                                            $("#confirmPopup").css({"width": "initial"});
                                        } else {
                                            //else do nothing	
                                            $("#confirmPopup").css({"width": "initial"});
                                        }
                                    }, lang.Mobile053, ["✔", "➡"]);
                        } else {
                            // navigator.notification.alert('Unable to show map. Location coordinates are not available for this job.',function(){},'Coordinates Unavailable','✔');										
                        }
                    });                    
                    
                    
                    console.log('N Result data successfully loaded ');
                    
                    
                }
            },null);                
            
        }
        
        // 20220222 refresh according to search
        setTimeout(function()
        {
          var inputSearchBox = document.getElementById('inputSearch');
          $('#main .jobList li').each(function()
          {
              if($(this).attr('location_desc').toString().toUpperCase().indexOf(inputSearchBox.value.toString().toUpperCase()) >= 0
                      || $(this).attr('job_name').toString().toUpperCase().indexOf(inputSearchBox.value.toString().toUpperCase()) >= 0)
              {
                  $(this).css("display","list-item");
              }
              else 
              {
                  $(this).css("display","none");
              }
          }); 
        },2000);        
        
    }
    
}


function loadHistoryJob(type) {
    var tuploadQueue = [];
    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
        tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
        uploadCount = tuploadQueue.length;
        $('.uploadCount span').html(uploadCount); //update Upload count	
    } else {
        $('.uploadCount span').html("0"); //update Upload count
    }
    var user_id = window.sessionStorage["userID"];
    var fetch = 10;
    var offset = 0;
    var downloadURL;
    var newJob; //boolean to determine whether there were new jobs loaded
    
    loadHistoryDownload("all");
    newJob = false;
    
    
//    var dateSel = $('#mainSelectedDate').val();
//    console.log("DATESEL: " + dateSel);

    function loadHistoryDownload(type) {
              
        downloadURL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=downloadhistory&fetch=" + fetch + "&offset=" + offset + "&driver=" + user_id + "&mode=2";
        
        console.log("downloadHistoryURL: " + downloadURL);
        
        $.ajax({
            url: downloadURL,
            type: 'GET',
            timeout: 30000,
            success: function (data) 
            {
                if (data.result)
                {
                    // only reset if successfully retrieve
                    if (parseInt(offset,10) == 0)
                    {
                        $('#main .jobList ul').html(''); //clear list
                        $('#main .jobCount span').html('0'); //reset count
                        jobsLoaded = 0;
                        allJob = [];
                    }
        
                    if (data.data.total != 0)
                    {
                        count = 0;   
                        for (count = 0 ; count< data.data.total ; count++){
                            var schedule_dt = data.data.jobs[count].schedule_dt;
                            var format_dt = schedule_dt.slice(0, 4) + "/" + schedule_dt.slice(4, 6) + "/" + schedule_dt.slice(6, 8) + " " + schedule_dt.slice(8, 10) + ":" + schedule_dt.slice(10, 12) + ":" + schedule_dt.slice(12, 14);
                            var id = data.data.jobs[count].id;
                            var job_type_id = data.data.jobs[count].job_type_id;
                            var job_type;
                            if (job_type_id == "1") {
                                job_type = lang.Mobile108;
                            } else if (job_type_id == "2") {
                                job_type = lang.Mobile109;
                            } else if (job_type_id == "3") {
                                job_type = lang.Mobile110;
                            }
                            var job_location = data.data.jobs[count].location;
                            var latitude = data.data.jobs[count].latitude;
                            var longitude = data.data.jobs[count].longitude;
                            var status = data.data.jobs[count].status;
                            var description = data.data.jobs[count].description;
                            var job_number = data.data.jobs[count].job_id;
                            var preview = '';
                            if (data.data.jobs[count].preview != "PGRpdiBjbGFzcz0iam9iLXByZXZpZXciPjwvZGl2Pg==") {
                                preview = data.data.jobs[count].preview;
                            }
                            var template_name = data.data.jobs[count].template_name;
                            var html_file = id + "_" + schedule_dt + "_" + user_id + ".v3";
                            
                            $('#main .jobList ul').append("<li name='" + html_file + "' job_name='" + template_name + "' job_id='" + id + "' job_type_id='" + job_type_id + "' job_status='" + status + "' latitude='" + latitude + "' longitude='" + longitude + "'>" +
                                "<span class='job-title'><img src='img/location.png' /><span class='job-value job-location'>" + job_location + "</span></span><br>" +
                                "<span class='job-title'><img src='img/job.png' /><span class='job-value job-name'>" + template_name + "</span></span><br>" +
                                "<span class='job-title'><img src='img/description.png' /><span class='job-value job-description'>" + description + "</span></span><br>" +
                                "<span class='job-title'><img src='img/type.png' /><span class='job-value job-type'>" + job_type + "</span></span><br>" +
                                "<span class='job-title'><img src='img/schedule.png' /><span class='job-value job-dt'>" + format_dt + "</span></span><br>" +
                                "<span class='job-title'><img src='img/status.png' /><span class='job-value job-status'>" + stat(status) + "</span></span><br>" +
                                "<span class='job-title'><img src='img/id.png' /><span class='job-value job-id'>" + job_number + "</span></span><br>" +
                                Base64.decode(preview) +
                                "</li>");
                            
                            if (latitude != 0 && longitude != 0) {
                                $('li[job_id=' + id + ']').prepend("<span class='job-title' style='border-bottom:2px solid #eeeeee;margin:5px;'><img src='img/navigate.png' /><span class='job-value job-navigate' style='color:blue;font-weight:bold!important'>" + lang.Mobile054 + "</span></span>");
                            } 
                            
                            $('#main .jobList li[job_id=' + id + ']').attr('download_url', data.data.jobs[count].download_url);
                            
                            console.log('DL URL: ' + data.data.jobs[count].download_url)
                           
                            jobsLoaded = jobsLoaded +1;
                            $('#main .jobCount span').html(jobsLoaded);
                        }
                        var now = getCurrentDateTime(4);
                        $('#main .lastUpdate span').html(now);
                       
                        if(jobsLoaded < data.data.overall_total) {
                            offset = offset + fetch;
                            loadHistoryDownload("all");
                        }else{
                            $('#main .jobList li').on('click', function () { 
                                openUrl($(this).attr('download_url'))
//                                window.cordova.InAppBrowser.open($(this).attr('download_url'), '_system', 'location=no','hardwareback=yes');
                            });   
                        }
                       // updateHistoryJob();

                    } else
                    {
                        localStorage.removeItem("localJobList");
                        // $('#main .jobList ul').html('<li style="text-align:center"><br>No Jobs Available</li>');
                        $('#main .jobCount span').html("0");
                        var now = getCurrentDateTime(4);
                        $('#main .lastUpdate span').html(now);
                        // spinOut()
                    }
                } else {
                    // navigator.notification.alert('Failed to load job list. ID does not exist.',function(){},'Loading Failed','✔');
                    // // spinOut()
                    // logout();
                }
            },
            error: function (error, errorText, errorThrown) {
                writeLogs("loadDownload, Error: " + error.code + " errorText: " + errorText + " errorThrown: " + errorThrown);
                //console.log("Error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
            }
        });
        
    }
}

function openUrl( link ) {
	
	//link = "http://www.africau.edu/images/default/sample.pdf";
   // alert(link);
   //var ref = window.open(encodeURI( link), '_system',        'transitionstyle=fliphorizontal');
   //var ref2 = window.open(encodeURI(link), '_blank', 'location=no');
   //var ref3 = window.open(encodeURI(link), '_system', 'location=no');
   
   
   //window.open(encodeURI(link), '_system');
   
   window.open(encodeURI(link), "_system", "location=no,toolbar=no,hardwareback=yes");
	
   
   
}

function updateJob() {
    if ($('#main').is(":visible")) {
        var tuploadQueue = [];
        if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
            tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
            uploadCount = tuploadQueue.length;
            $('.uploadCount span').html(uploadCount); //update Upload count	
        } else {
            $('.uploadCount span').html("0"); //update Upload count
        }
        //do something that loops through each job, get their ID, check and update their statuses 	
        var jobList = [];
        var jobStatus = [];

        for (i = 0; i < $('#main .jobList li').length; i++) {
            jobList.push($('#main .jobList li').eq(i).attr('job_id'));
        }

        if (jobList.length != 0) {
            var checkstatus_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=checkStatus&jobScheduleIds=" + jobList.toString();
            $.ajax({
                url: checkstatus_URL,
                type: 'GET',
                timeout: 30000,
                success: function (data)
                {
                    if (data.result)
                    {
                        console.log("checkstatus success: " + data.arrStatus);
                        jobStatus = data.arrStatus.split(",");
                        var finalJobCount = jobStatus.length;
                        for (i = 0; i < $('#main .jobList li').length; i++) {
                            switch (jobStatus[i]) {
                                case "1": //Unscheduled
                                case "2": //Scheduled
                                case "3": //Approved
                                case "4": //Dispatched
                                case "6": //Arrived
                                case "7": //Started
                                case "12": //Received
                                    // list.jobs[i].status = jobStatus[i]; //update local list
                                    $('#main .jobList li').eq(i).attr('job_status', jobStatus[i]);
                                    $('#main .jobList li').eq(i).find('.job-status').html(stat(jobStatus[i]));
                                    break;
                                case "0": //Deleted	
                                case "8": //Ended
                                case "9": //Handover
                                case "10": //Rejected
                                case "11": //Cancelled
                                    // list.jobs.splice(i,1); //update local list
                                    var html_file = $('#main .jobList li').eq(i).attr('name');
                                    writeLogs("updateJob, jobstatus is 11 = cancelled. Deleting fileName : " + html_file);
                                    resetFormDeleter();
                                    //newDeleteFile(html_file, 0);
                                    //26Sep
//                                    appDirectory.getFile(html_file, {create: false}, function (fileEntry) {
//                                        fileEntry.remove(function () {
//                                            console.log("checkstatus deleted: " + html_file);
//                                        }, function () {
//                                            "checkstatus error: deleting failed.";
//                                        });
//                                    }, function () {
//                                        console.log('checkstatus: file does not exist');
//                                    });
                                    $('#main .jobList li').eq(i).remove();
                                    finalJobCount = finalJobCount - 1;
                                    break;
                                case "5": //Acknowledged (means Broadcast Job) // JX : not sure if this will cause error as ajax is callback and the html_file might be replaced? need to test. 
                                    var job_id = $('#main .jobList li').eq(i).attr('job_id');
                                    var html_file = $('#main .jobList li').eq(i).attr('name');
                                    var checkstatus_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=checkStatus&jobScheduleIds=" + job_id;
                                    $.ajax({
                                        url: checkstatus_URL,
                                        type: 'GET',
                                        timeout: 30000,
                                        success: function (data) {
                                            if (data.result) {
                                                console.log("checkstatus success: " + data.arrDriverId);
                                                var job_status = data.arrStatus;
                                                var driver_id = data.arrDriverId;
                                                var user_id = window.sessionStorage["userID"];
                                                if (driver_id == user_id) {
                                                    $('#main .jobList li[job_id=' + job_id + ']').attr('job_status', '5');
                                                    $('#main .jobList li[job_id=' + job_id + ']').find('.job-status').html("<mark style='background-color:#FFBC00;border-radius:5px;padding:0 10px;color:#FFFFFF;'>Accepted</mark>");
                                                } else { //broadcast taken by someone else
                                                    writeLogs("updateJob, jobstatus is 5 = Accepted. Deleting fileName : " + html_file);
                                                    resetFormDeleter();
                                                    //newDeleteFile(html_file, 0);
                                                    $('#main .jobList li[job_id=' + job_id + ']').remove();
                                                    finalJobCount = finalJobCount - 1;
                                                }
                                            } else {
                                                spinOut();
                                                if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                                            }
                                        },
                                        error: function (error, errorText, errorThrown) {
                                            spinOut();
                                            writeLogs("updateJob, checkstatus error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
                                            //console.log("checkstatus error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                                        }
                                    });
                                    break;
                                case "13": //Uploading
                                    // list.jobs.splice(i,1); //update local list
                                    $('#main .jobList li').eq(i).remove();
                                    finalJobCount = finalJobCount - 1;
                                    // var html_file = $('#main .jobList li').eq(i).attr('name');
                                    // queueJob(html_file)
                                    break;
                                default:
                                    break;
                            }
                            jobList.push($('#main .jobList li').eq(i).attr('job_id'));
                        }
                        var now = getCurrentDateTime(4);
                        $('#main .lastUpdate span').html(now);
                        setTimeout(function () {
                            $('.jobCount span').html(finalJobCount); //update Job count
                        }, 200);
                    }
                },
                error: function (error, errorText, errorThrown) {
                    writeLogs("updateJob, checkstatus error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
                    //console.log("checkstatus error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                }
            });
        } else {
            var now = getCurrentDateTime(4);
            $('#main .lastUpdate span').html(now);
            $('.jobCount span').html('0');
        }
    } else {
        console.log("checkstatus: user is not on job list.")
    }
}


var isInForm = false;

function goForm(job_id, html_file, job_name, job_type_id, job_status) {
    
    console.log("isInForm value " + isInForm);
    
    if (isInForm === true)
    {
        console.log("CHX20201030 ALREADY IN FORM!! dont continue")
        return;
    }
	
	$("#inputSearch").val('');
    
    isInForm = true;
    
    
    var access = checkBeaconJob(job_id);
    
    
    if (access) 
    {
        spinIn();
        window.sessionStorage["selected_id"] = job_id;
        window.sessionStorage["selected_file"] = html_file;
        window.sessionStorage["selected_name"] = job_name;
        var checkstatus_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=checkStatus&jobScheduleIds=" + job_id;
        $.ajax({
            url: checkstatus_URL,
            type: 'GET',
            timeout: 15000,
            success: function (data) {
                if (data.result) {
                    console.log("checkstatus success, status = " + data.arrStatus + " driverId = " + data.arrDriverId);
                    job_status = data.arrStatus;
                    var driver_id = data.arrDriverId;
                    var user_id = window.sessionStorage["userID"];
                    if (job_type_id == "1" || job_type_id == "3") { //if planned job or adhoc job
                        if (job_status != "0") {
                            spinOut();
                            startJob();
                            writeLogs("Starting Job Id : " + job_id + " Job Type : " + job_type_id);
                        } else {
                            spinOut();
                            navigator.notification.alert(lang.Mobile056, function () {
                            }, lang.Mobile055, '✔');
                            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                        }
                    } else if (job_type_id == "2") { //if broadcast job
                        if (job_status == "12") { //if broadcast job is a new job that has not been accepted
                            spinOut();
                            startJob();
                            writeLogs("Starting Job Id : " + job_id + "Job Type : " + job_type_id);
                        } else if (job_status == "5" && driver_id == user_id) { //if broadcast job has been accepted and job belongs to this driver
                            spinOut();
                            startJob();
                            writeLogs("Starting Job Id : " + job_id + "Job Type : " + job_type_id);
                        } else if (job_status == "7" && driver_id == user_id) { //if broadcast job has started and job belongs to this driver
                            spinOut();
                            startJob();
                            writeLogs("Starting Job Id : " + job_id + "Job Type : " + job_type_id);
                        } else { //else broadcast job has been taken
                            spinOut();
                            navigator.notification.alert(lang.Mobile057, function () {
                            }, lang.Mobile055, '✔');
                            resetFormDeleter();
                            //newDeleteFile(html_file, 0);
                            //26Sep - DONE
                            appDirectory.getFile(html_file, {create: false}, function (fileEntry) {
                                fileEntry.remove(function () {
                                    //console.log("checkstatus deleted: " + html_file);
                                }, function () {
                                    writeLogs("checkstatus error: deleting failed.");
                                    //console.log("checkstatus error: deleting failed.");
                                });
                            }, function () {
                                console.log('checkstatus: file does not exist');
                            });
                            //26Sep - DONE
                            $('#main .jobList li[job_id=' + job_id + ']').remove();
                            finalJobCount = parseInt($('.jobCount span').html()) - 1;
                            $('.jobCount span').html(finalJobCount);
                            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                        }
                    }
                } else {
                    spinOut();
                    navigator.notification.alert(lang.Mobile056, function () {
                    }, lang.Mobile055, '✔');
                    if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                }
            },
            error: function (error, errorText, errorThrown) {
                spinOut();
                rebindMainJobList();
                
                writeLogs("Error Check Job Status for Job Id : " + job_id + "Job Type : " + job_type_id + "\n Error response" + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
                acceptWithoutNetwork();
//                navigator.notification.alert(lang.Mobile068, function () {
//                }, lang.Mobile055, '✔');
            }
        });
    } 
    else 
    {
        navigator.notification.alert('Please move nearer to beacon', function () {
        }, 'Alert', '✔');
        isInForm = false;
    }
    
    
    // CHX 20190807 allow attend job without signal
    function acceptWithoutNetwork()
    {
        spinIn();

        if (job_type_id == "1" || job_type_id == "3") 
        { //if planned job or adhoc job
            if (job_status != "0") 
            {
                spinOut();
                startJob();
                writeLogs("Starting Job Id : " + job_id + " Job Type : " + job_type_id);
            } 
            else 
            {
                spinOut();
                navigator.notification.alert(lang.Mobile056, function () {
                }, lang.Mobile055, '✔');
                console.log('Find auto refresh 1 '  );
                if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
            }
        } 
        else if (job_type_id == "2") 
        { //if broadcast job
            spinOut();
            navigator.notification.alert(lang.Mobile068, function () {
                }, lang.Mobile055, '✔');
        }
    }



    function startJob() 
    {
        if (job_type_id == "1" && job_status != "12" && job_status != "2") { //job is a planned and is not received or scheduled
            spinIn();
            window.clearInterval(jobInterval);
            $.mobile.changePage("#form", {transition: "fade"});
            $('#form [data-role=header] h1').html(job_name);
            $('#form [data-role=header] h1').css("margin", "0 auto"); //yy
            resetFormOpener();
            openDividedForm(html_file);
        } else if (job_type_id == "2" && job_status != "5" && job_status != "12") { //job is a broadcast and is not accepted or received
            spinIn();
            window.clearInterval(jobInterval);
            $.mobile.changePage("#form", {transition: "fade"});
            $('#form [data-role=header] h1').html(job_name);
            $('#form [data-role=header] h1').css("margin", "0 auto"); //yy
            resetFormOpener();
            openDividedForm(html_file);
        } else if (job_type_id == "3" && job_status != "12") { //job is an adhoc and is acknowledged or is ongoing
            spinIn();
            window.clearInterval(jobInterval);
            $.mobile.changePage("#form", {transition: "fade"});
            $('#form [data-role=header] h1').html(job_name);
            $('#form [data-role=header] h1').css("margin", "0 auto"); //yy
            resetFormOpener();
            openDividedForm(html_file);
        } else if (job_type_id == "1" && (job_status == "12" || job_status == "2")) { //job is a planned but yet to start
            console.log("A16");
            navigator.notification.confirm(
                    lang.Mobile059,
                    confirmStartPlanned,
                    lang.Mobile058,
                    ["✘", "✔"]
                    );
        } else if (job_type_id == "2" && job_status == "12") { //job is a new broadcast but yet to be accepted
            console.log("A17");
            rebindMainJobList();
            isInForm = false;
            navigator.notification.confirm(
                    lang.Mobile061,
                    confirmAcceptBroadcast,
                    lang.Mobile060,
                    ["✘", "✔"]
                    );
        } else if (job_type_id == "2" && job_status == "5") { //job is a accepted broadcast but yet to start
            navigator.notification.confirm(
                    lang.Mobile063,
                    confirmStartPlanned,
                    lang.Mobile062,
                    ["✘", "✔"]
                    );
        } else if (job_type_id == "3" && job_status == "12") { //job is an adhoc but yet to start
            console.log("A18");
            navigator.notification.confirm(
                    lang.Mobile065,
                    confirmStartPlanned,
                    lang.Mobile064,
                    ["✘", "✔"]
                    );
        }
    }
}

function confirmStartPlanned(response) 
{
    if (response == 2) 
    { //if Yes
        
        // this is the trigger for capturing lon-lat when starting job
        if (captureStartEndLocation)
        {
            isStartJob = true;
        }
        
        var startedStatus = "7";
        var job_id = window.sessionStorage["selected_id"];
        var html_file = window.sessionStorage["selected_file"];
        var job_name = window.sessionStorage["selected_name"];

        var now = new Date();
        var now = two(now.getDate()) + two(now.getMonth() + 1) + now.getFullYear() + two(now.getHours()) + two(now.getMinutes()) + two(now.getSeconds());

        spinIn();
        var asset_id = window.sessionStorage["assetId"];
        var statuschange_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=statusChange&jobScheduleIds=" + job_id
                + "&statusId=" + startedStatus + "&dateTime=" + now + "&assetId=" + asset_id;
        
        $.ajax({
            url: statuschange_URL,
            type: 'GET',
            timeout: 30000,
            success: function (data) 
            {
                if (data.result) 
                {
                    writeLogs("statusChange success: Started " + job_id + " status = " + startedStatus + " FileName " + html_file);
                    //console.log("statuschange success: Started " + job_id);
                    window.clearInterval(jobInterval);
                    $.mobile.changePage("#form", {transition: "fade"});
                    $('#form [data-role=header] h1').html(job_name);
                    resetFormOpener();
                    openDividedForm(html_file);
                    getCurrentLocationNew(7,job_id);
                    //26Sep
                } 
                else 
                {
                    writeLogs("confirmStartPlanned,statuschange fail: result return fail, text:" + data.text)
                    //console.log("statuschange fail: result return fail, text:" + data.text);
                    navigator.notification.alert(lang.Mobile067, function () {
                    }, lang.Mobile066, '✔');
                    spinOut();
                }
            },
            error: function (error, errorText, errorThrown) {
                spinOut();
                writeLogs("confirmStartPlanned, statuschange error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown)
                //console.log("statuschange error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
//                navigator.notification.alert(lang.Mobile068, function () {
//                }, lang.Mobile066, '✔');
                newPendingStatus(job_id, startedStatus, now, '', asset_id);
                startPlannedWithoutNetwork(job_name, html_file, job_id);
                
            }
        });
    } 
    else 
    {
        rebindMainJobList();
        isInForm = false;
    }
}

function startPlannedWithoutNetwork(job_name, html_file, job_id)
{
    //console.log("statuschange success: Started " + job_id);
    window.clearInterval(jobInterval);
    $.mobile.changePage("#form", {transition: "fade"});
    $('#form [data-role=header] h1').html(job_name);
    resetFormOpener();
    openDividedForm(html_file);
    getCurrentLocationNew(7,job_id);
}

function confirmAcceptBroadcast(response) {
    if (response == 2) { //if Yes
        var job_id = window.sessionStorage["selected_id"];
        var html_file = window.sessionStorage["selected_file"];
        var job_name = window.sessionStorage["selected_name"];
        var user_id = window.sessionStorage["userID"];
        spinIn();
        var acceptbroadcastjob_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=acceptbroadcastjob&scheduleId=" + job_id + "&driver=" + user_id;
        $.ajax({
            url: acceptbroadcastjob_URL,
            type: 'GET',
            timeout: 30000,
            success: function (data) {
                writeLogs("confirmAcceptBroadcast, data.result " + data.result + " data.broadCastAcknowledge " + data.broadCastAcknowledge);
                if (data.result) {
                    if (data.broadCastAcknowledge == "1") {
                        console.log("acceptbroadcastjob success: Accepted " + job_id);
                        navigator.notification.alert(lang.Mobile070, function () {
                        }, lang.Mobile069, '✔');
                        spinOut();
                        getCurrentLocationNew(7,job_id);
                        if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                    } else {
                        navigator.notification.alert(lang.Mobile072, function () {
                        }, lang.Mobile071, '✔');
                        spinOut();
                        if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                    }
                } else {
                    console.log("acceptbroadcastjob fail: result return fail, text:" + data.text);
                    console.log(acceptbroadcastjob_URL);
                    navigator.notification.alert(lang.Mobile073, function () {
                    }, lang.Mobile071, '✔');
                    spinOut();
                }
            },
            error: function (error, errorText, errorThrown) {
                console.log("acceptbroadcastjob error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
                navigator.notification.alert(lang.Mobile068, function () {
                }, lang.Mobile071, '✔');
                spinOut();
            }
        });
    } else {
        rebindMainJobList();
        isInForm = false;
    }
}

function confirmBackForm(response) {
    if (response == 2) { //if OK     
        sessionStorage.removeItem('selected_id');
        sessionStorage.removeItem('selected_file');
        sessionStorage.removeItem('selected_name');
//        sessionStorage.removeItem('beacon_id');
        spinIn();
        
        clearTimeout(jobDurationTimer);
        jobEndedInTime = true;
        
        clearTimeout(otptimerId);
        setTimeout(function () {
            $.mobile.changePage("#main", {transition: 'fade', reverse: 'true'});
            window.clearInterval(jobInterval);
            jobInterval = window.setInterval(function () {
                if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
            }, refreshRate);
            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
            spinOut();
        }, 0);
    } //else do nothing
}



function confirmSubmit(response) {
    if (response == 2) 
    { //if Yes
        if(jobEndedInTime){

            $('.ratingsSummary').attr("value", ratingsSummary()[1]);

            if (mobileCompulsoryEndCoordinate)
            {
                spinInLocation();

                var geoOptions = {enableHighAccuracy: true, timeout: 10000};
                navigator.geolocation.getCurrentPosition(function (position)
                {
                    spinOut();
                    $('.form-sheet').attr("end-lat", position.coords.latitude);
                    $('.form-sheet').attr("end-lon", position.coords.longitude);
                    newSubmitForm(window.sessionStorage["selected_file"]);
                }, function (error) {
                    geolocFail();
                }, geoOptions);

                function geolocFail() 
                {
                    var geoOptions = {enableHighAccuracy: false, timeout: 10000};
                    navigator.geolocation.getCurrentPosition(function (position)
                    {
                        spinOut();
                        $('.form-sheet').attr("end-lat", position.coords.latitude);
                        $('.form-sheet').attr("end-lon", position.coords.longitude);
                        newSubmitForm(window.sessionStorage["selected_file"]);
                    }, function (error) {
                        spinOut();
                        navigator.notification.alert('Unable to submit, please try again.', function () {
                        }, 'Location Not Captured', '✔');                   
                    }, geoOptions);
                }
            }
            else
            {
                newSubmitForm(window.sessionStorage["selected_file"]);
            }            
            
        }else {
            
            navigator.notification.alert('Time is not up yet.', function () {
                        }, 'Submission not allowed', '✔');  
            
        }
        
       
        //26Sep
//        submitForm(window.sessionStorage["selected_file"]);
    } else {
        //else do nothing	
    }
}



function encodeUnicode(theString) {
    var unicodeString = '';
    for (var i = 0; i < theString.length; i++) {
        var theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();
        while (theUnicode.length < 4) {
            theUnicode = '0' + theUnicode;
        }
        theUnicode = '\\u' + theUnicode;
        unicodeString += theUnicode;
    }

    encodeString = window.btoa(unicodeString)
    return encodeString;
}


function takephoto(backupGallery) {
    var first = $picPointer.length - 1;
//    var options = {};
//    var networksArray = [];

//    cordova.plugins.backgroundMode.disable();

//    console.log('TFF1 ' + backupGallery);

    navigator.camera.getPicture(function (fileURI) {
        $picPointer.eq(first).attr("data-latitude", "0");
        $picPointer.eq(first).attr("data-longitude", "0");
        $picPointer.eq(first).attr("data-block-unit", "0");
        $picPointer.eq(first).attr("data-block-level", "0");
        $picPointer.eq(first).attr("data-location-name", "0");
        $picPointer.eq(first).attr("data-ver", "403");
		$picPointer.eq(first).attr("data-title", "");
        
        var hideImgDate = $picPointer.eq(first).parent().parent().attr("data-hideimagedate");

        if (typeof hideImgDate == 'undefined') { // if cannot find attr data-hideimagedate, display both date and time by default
            var now = getCurrentDateTime(1);
        } else {

            if (($picPointer.eq(first).parent().parent().attr("data-hideimagedate") == "true") && ($picPointer.eq(first).parent().parent().attr("data-hideimagetime") == "true")) { // hide both date and time
                var now = "";
            } else if (($picPointer.eq(first).parent().parent().attr("data-hideimagedate") == "true") && ($picPointer.eq(first).parent().parent().attr("data-hideimagetime") == "false")) { // hide date display time
                var now = getCurrentDateTime(2);
            } else if (($picPointer.eq(first).parent().parent().attr("data-hideimagedate") == "false") && ($picPointer.eq(first).parent().parent().attr("data-hideimagetime") == "true")) { // display date hide time
                var now = getCurrentDateTime(3);
            } else { // display both
                var now = getCurrentDateTime(1);
            }
        }
        $picPointer.eq(first).attr("data-timestamp", now);

        spinInPhoto(); // this is to prevent them from touch anything while photo is processing.
        var spinTimeout = setTimeout(function () {
            $picPointer.eq($picPointer.length - 1).remove();
            spinOut();
            navigator.notification.alert("Try going outdoor or near a window, and take photo again.", function () {
            }, "Unable to Capture Your Location", '✔');	            
        }, 25000); // incase it never spin out and hang there.

        if ($picPointer.eq(first).parent().parent().attr("data-geotag") == "false") 
        {
            console.log("Geotag is false.");
            $picPointer.eq(first).attr("data-latitude", "0");
            $picPointer.eq(first).attr("data-longitude", "0");
            $picPointer.eq(first).attr("data-location-name", "");
            $picPointer.on({'click': function () {
                    if ($picPointer.attr('src') != "") {
                        $photoPreviewPointer = $(this);
                        photoPreview($(this).attr('src'), $(this).attr('data-latitude'), $(this).attr('data-longitude'), $(this).attr('data-block-unit'), $(this).attr('data-block-level'), $(this).attr('data-location-name'), $(this).attr('data-title'));
                    }
                }});
            textWatermark(fileURI, "", now, function (base64Img) { //watermark photo with timestamp
                $picPointer.eq(first).css('background-color', 'black');
                $picPointer.eq(first).attr('src', base64Img);
                spinOut();
                if (backupGallery) {
                    saveProcessedImage(base64Img);
                }
                if (typeof spinTimeout !== "undefined") {
                    clearTimeout(spinTimeout);
                }
                writeLogs("Camera Photo Successfully Loaded w/o GeoTag. PhotoBackup = " + backupGallery);
            }, null);
        } 
        else
        {
            $picPointer.on({'click' : function () {
                if ($picPointer.attr('src') != "") {
                    $photoPreviewPointer = $(this);
                    photoPreview($(this).attr('src'), $(this).attr('data-latitude'), $(this).attr('data-longitude'), $(this).attr('data-block-unit'), $(this).attr('data-block-level'), $(this).attr('data-location-name'), $(this).attr('data-title'));
                }
            } });
        
            console.log('GPS1 ' );
        
            var geoOptions = {enableHighAccuracy: true, maximumAge: 0, timeout: 25000};
            navigator.geolocation.getCurrentPosition(function (position) //add latlng attribute
            {
                //if ($picPointer.eq(first).attr('src') == "img/loading.png") {
//                    clearTimeout(photolocation_timeout);
                    console.log('GPS2 ' );
                    console.log("Get Photo LongLat success: latitude:" + position.coords.latitude + ", longtitude:" + position.coords.longitude);
                    $picPointer.eq(first).attr("data-latitude", position.coords.latitude);
                    $picPointer.eq(first).attr("data-longitude", position.coords.longitude);
                    $picPointer.eq(first).attr("data-location-name", "Location coordinates: " + position.coords.latitude + " , " + position.coords.longitude );
                    
                    var latN = position.coords.latitude.toString();
                    var latP = latN.split('.');
                    var laA = latP[0];
                    var laB = latP[1];
                    laB= laB.substring(0, 4);

                    var lonN = position.coords.longitude.toString();
                    var lonP = lonN.split('.');
                    var loA = lonP[0];
                    var loB = lonP[1];
                    loB= loB.substring(0, 4);

                    var LatName = laA + "." + laB;
                    var LonName = loA + "." + loB;                    
                    
                    var locURL = databaseIP + "googleapi?type=geocode&action=reverse&lon=" + LonName + "&lat=" + LatName ;
                    console.log('GPS3 ' );
                    
                    $.ajax({
                        url: locURL,
                        type: 'GET',
                        timeout: 40000,
                        success: function (data) {
                           if (data.results != undefined) {
                               console.log('GPS5 ' );
                               if(data.results.length > 0){
                                  if(data.results[0].formatted_address.length != 0) {
                                    $picPointer.eq(first).attr("data-location-name", "Location: " + data.results[0].formatted_address);
                                  } 
                               }else if(data.plus_code.compound_code.length != 0){
                                   $picPointer.eq(first).attr("data-location-name", "Location: " + data.plus_code.compound_code.split(' ').slice(1).join(' '));
                               }
                           }
                        },
                        error: function (error, errorText, errorThrown) { 
                            console.log('GPS4 ' );
                            if ($picPointer.eq(first).attr('src') == "img/loading.png") {                            
                                navigator.notification.alert("Please try again for GPS location capture.", function () {
                                }, "Unable to Capture GPS", '✔');	
                                spinOut();
                            }
                        }
                    });
                    
                    $picPointer.on({'click' : function () {
                            if ($picPointer.attr('src') != "") {
                                $photoPreviewPointer = $(this);
                                photoPreview($(this).attr('src'), $(this).attr('data-latitude'), $(this).attr('data-longitude'), $(this).attr('data-block-unit'), $(this).attr('data-block-level'), $(this).attr('data-location-name'), $(this).attr('data-title'));
                            }
                    } });
//                    var staticmap = 'https://maps.googleapis.com/maps/api/staticmap?center=' + position.coords.latitude + ',' + position.coords.longitude + '&zoom=18&size=400x400&maptype=roadmap&markers=color:red%7C' + position.coords.latitude + ',' + position.coords.longitude;
//                    var staticmap = 'http://www.v3nity.com:80/V3Nity4/googleapi?type=map&action=static&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&maptype=roadmap&zoom=18&width=800&height=800';
                    var staticmap = 'http://www.v3nity.com:80/V3Nity4/googleapi?type=map&action=static&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&maptype=roadmap&zoom=18'
                            + '&width=' + window.sessionStorage["imgDimension"]
                            + '&height=' + window.sessionStorage["imgDimension"];
                    textWatermark(fileURI, staticmap, now, function (base64Img) { //watermark photo with timestamp
                        $picPointer.eq(first).css('background-color', 'black');
                        $picPointer.eq(first).attr('src', base64Img);
                        spinOut();
                        if (backupGallery) {
                            saveProcessedImage(base64Img);
                        }
                        if (typeof spinTimeout !== "undefined") {
                            clearTimeout(spinTimeout);
                        }
                        writeLogs("Camera Photo Successfully Loaded w GeoTag. PhotoBackup = " + backupGallery);
                    }, geoOptions);
                //}
            }, function (error) {
                console.log('GPS6 ' );
                console.log("Get Photo LongLat Failed");
                navigator.notification.alert("Photo is saved without geotag. Please ensure you have enabled location info.", function () {
                }, "Unable to Capture GPS", '✔');
                $picPointer.eq(first).attr("data-latitude", "0");
                $picPointer.eq(first).attr("data-longitude", "0");
                $picPointer.eq(first).attr("data-location-name", "");
                $picPointer.on({'click': function () {
                        if ($picPointer.attr('src') != "") {
                            $photoPreviewPointer = $(this);
                            photoPreview($(this).attr('src'), $(this).attr('data-latitude'), $(this).attr('data-longitude'), $(this).attr('data-block-unit'), $(this).attr('data-block-level'), $(this).attr('data-location-name'), $(this).attr('data-title'));
                        }
                    }});
                textWatermark(fileURI, "", now, function (base64Img) { //watermark photo without timestamp
                    $picPointer.eq(first).css('background-color', 'black');
                    $picPointer.eq(first).attr('src', base64Img);
                    spinOut();
                    if (backupGallery) {
                        saveProcessedImage(base64Img);
                    }
                    if (typeof spinTimeout !== "undefined") {
                        clearTimeout(spinTimeout);
                    }
                    writeLogs("Camera Photo Successfully Loaded w/o GeoTag Failed. PhotoBackup = " + backupGallery + " Error for getCurrentPosition : " + error.code + " error message " + error.message);
                }, geoOptions);
            }, geoOptions);
        } // end of else, end of successhandler
        
        // reenable backgroundmode
//        cordova.plugins.backgroundMode.enable();
        
    }, onPhotoFail, {
        correctOrientation: true,
        saveToPhotoAlbum: false,
        quality: window.sessionStorage["imgQuality"],
        targetWidth: window.sessionStorage["imgDimension"],
        targetHeight: window.sessionStorage["imgDimension"],
        sourceType: pictureSource.CAMERA,
        destinationType: destinationType.FILE_URI
    });
}


function onPhotoFail(message) {
    spinOut();
    $picPointer.eq($picPointer.length - 1).remove();
    writeLogs("Camera Take Photo Cancelled / Failed : " + message);
    
    // reenable backgroundmode
//    cordova.plugins.backgroundMode.enable();
}


function takeGeotagphoto(backupGallery) {
    var first = $picPointer.length - 1;

    $picPointer.eq(first).attr("data-latitude", "0");
    $picPointer.eq(first).attr("data-longitude", "0");
    $picPointer.eq(first).attr("data-location-name", "0");

    var hideImgDate = $picPointer.eq(first).parent().parent().attr("data-hideimagedate");

    if (typeof hideImgDate == 'undefined') { // if cannot find attr data-hideimagedate, display both date and time by default
        var now = getCurrentDateTime(1);
    } else {

        if (($picPointer.eq(first).parent().parent().attr("data-hideimagedate") == "true") && ($picPointer.eq(first).parent().parent().attr("data-hideimagetime") == "true")) { // hide both date and time
            var now = "";
        } else if (($picPointer.eq(first).parent().parent().attr("data-hideimagedate") == "true") && ($picPointer.eq(first).parent().parent().attr("data-hideimagetime") == "false")) { // hide date display time
            var now = getCurrentDateTime(2);
        } else if (($picPointer.eq(first).parent().parent().attr("data-hideimagedate") == "false") && ($picPointer.eq(first).parent().parent().attr("data-hideimagetime") == "true")) { // display date hide time
            var now = getCurrentDateTime(3);
        } else { // display both
            var now = getCurrentDateTime(1);
        }
    }
    $picPointer.eq(first).attr("data-timestamp", now);
      
    var geoOptions = {enableHighAccuracy: true, timeout: 25000};
    navigator.geolocation.getCurrentPosition(function (position) //add latlng attribute
    {
        if ($picPointer.eq(first).attr('src') == "img/loading.png") {
            console.log("Get Photo LongLat success: latitude:" + position.coords.latitude + ", longtitude:" + position.coords.longitude);
            $picPointer.eq(first).attr("data-latitude", position.coords.latitude);
            $picPointer.eq(first).attr("data-longitude", position.coords.longitude);
            $picPointer.eq(first).attr("data-location-name", "Location coordinates: " + position.coords.latitude + " , " + position.coords.longitude );

            var latN = position.coords.latitude.toString();
            var latP = latN.split('.');
            var laA = latP[0];
            var laB = latP[1];
            laB= laB.substring(0, 4);

            var lonN = position.coords.longitude.toString();
            var lonP = lonN.split('.');
            var loA = lonP[0];
            var loB = lonP[1];
            loB= loB.substring(0, 4);

            var LatName = laA + "." + laB;
            var LonName = loA + "." + loB;                    
//ORIGINAL BY BRAJENDRA
//            var locURL = databaseIP + "googleapi?type=geocode&action=reverse&lon=" + LonName + "&lat=" + LatName ;
//              $.ajax({
//                url: locURL,
//                type: 'GET',
//                timeout: 15000,
//                success: function (data) {
//                   if (data.results != undefined) {
//                       if(data.results[0].formatted_address.length != 0) {
//                           $picPointer.eq(first).attr("data-location-name", "Location: " + data.results[0].formatted_address);
//                       }
//                   }
//                },
//                error: function (error, errorText, errorThrown) { 
//                }
//            });                     

            $picPointer.on({'click' : function () {
                    if ($picPointer.attr('src') != "") {
                        $photoPreviewPointer = $(this);
                        photoPreview($(this).attr('src'), $(this).attr('data-latitude'), $(this).attr('data-longitude'), $(this).attr('data-block-unit'), $(this).attr('data-block-level'), $(this).attr('data-location-name'), $(this).attr('data-title'));
                    }
            } });
//ORIGINAL BY BRAJENDRA
//            var staticmap = 'http://www.v3nity.com:80/V3Nity4/googleapi?type=map&action=static&lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&maptype=roadmap&zoom=18'
//                    + '&width=' + window.sessionStorage["imgDimension"]
//                    + '&height=' + window.sessionStorage["imgDimension"];
//
//            textGeotagWatermark(staticmap, now, function (base64Img) { //watermark photo with timestamp
//                $picPointer.eq(first).css('background-color', 'black');
//                $picPointer.eq(first).attr('src', base64Img);
//            }, function (error){ alert('error!')},geoOptions);
            $picPointer.eq(first).attr('src', 'img/accept.png');
        }
    }, function (error) {
        console.log("Get Geotag LongLat Failed");
        navigator.notification.alert("Unable to capture location. Please ensure you have enabled location info.", function () {
        }, "Unable to Capture GPS", '✔');
        $picPointer.eq(first).attr("data-latitude", "0");
        $picPointer.eq(first).attr("data-longitude", "0");
        $picPointer.eq(first).attr("data-location-name", "");
        spinOut();
   
    }, geoOptions);
    
}

function attachImg() 
{  

    window.imagePicker.getPictures(
    function (results) 
    {
        if (results.length < 1) { //remove the loading.png if no image selected
            $picPointer.eq($picPointer.length - 1).remove();
        }
        $picPo = $picPointer.parent().find('img');
        var first = $picPo.length - 1;
        var hideImgDate = $picPointer.eq(first).parent().parent().attr("data-hideimagedate");

        for (var i = 0; i < results.length; i++) 
        {

            var geoOptions = {enableHighAccuracy: true, timeout: 25000};

            if (typeof hideImgDate == 'undefined') 
            { // if cannot find attr data-hideimagedate, display both date and time by default
                var now = getCurrentDateTime(1);
            } 
            else 
            {

                if (($picPointer.eq(first).parent().parent().attr("data-hideimagedate") == "true") && ($picPointer.eq(first).parent().parent().attr("data-hideimagetime") == "true")) { // hide both date and time
                    var now = "";
                } else if (($picPointer.eq(first).parent().parent().attr("data-hideimagedate") == "true") && ($picPointer.eq(first).parent().parent().attr("data-hideimagetime") == "false")) { // hide date display time
                    var now = getCurrentDateTime(2);
                } else if (($picPointer.eq(first).parent().parent().attr("data-hideimagedate") == "false") && ($picPointer.eq(first).parent().parent().attr("data-hideimagetime") == "true")) { // display date hide time
                    var now = getCurrentDateTime(3);
                } else { // display both
                    var now = getCurrentDateTime(1);
                }
            }

            if (i > 0) {
                (function (url) {
                    textWatermark(url, "", "", function (base64Img) { //watermark image with timestamp, still got issue with the index 
                        var img = $('<img/>', {src: base64Img}).insertAfter($picPointer.parent().find('img').last());
//                        if (noOfImg > 0) {
//                            var img = $('<img/>', {src:base64Img}).insertAfter($picPointer.parent().find('img').last());
//                        } else {
//                            var img = $('<img/>', {src:base64Img}).insertBefore($picPointer.parent().find('input'));
//                        }
                        img.css('background-color', 'black');
                        img.attr("data-latitude", "0");
                        img.attr("data-longitude", "0");
                        img.attr("data-block-unit", "0");
                        img.attr("data-block-level", "0");
                        img.attr("data-timestamp", now);
                        img.attr("data-title", "");
                        img.on('click', function () {
                            if (img.attr('src') != "") {
                                $photoPreviewPointer = $(this);
                                photoPreview($(this).attr('src'), 0, 0, 0, 0,'',$(this).attr('data-title'));
                            }
                        });
                    }, geoOptions);
                })(results[i]);
            } else {
                $picPointer.eq(first).attr("data-latitude", "0");
                $picPointer.eq(first).attr("data-longitude", "0");
                $picPointer.eq(first).attr("data-block-unit", "0");
                $picPointer.eq(first).attr("data-block-level", "0");
                $picPointer.eq(first).attr("data-location-name", "");
                $picPointer.eq(first).attr("data-timestamp", now);
                $picPointer.eq(first).attr("data-title", "");
                textWatermark(results[i], "", "", function (base64Img) { //watermark image with timestamp
                    $picPointer.eq(first).css('background-color', 'black');
                    $picPointer.eq(first).attr('src', base64Img);
                    $picPointer.on({'click': function () {
                            if ($picPointer.attr('src') != "") {
                                $photoPreviewPointer = $(this);
                                photoPreview($(this).attr('src'), $(this).attr('data-latitude'), $(this).attr('data-longitude'), $(this).attr('data-block-unit'), $(this).attr('data-block-level'), $(this).attr('data-location-name'),$(this).attr('data-title'));
                            }
                        }});
                }, geoOptions);
            }
        }
    }, 
    function (error) 
    {
        navigator.notification.alert("Please try again, or try with other images.", function () {
                }, "Unable to Attach Image", '✔');
        $picPointer.eq($picPointer.length - 1).remove();
        console.log('Error: ' + error);
    }, 
    {
        maximumImagesCount: $dataMax,
        quality: window.localStorage['galleryQuality'],
        height: window.localStorage['galleryHeight'],
        width: window.localStorage['galleryWidth']            
    });        
           
}

function getFileContentAsBase64(path,callback){
    window.resolveLocalFileSystemURL(path, gotFile, fail);
            
    function fail(e) {
          alert('Cannot found requested file');
    }

    function gotFile(fileEntry) {
           fileEntry.file(function(file) {
              var reader = new FileReader();
              reader.onloadend = function(e) {
                   var content = this.result;
                   callback(content);
              };
              // The most important point, use the readAsDatURL Method from the file plugin
              reader.readAsDataURL(file);
           });
    }
}


/**
 * Convert an image 
 * to a base64 url
 * then add text watermark
 * @param  {String}   url 
 * @param  {String}   url2 //used for 400x400px static map 
 * @param  {String}   text         
 * @param  {Function} callback    
 * @param  {String}   [outputFormat=image/png]           
 */
function textWatermark(url, url2, text, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        var canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'), dataURL;
        if (url2 == "") {
            canvas.height = this.height;
            canvas.width = this.width;
            canvas.border = '1px solid black';
        } else {
            canvas.height = this.height; //400px is the height of static map
            canvas.width = this.width + parseInt(window.sessionStorage["imgDimension"], 10); //400px is the width of static map
//            console.log('%%%width: ' + canvas.width + ', height: ' + canvas.height)
        }
        ctx.drawImage(this, 0, 0);
        ctx.strokeStyle = "#FFFFFF";
        ctx.fillStyle = "#CE5908";
        ctx.lineWidth = 5;
        ctx.font = "normal 17px arial";
        ctx.strokeText(text, 5, 17);
        ctx.fillText(text, 5, 17);
        var initialwidth = this.width;
        if (url2 != "") {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                ctx.drawImage(this, initialwidth, 0);
                dataURL = canvas.toDataURL(outputFormat);
                callback(dataURL);
                canvas = null;
            };
            img.onerror = function ()
            {
                navigator.notification.alert("Photo is saved without geotag. Please ensure you have internet connection.", function () {
                }, "Unable to Capture GPS", '✔');
                dataURL = canvas.toDataURL(outputFormat);
                callback(dataURL);
                canvas = null;
            };
            img.src = url2;
        } else {
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
            canvas = null;
        }
    };
    img.src = url;
}


function textGeotagWatermark(url2, text, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
        var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'), dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        canvas.border = '1px solid black';
        ctx.drawImage(this, 0, 0);
        ctx.strokeStyle = "#FFFFFF";
        ctx.fillStyle = "#CE5908";
        ctx.lineWidth = 5;
        ctx.font = "normal 17px arial";
        ctx.strokeText(text, 5, 17);
        ctx.fillText(text, 5, 17);
        var initialwidth = this.width;  
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            ctx.drawImage(this, initialwidth, 0);
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
            canvas = null;
        };
        img.onerror = function ()
        {
            navigator.notification.alert("Photo is saved without geotag. Please ensure you have internet connection.", function () {
            }, "Unable to Capture GPS", '✔');
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
            canvas = null;
        };
        img.src = url2;
    };
    img.src = url2;
}

function photoPreview(photo, latitude, longtitude, block_unit, block_level,location_name,title) {
    
    /*console.log('TFF4 ' + photo);
    console.log('TFF5 ' + latitude);
    console.log('TFF6 ' + longtitude);
    console.log('TFF7 ' + block_unit);
    console.log('TFF8 ' + block_level);
    console.log('TFF9 ' + location_name);*/

    
    
      var blockLabel = '';
    if (photo != "") {
        if (latitude == undefined) {
            latitude = "-";
        }
        if (longtitude == undefined) {
            longtitude = "-";
        }
        if (block_unit == undefined) {
            block_unit = "-";
        }
        if (block_level == undefined) {
            block_level = "-";
        }
        
        if (block_unit == '0' && block_level == '0' ){
            blockLabel= '';
        }else if (block_unit == '0'){
            blockLabel =   lang.Mobile082 + ": " + block_level ;
        }else if (block_level == '0') {
            blockLabel =  lang.Mobile081 + ": " + block_unit ;
        }else {
            blockLabel=  lang.Mobile081 + ": " + block_unit + "<br>" +
                        lang.Mobile082 + ": " + block_level ;
        }
        
        var locName = '';
        var allInfo = '';
        var viewportHeight = ($(window).height() - 104) * 0.5;
        
        if (location_name.length == 0) {
            allInfo = '<div style="max-height:252px; width:100%; height:' + viewportHeight + 'px"><img id="photoPreview" src="' + photo + '"/></div>' +
                    '<div>' + blockLabel + '</div>';
            allInfo += '<br>' + '<input id="idTitle" placeholder="Title" value="' + title + '" type="text" style="width:100%;">' + '</div>';
            confirmPopupImages(allInfo, confirmPhoto, lang.Mobile079, ["✔", "✂"]);            
        }else {
            locName = location_name;
            allInfo = '<div style="max-height:252px; width:100%; height:' + viewportHeight + 'px"><img id="photoPreview" src="' + photo + '"/></div><div>';
            if (locName != '') allInfo +=  locName + '<br>';
            allInfo += blockLabel + '<br>' + '<input id="idTitle" placeholder="Title" value="' + title + '" type="text" style="width:100%;">' + '</div>';
            confirmPopupImages(allInfo, confirmPhoto, lang.Mobile079, ["✔", "✂"]);            
        }
        
//        var locURL = databaseIP + "googleapi?type=geocode&action=reverse&lon=" + longtitude + "&lat=" + latitude;
//        
//        $.ajax({
//            url: locURL,
//            type: 'GET',
//            timeout: 15000,
//            success: function (data) {
//
//                if (data.results != undefined && data.results.length > 0) 
//                {
//                    locName = data.results[0].formatted_address;
//                }
//
//                allInfo = '<div style="max-height:252px; width:100%; height:' + viewportHeight + 'px"><img id="photoPreview" src="' + photo + '"/></div><div>';
//                
//                if (locName != '') allInfo += 'Location: ' + locName + '<br>';
//                        
//                allInfo += blockLabel + '</div>';
//
//                confirmPopupImages(allInfo, confirmPhoto, lang.Mobile079, ["✔", "✂"]);
//            },
//            error: function (error, errorText, errorThrown) {
//
//                spinOut();
//
//                allInfo = '<div style="max-height:252px; width:100%; height:' + viewportHeight + 'px"><img id="photoPreview" src="' + photo + '"/></div>' +
//                        '<div>' + blockLabel + '</div>';
//
//                confirmPopupImages(allInfo, confirmPhoto, lang.Mobile079, ["✔", "✂"]);
//
//            }
//        });        
    }
}


function confirmPhoto(response) {
    if (response == 2) { //if Yes
        $photoPreviewPointer.eq($photoPreviewPointer.length - 1).remove();
    } else {
        //else do nothing
		$photoPreviewPointer.attr("data-title", $('#idTitle').val());
    }
}

function move_handler(ev) {
    if (ev.originalEvent.targetTouches.length == 2 && ev.originalEvent.changedTouches.length == 2) {

    } else
    {
        $('#image img').css('transform', 'scale(1.5)');
        $('#image img').css({'transform-origin': ((ev.originalEvent.changedTouches[0].screenX - $('#image').offset().left) / $('#image').width()) * 100 + '% ' + ((ev.originalEvent.changedTouches[0].screenY - $('#image').position().top) / $('#image').height()) * 100 + '%'});
    }
}

function showImage(src) {
    var viewportHeight = ($(window).height()); //worry that viewportHeight will fail, so put in max-height;
    var viewportWidth = ($(window).width());
    $('#image img').first().attr('src', src).css('max-height', viewportHeight).css('max-width', viewportWidth);
    $('#image img').on('touchmove', move_handler);

    $('#imagepopup').popup();
    $('#imagepopup').popup("open");
    $('#imagepopup').on({//prevents background from scrolling when popup is up
        popupbeforeposition: function () {
            $('body').on('touchmove', false); // when you do this, it will preven the the background (the body) to stop moving. However, have this error when you see the google chrome log.
            $('#imagepopup').css('display', 'block');
        },
        popupafteropen: function () {

            $('#image img').on('click', function () {
                $('#imagepopup').popup('close');
                $('#image img').css('transform', 'scale(1)');
            });
        },
        popupafterclose: function () {
            $('body').off('touchmove');
            $('#imagepopup').css('display', 'none');
            $('#image img').css('transform', 'scale(1)');
        }
    });
}

function takesignature() {
    $('#signaturepopup').show(); //show signature editor
    if ($signPointer.attr('src') != 'img/signature.png') { //if previous signature exist
        $sigdiv.jSignature('setData', $signPointer.attr('src'));	//set previous signature on canvas
    } else {
        $sigdiv.jSignature('clear');
    }
    $('body').on('touchmove', function () {
        return false
    });
}

function confirmSign(response) {
    if (response == 2) { //if Yes
        $('body').off('touchmove');
        $signPointer.attr("src", $sigdiv.jSignature("getData", 'default'));
    } else {
        //else do nothing
        $('body').off('touchmove');
        $sigdiv.jSignature('clear');
        $signPointer.attr("src", "img/signature.png");
    }
}

function takedrawing() {
    $('#drawingpopup').show(); //show signature editor
    if ($signPointer.attr('src') != 'img/signature.png') { //if previous drawing exist
        $drawdiv.jSignature('setData', $signPointer.attr('src'));	//set previous drawing on canvas
    } else {
        $drawdiv.jSignature('clear');
    }
    $('body').on('touchmove', function () {
        return false
    });
}

function confirmDraw(response) {
    if (response == 2) { //if Yes
        $('body').off('touchmove');
        $signPointer.attr("src", $drawdiv.jSignature("getData", 'default')); // set canvas, set image url to drawing
    } else {
        //else do nothing
        $('body').off('touchmove');
        $drawdiv.jSignature('clear');
        $signPointer.attr("src", "img/signature.png");
    }
}

//function captureBarcode() { 
//
//}

function confirmDeleteBarcode(response) {
    if (response == 2) { //if Yes
        var barcodearray = [];
        if ($barcodeEntryPointer.parent().attr('data-barcode') != "") {
            barcodearray = $barcodeEntryPointer.parent().attr('data-barcode').split(',');
        }
        barcodearray.splice($barcodeEntryPointer.index(), 1);
        $barcodeEntryPointer.parent().attr('data-barcode', barcodearray);
        $barcodeEntryPointer.remove();
    } else {
        //else do nothing
    }
}

//function openHintBox() { //comment away on v3.5.11
//    $(hint).toggle();
//}

function toggleCollapser(id, count) { // for collapser form field to use...

    // collapse all the collapsers except the one the user clicked on...
    $('.collapser.expand').each(function () {

        var div = $(this).parent();

        if (div.attr('id') !== id)
        {
            div.nextAll(':lt(' + div.attr('data-max') + ')').toggle();

            $(this).removeClass('expand');
        }
    });

    var collapser = $('#' + id);

    collapser.nextAll(':lt(' + count + ')').toggle();
    collapser.children(':first').toggleClass('expand');

    var collapserOffSet = collapser.offset().top - 50;
    $('html,body').animate({
        scrollTop: collapserOffSet
    });

}


function openDividedFormForUpload(file)
{
    
    writeLogs("openDividedFormForUpload, fileName: " + file + "-" + uploadingFilenameIndex);
    jobBeingUploaded = file;

    appDirectory.getFile(file + '-' + uploadingFilenameIndex, {create: false}, function (fileEntry) {
        fileEntry.file(openSingleFileForUpload, openDividedFormForUploadUnusualFail);
    }, openFileUploadFail);
}

function openDividedFormForUploadUnusualFail(file, err)
{
    writeLogs("openDividedFormForUploadUnusualFail " + file + " err " + err.code + err.message)
    resetFormUploader();
    openDividedFormForUpload(file);
}

function openSingleFileForUpload(file) // this will loop through all the diff filenameindex to add to uploadedJobAllHtml 
{
    var reader = new FileReader();
    reader.onloadend = function (evt) {
        uploadedJobAllHtml += evt.target.result;
        //console.log('--- UPLOAD LENGTH: ' + evt.target.result.length + ', TOTAL UPLOAD LENGTH: ' + uploadedJobAllHtml.length);
        writeLogs("--- UPLOAD LENGTH: " + evt.target.result.length + ", TOTAL UPLOAD LENGTH: " + uploadedJobAllHtml.length);
        uploadingFilenameIndex++;
        openDividedFormForUpload(jobBeingUploaded);
    };
    reader.readAsText(file);
}

function openFileUploadFail(err) // will come to here when there is no more file to read from. 
{
    //console.log('Completed opening file series for upload: ' + jobBeingUploaded);

    var id = jobBeingUploaded.split("_")[0];
    var jobFileText = jobBeingUploaded;
    writeLogs("openFileUploadFail, Completed opening file series for upload: jobBeingUploaded " + jobBeingUploaded);
    var driver_id = window.sessionStorage["userID"];
    var asset_id = window.sessionStorage["assetId"];
    var version_no = localStorage.getItem("version");

    var endedStatus = "8";
    var details = Base64.encode(uploadedJobAllHtml);
    var JSONText = {};

    JSONText.job_id = parseInt(id);
    JSONText.driver_id = parseInt(driver_id);
    JSONText.asset_id = parseInt(asset_id); 
    JSONText.version_no = version_no;
    JSONText.status_id = parseInt(endedStatus);
    JSONText.details = details;
    JSONText = JSON.stringify(JSONText);

    var upload_url = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=upload&jobId=" + id + "&assetId=" + asset_id + "&detailsLength=" + details.length + "&driverId=" + driver_id;

    console.log('Uploading ' + jobBeingUploaded);
    
//    console.log('AATESTING1 ' + upload_url + "AATESTING1 JSON :-" + JSONText);

    $.ajax({
        type: 'POST',
        url: upload_url,
        data: JSONText,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        timeout: 300000, // 30000
        beforeSend: function () {
            writeLogs("openFileUploadFail, uploading file Name = " + jobBeingUploaded);
        },
        success: function (data)
        {
            console.log('Uploading data result: ' + data.result);
            if (data.result)
            {
                resetFormDeleter();
                //Comment Delete Part of JobUploaded
                //newDeleteFile(jobFileText, 0);
                renameJobUploadedFile(jobFileText,0);

                var tuploadQueue = [];
                if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
                    tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
                }

                if (tuploadQueue[0] == jobFileText) {
                    tuploadQueue.shift();
                }

                window.localStorage["uploadQueue"] = JSON.stringify(tuploadQueue);
                $('.uploadCount span').html(tuploadQueue.length); //update Upload count	
                clearTimeout(uploadInterval); // not to have two instant of uploadInterval occuring at the same time, therefore, clear first before re-initatiate.
                uploadInterval = setTimeout(function () {
                    newUploadQueue();
                }, uploadDelay); //calls again after 30seconds
//                
//                setTimeout(function () {
//                    newUploadQueue();
//                }, uploadDelay); //calls again after 30seconds
                writeLogs("openFileUploadFail, Successfully Upload Job to Server : " + data.result + " Job id " + id);
            } else
            {
                clearTimeout(uploadInterval);
                uploadInterval = setTimeout(function () {
                    newUploadQueue();
                }, uploadDelay);
                writeLogs("openFileUploadFail, Upload Job to Server Data Result False, Server Reject? Re-queue job for uploading : " + data.result + "job_id = " + id);
                changeArraySequence();
            }
        },
        error: function (error, errorText, errorThrown) {
            //console.log("upload job error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
            writeLogs("openFileUploadFail, upload job error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown + " job_id " + id);
            clearTimeout(uploadInterval);
            uploadInterval = setTimeout(function () {
                newUploadQueue();
            }, uploadDelay);
            changeArraySequence();
        }
    });
    function changeArraySequence() {
        var tuploadQueue = [];
        if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
            tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
        }

        tuploadQueue.reverse();
        window.localStorage["uploadQueue"] = JSON.stringify(tuploadQueue);
        writeLogs("Changed UploadQueue Array Sequence. New array sequence = " + tuploadQueue);
        //console.log("CHANGED ARRAY SEQUENCE");
    }
}

/*** new file UPLOADER ***/

/*** new file OPENER ***/

function resetFormOpener()
{
    retrievingFilenameIndex = 0;
    jobBeingOpened = '';
    fileAllHtml = '';
}

function openDividedForm(file)
{
    console.log('fileName: ' + file + '-' + retrievingFilenameIndex);
    jobBeingOpened = file;

    appDirectory.getFile(file + '-' + retrievingFilenameIndex, {create: false}, function (fileEntry) {
        fileEntry.file(openSingleFile, openFileFail);
    }, openFileFail);
}

function openSingleFile(file)
{
    var reader = new FileReader();
    reader.onloadend = function (evt) {
        fileAllHtml += evt.target.result;
        console.log('--- LENGTH: ' + evt.target.result.length + ', TOTAL LENGTH: ' + fileAllHtml.length);
        retrievingFilenameIndex++;
        openDividedForm(jobBeingOpened);
    };
    reader.readAsText(file);
}

function openFileFail(err) // this is after openDividedForm(), when user open a new form
{
        console.log('Completed opening file series: ' + jobBeingOpened);

        $("#form_content").html(fileAllHtml);
        
        
        if (isStartJob)
        {
            getCurrentLocation(START_JOB_EVENT, 0, 0);
        }
        
        isStartJob = false;
//        console.log('Testting' + fileAllHtml);
        
        var user_id = window.sessionStorage["userID"];
        
        $('.file-link').each(function()
        {
            if($(this).attr('href')!= undefined && $(this).attr('href')!='')
            {
                $(this).html('Click To View');
            }
            else
            {
                $(this).removeAttr('style').attr('style','color:#D3D3D3;text-decoration:none');
                $(this).html("(No file Uploaded)");       
            }
            
        });
    
        var href = ''; 
        $(document).off('click').on("click",".form-sheet a", function(event) {
        event.preventDefault();
        href = $(this).attr("value");    
        var clickClass = $(this).attr("class");    
        
        if(clickClass === "send-otp"){
            if ($("#"+href+" input.cust-no").val() == "") {
                navigator.notification.alert("Your mobile no is incorrect.", function () {
                }, "Invalid Mobile no", '✔');    
            }else {
                spinIn();
                var otp_url = databaseIP + "/Controller/mobile_controller.jsp?type=system&action=sendotp&custNo=" + $("#"+href+" input.cust-no").val() + "&driverId=" + user_id ;
                $.ajax({
                    async: true,
                    url: otp_url,
                    type: 'GET',
                    timeout: 30000,
                    success: function (data) {
                        if (data.result) {
                            spinOut();
                            //alert(data.pin)
                            var timeLeft = 60;
                            otptimerId = setInterval(countdown, 1000);    
                            $("#"+href+" input.otp-field").text("");
                            function countdown() {
                                if (timeLeft == -1) {
                                    clearTimeout(otptimerId);
                                    $("#"+href+" .send-otp").text('Send OTP');
                                    $(".send-otp").css('pointer-events','');
                                    $("#"+href+" input.cust-no").prop('disabled', false);
                                    $("#"+href+" input.otp-field").prop('disabled', true);
                                } else {
                                    $("#"+href+" .send-otp").text('OTP sent. Retry in ' +  timeLeft + ' seconds');
                                    $(".send-otp").css('pointer-events','none');
                                    $(".verify-otp").css('pointer-events','none');
                                    $("#"+href+" .verify-otp").css('pointer-events','');
                                    $("#"+href+" input.cust-no").prop('disabled', true);
                                    $("#"+href+" input.otp-field").prop('disabled', false);
                                    timeLeft--;
                                }
                            }                      
                        } else {
                            spinOut();
                        }
                    },
                    error: function (error, errorText, errorThrown) {
                        spinOut();
                    }
                })   
            }
            
        }else if(clickClass === "verify-otp"){
                if ($("#"+href+" input.cust-no").val() == "") {
                     navigator.notification.alert("Your mobile no is incorrect.", function () {
                     }, "Invalid Mobile no", '✔');
                }else { 
                     if ($("#"+href+" input.otp-field").val() == "") {
                         navigator.notification.alert("Your OTP is incorrect.", function () {
                         }, "Invalid OTP", '✔');       
                     }else {
                        // $(".send-otp").css('pointer-events','none');
                         //clearTimeout(otptimerId);
                         spinIn();
                         var otp_url = databaseIP + "/Controller/mobile_controller.jsp?type=system&action=verifyotp&pin=" + $("#"+href+" input.otp-field").val();
                         $.ajax({
                             async: true,
                             url: otp_url,
                             type: 'GET',
                             timeout: 30000,
                             success: function (data) {
                                 if (data.result) {
                                     spinOut();
                                     clearTimeout(otptimerId);
                                     $("#"+href+" .verify-otp").addClass('verified');
                                     $("#"+href+" .send-otp").addClass('verified');
                                     $("#"+href+" .send-otp").text('Send OTP');
                                     $("#"+href+" input.otp-field").prop('disabled', true);       
                                     $("#"+href+" input.cust-no").prop('disabled', true);   
                                     $("#"+href+" .verify-otp").text('OTP has been verified');                   
                                     $("#"+href+" .verify-otp").data("verified","yes");
                                     $(".verify-otp").css('pointer-events','');
                                     $('.verify-otp.verified').css('pointer-events','none');
                                     $(".send-otp").css('pointer-events','');
                                     $(".send-otp.verified").css('pointer-events','none');
                                 } else {
                                   //  clearTimeout(otptimerId);
                                     $("#"+href+" .verify-otp").css('pointer-events','');
                                     $("#"+href+" .verify-otp").text('Verify OTP');
                                    // $("#"+href+" .send-otp").text('Send OTP');
                                     $("#"+href+" input.cust-no").prop('disabled', false);
                                     $(".send-otp").css('pointer-events','');
                                     $(".verify-otp").css('pointer-events','');
                                     $("#"+href+" .verify-otp").data("verified","false");
                                     spinOut();
                                     navigator.notification.alert("Wrong OTP.", function () {
                                     }, "Wrong OTP entered", '✔');                              
                                 }
                             },
                             error: function (error, errorText, errorThrown) {
                                 clearTimeout(otptimerId);
                                 $("#"+href+" .verify-otp").css('pointer-events','');
                                 $("#"+href+" .verify-otp").text('Verify OTP');
                                 spinOut();
                             }
                         })                   
                     }            
                 }
        }
        else if(clickClass === "file-link"){
            var link =   $(this).attr('href');
            window.open(link, '_system', 'location=yes')
        }
        else
        {
            var link =   $(this).attr('href');
            window.open(link, '_system', 'location=yes')
        }
       
  });
    


    $('.image img').on('click', function ()
    {
        var srcSource = $(this).attr('src');
        showImage(srcSource);
    });
    
    
    
    // Added 21 Aug
    $('.camera img').on({'click': function () {
            if ($('.camera img').attr('src') != "") {
                $photoPreviewPointer = $(this);
                photoPreview($(this).attr('src'), $(this).attr('data-latitude'), $(this).attr('data-longitude'), $(this).attr('data-block-unit'), $(this).attr('data-block-level'),$(this).attr('data-location-name'), $(this).attr('data-title'));
            }
        }});
    bindCameraImg('.camera input[type="image"]');
    bindVideoFile('.uploadVideo input[type="image"]');
    
    bindGeotagImg('.capturegeotag input[type="image"]');
      

    bindGalleryImg('.gallery input[type="image"]');
    $('.gallery img').on('click', function () {
        if ($('.gallery img').attr('src') != "") {
            $photoPreviewPointer = $(this);
            photoPreview($(this).attr('src'), 0, 0, 0, 0,'', $(this).attr('data-title'));
        }
    });
    /* End of Gallery Form Field */

    /* Start of Gallery & Camera Form Field */
    bindCameraImg('.cameralibrary input[type="image"][src$="camera.png"]');
    bindGalleryImg('.cameralibrary input[type="image"][src$="gallery.png"]');
    $('.cameralibrary img').on('click', function () {
        if ($('.cameralibrary img').attr('src') != "") {
            $photoPreviewPointer = $(this);
            photoPreview($(this).attr('src'), 0, 0, 0, 0,'', $(this).attr('data-title'));
        }
    });
    /* End of Gallery & Camera Form Field */
    
    if ($('.signature img').attr('src') == 'img/form_signature.png' || $('.signature img').attr('src') == '../img/form_signature.png') { // v3 format = ../img/form_signature.png v4 format = img/form_signature.png
        $('.signature img').attr('src', 'img/signature.png');
    }
    $('.signature img').on('click', function () {
        $signPointer = $(this);
        takesignature();
    });

    if ($('.drawing img').attr('src') == 'img/form_signature.png' || $('.drawing img').attr('src') == '../img/form_signature.png') {
        $('.drawing img').attr('src', 'img/signature.png');
    } else {
        $signPointer = $(this);
    }
    $('.drawing img').on('click', function () {
        $signPointer = $(this);
        takedrawing();
    });

    $('.barcode input[type="image"]').attr('src', 'img/barcode.png');
    $('.barcode input[type="image"]').on('click', function ()
    {
        $barcodeListPointer = $(this).parent().find('ul');
        if ($barcodeListPointer.parent().find('input[type="text"]').val() == "")
        { //if barcode not manually entered
            if ($barcodeListPointer.attr('data-barcode').split(',').length < $barcodeListPointer.parent().attr("data-max") || $barcodeListPointer.parent().attr("data-max") == undefined) { //if still within max limit
                cordova.plugins.barcodeScanner.scan(
                        function (result) {
                            if (result.text != "") {
                                var newbarcode = result.text;
                                var barcodearray = [];
                                if ($barcodeListPointer.attr('data-barcode') != "") {
                                    barcodearray = $barcodeListPointer.attr('data-barcode').split(',');
                                }
                                barcodearray.push(newbarcode);
                                $barcodeListPointer.attr('data-barcode', barcodearray);
                                $barcodeListPointer.append('<li>' + newbarcode + '</li>');
                                $barcodeListPointer.parent().find('input[type="text"]').val("");

                                $barcodeListPointer.find('li').unbind('click');
                                $barcodeListPointer.find('li').bind('click', function () {
                                    $barcodeEntryPointer = $(this);
                                    console.log("A19");
                                    navigator.notification.confirm(
                                            lang.Mobile090 + ": " + $barcodeEntryPointer.text() + "?",
                                            confirmDeleteBarcode,
                                            lang.Mobile089,
                                            ["✘", "✔"]
                                            );
                                });
                            } else {
                                $barcodeListPointer.parent().find('input[type="text"]').val("");
                            }
                        },
                        function (error) {
                            console.log("barcodescan error: " + error);
                        }
                );


            } else {
                $barcodeListPointer.parent().find('input[type="text"]').val("");
                navigator.notification.alert(lang.Mobile088, function () {
                }, lang.Mobile087, '✔');
            }
        } else
        {
            var newbarcode = $barcodeListPointer.parent().find('input[type="text"]').val();
            var barcodearray = [];
            if ($barcodeListPointer.attr('data-barcode') != "" && $barcodeListPointer.attr('data-barcode') != undefined) {
                barcodearray = $barcodeListPointer.attr('data-barcode').split(',');
            }
            barcodearray.push(newbarcode);
            $barcodeListPointer.attr('data-barcode', barcodearray);
            $barcodeListPointer.append('<li>' + newbarcode + '</li>');
            $barcodeListPointer.parent().find('input[type="text"]').val("");

            $barcodeListPointer.find('li').unbind('click');
            $barcodeListPointer.find('li').bind('click', function () {
                $barcodeEntryPointer = $(this);
                console.log("A20");
                navigator.notification.confirm(
                        lang.Mobile090 + ": " + $barcodeEntryPointer.text() + "?",
                        confirmDeleteBarcode,
                        lang.Mobile089,
                        ["✘", "✔"]
                        );
            });
        }
        ;
    });

    $('#ratingsSum').on('click', function () {
        var arr = ratingsSummary();
        arr[1] = arr[1] ? arr[1] : 0;
        $('#ratingsSum').attr('value', arr[1]);
        navigator.notification.alert("Grand Total: " + arr[0] + "\nTotal Percentage: " + arr[1] + " %", function () {
        }, "", '✔');
    });

    $('.addCameraButton').on('click', function () { // new function add Camera
        var additionalCameraCounter = 0;
        var dataMaxAdd = $(this).parent().attr('data-maxadd');

        $(this).parent().parent().prevAll().each(function () {
            if (typeof $(this).attr('data-addedcamera') !== typeof undefined && $(this).attr('data-addedcamera') !== false) {
                additionalCameraCounter = additionalCameraCounter + 1;
            } else {
                return false;
            }
        });

        if (additionalCameraCounter < dataMaxAdd) {
            var idCounter = 0;
            var cameraSelector = $(this).parent().parent();
            $('.form-sheet').children().each(function () {
                var id = $(this).attr('id');
                idCounter = Math.max(idCounter, id.split('-')[2]);
            });
            if (idCounter == 0) {
                navigator.notification.alert("Dynamic Camera not added, please screenshot and contact Admin", function () { // just in case the counting doesnt work.
                }, lang.Mobile102, '✔');
                return;
            }
            var sequenceNumber = 0;
            var checkPrev = $(this).parent().parent().prev();
            if (checkPrev.attr('data-addedcamera') === 'true') {

                var getPrevFormFieldText = checkPrev.children().first().text();
                var getLastDigits = getPrevFormFieldText.substring(getPrevFormFieldText.lastIndexOf(' '));
                sequenceNumber = parseInt(getLastDigits) + 1;
            } else {
                sequenceNumber = 1;
            }

            idCounter = idCounter + 1
            var idAttr = $(this).parent().parent().attr('id');
            var clonedCamera = $(this).parent().parent().clone(true).attr('id', (idAttr.replace(idAttr.match(/\d+/g), idCounter))); // change the form field id
            clonedCamera.attr('data-role', 'camera');
            clonedCamera.attr('data-addedcamera', true); //add new attribute to identify this is dynamic added
            var initialText = clonedCamera.children().first().text();
            clonedCamera.children().first().text(initialText + " " + sequenceNumber);
            clonedCamera.children('[id]').each(function () { // change the id form field id for all the label in the form field
                var idAttrChild = $(this).attr('id');
                $(this).attr('id', (idAttrChild.replace(idAttr.match(/\d+/g), idCounter)));
            });
            clonedCamera.find('.addcamera').empty();
            var image = $('<input/>', {type: 'image', src: 'img/camera.png'});
            clonedCamera.find('.addcamera').append(image); // find the the inner div. with class addcamera 
            clonedCamera.children().last().attr('class', 'camera');
            clonedCamera.insertBefore(cameraSelector);
            bindCameraImg(clonedCamera.find('input'));
        } else { // when the 
            navigator.notification.alert("You have reached the limit of adding Dynamic Camera ", function () {
            }, "Maximum Limit", '✔');
        }
    });

    spinOut();
}


function bindVideoFile(attrSelector) {
        $(attrSelector).attr('src', 'img/video.png');
//        $(attrSelector).css({ 'height': '100px', 'width': '100px', 'background-color': 'none' });

        $(attrSelector).on({'touchstart': function (event)  // this is to bind the camera icon
        {
                writeLogs("Initial Video function");
                spinIn();
                setTimeout(function () {
                        spinOut();
                }, 5000); // incase it never spin out and hang there.


                $(this).before('<a   ></a>');
                $videoPointer = $(this).parent().find('a');
                var videoCount = 1;
                for (var i = 0; i < $videoPointer.length ; i ++){
                        if($videoPointer.eq(i).attr("data-link") == undefined ||  $videoPointer.eq(i).attr("data-link") == "undefined"){
                        }else {
                                videoCount = videoCount +1 ;
                        }
                }

                if (videoCount < $(this).parent().attr('data-max'))
                {
                        uploadVideo();
                } else if (videoCount == $(this).parent().attr('data-max'))
                {
                        uploadVideo();
                } else if ($(this).parent().attr('data-max') == undefined)
                { //if data-max was not defined
                        uploadVideo();
                } else
                {
                        $videoPointer.eq($videoPointer.length - 1).remove();
                        spinOut();
                        navigator.notification.alert("You have uploaded the maximum amount of videos.", function () {
                        }, "Max Videos Uploaded", '✔');
                }

        }});
}


function uploadVideo() {
    var first = $videoPointer.length - 1;
    
    navigator.camera.getPicture(function(fileUrl){
        
         spinInVideo(); 
         var spinTimeout = setTimeout(function () {
             spinOut();
         }, 25000); 
         
          var options = new FileUploadOptions();
          options.fileKey = 'video';
          options.fileName = fileUrl.substr(fileUrl.lastIndexOf('/') + 1);
          options.mimeType = 'video/mpg';
          options.chunkedMode = false; 
         
         var ftfileUrl = fileUrl;
        
        // fix path for file:// protocol
        fileUrl = (parseInt(fileUrl.indexOf('file://'))==0)?fileUrl:'file://'+fileUrl;
        // resolve and locate file
        window.resolveLocalFileSystemURL(fileUrl, function success(fileEntry) {
          // retrieve file entry
          fileEntry.file(function(fileObj) {
            // debug
            console.log(fileEntry.nativeURL);
            console.log(fileObj.localURL);
            console.log(fileObj.name);
            console.log(fileObj.size);
            
            if(((fileObj.size/1024)/1024) < 10 ) {      //// Set default condition to 5 MB
                            
                
                var jobid = window.sessionStorage["selected_id"];
                var ft = new FileTransfer();
                var url = databaseIP + 'AssetController?type=job&action=uploadVideo&jobId=' + jobid ;
                ft.upload(ftfileUrl, url, function (data) {
                       var Jsondata = JSON.parse(data.response);
                       if (Jsondata.result == true) {
                           var vidUrl = Jsondata.videoURL
                           var vidname = vidUrl.substr(vidUrl.lastIndexOf('\\') + 1);
                           vidUrl = databaseIP + "videos/" + vidname ;
                           spinOut();
                           $videoPointer.eq(this)
                           $videoPointer.eq(first).after('<a data-link="' + vidUrl +'" >' + vidname +'</a>\n');
                           for (var i = 0; i < $videoPointer.length ; i ++){
                              if($videoPointer.eq(i).attr("data-link") == undefined || $videoPointer.eq(i).attr("data-link") == "undefined" ){
                                  $videoPointer.eq(i).remove();
                              }
                           }                      
                       }else {
                           spinOut();
                       }
                }, function (e) {
                    spinOut();
                    console.log('upload error', e);
                }, options, true);
                ft.onprogress = function (progressEvent) {
                   // console.log('onprogress: ' + ((progressEvent.loaded / progressEvent.total) * 100) + '%');
                };                
                
            }else {
                spinOut(); 
                navigator.notification.alert("Video size cannot be more than 10 MB, please upload another one.", function () {
                        }, "Video Too Large", '✔');
                
            }
      
          }, function(error) {
              spinOut();      
              console.log('file entry error');
            });
        }, function (error) {
              spinOut();
              console.log('resolve error');
        });
        
        if (typeof spinTimeout !== "undefined") {
            clearTimeout(spinTimeout);
        }        
        writeLogs("Video Successfully Loaded ");
    }, function(message){
        alert("error");
        spinOut();
        $videoPointer.eq($videoPointer.length - 1).remove();
        writeLogs("Video Take Video Cancelled / Failed : " + message);
    }, { quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: Camera.MediaType.VIDEO,
        correctOrientation: true,
        allowEdit: true,
        maximumImagesCount :1
    });   
    
}

/*
 * OLD VIDEO UPLOAD, NO FILESIZE CHECK
function uploadVideo() 
{
        var first = $videoPointer.length - 1;

        navigator.camera.getPicture(function(fileUrl){

                 var options = new FileUploadOptions();
                 options.fileKey = 'video';
                 options.fileName = fileUrl.substr(fileUrl.lastIndexOf('/') + 1);
                 options.mimeType = 'video/mpg';
                 options.chunkedMode = false;

                 spinInVideo(); 
                 var spinTimeout = setTimeout(function () {
                         spinOut();
                 }, 25000); 

                 var jobid = window.sessionStorage["selected_id"];
                 var ft = new FileTransfer();
                 var url = databaseIP + 'AssetController?type=job&action=uploadVideo&jobId=' + jobid ;
                 ft.upload(fileUrl, url, function (data) {
                                var Jsondata = JSON.parse(data.response);
                                if (Jsondata.result == true) {
                                        var vidUrl = Jsondata.videoURL
                                        var vidname = vidUrl.substr(vidUrl.lastIndexOf('\\') + 1);
                                        vidUrl = databaseIP + "videos/" + vidname ;
                                        spinOut();
                                        $videoPointer.eq(this)
                                        $videoPointer.eq(first).after('<a data-link="' + vidUrl +'" >' + vidname +'</a>\n');
                                        for (var i = 0; i < $videoPointer.length ; i ++){
                                           if($videoPointer.eq(i).attr("data-link") == undefined || $videoPointer.eq(i).attr("data-link") == "undefined" ){
                                                   $videoPointer.eq(i).remove();
                                           }
                                        }                      
                                }else {
                                        spinOut();
                                }
                 }, function (e) {
                         spinOut();
                         console.log('upload error', e);
                 }, options, true);
                 ft.onprogress = function (progressEvent) {
                        // console.log('onprogress: ' + ((progressEvent.loaded / progressEvent.total) * 100) + '%');
                 };       

                if (typeof spinTimeout !== "undefined") {
                        clearTimeout(spinTimeout);
                }        
                writeLogs("Video Successfully Loaded ");
        }, function(message){
                spinOut();
                $videoPointer.eq($videoPointer.length - 1).remove();
                writeLogs("Video Take Video Cancelled / Failed : " + message);
        }, { quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                mediaType: Camera.MediaType.VIDEO,
                correctOrientation: true,
                allowEdit: true,
                maximumImagesCount :1
        });   

}
*/

function bindCameraImg(attrSelector) {
    $(attrSelector).attr('src', 'img/camera.png');

    $(attrSelector).on({'touchstart': function (event)  // this is to bind the camera icon
        {
            writeLogs("Initial Camera function");
            spinIn();
            setTimeout(function () {
                spinOut();
            }, 5000); // incase it never spin out and hang there.

            $(this).before('<img src="img/loading.png" />');
            $picPointer = $(this).parent().find('img');
            if ($picPointer.length < $(this).parent().attr('data-max'))
            {
                if ($(this).parent().parent().attr("data-backup") == "true") {
                    //takephotoBackup();
                    takephoto(true);
                } else {
                    takephoto(false);
                }

            } else if ($picPointer.length == $(this).parent().attr('data-max'))
            {
                if ($(this).parent().parent().attr("data-backup") == "true") {
                    //takephotoBackup();
                    takephoto(true);
                } else {
                    takephoto(false);
                }
                // $(this).hide();
            } else if ($(this).parent().attr('data-max') == undefined)
            { //if data-max was not defined
                if ($(this).parent().parent().attr("data-backup") == "true") {
                    //takephotoBackup();
                    takephoto(true);
                } else {
                    takephoto();
                }
            } else
            {
                $picPointer.eq($picPointer.length - 1).remove();
                spinOut();
                navigator.notification.alert(lang.Mobile084, function () {
                }, lang.Mobile083, '✔');
            }

        }});
}


function bindGeotagImg(attrSelector) {
        $(attrSelector).attr('src', 'img/geotag.png');

        $(attrSelector).on({'touchstart': function (event)  // this is to bind the camera icon
        {
                        writeLogs("Initial Geotag function");
                        $(this).before('<img src="img/loading.png" />');
                        $picPointer = $(this).parent().find('img');
                        if ($picPointer.length < 1)
                        {
                           takeGeotagphoto(false);
                        } else if ($picPointer.length == 1)
                        {
                                takeGeotagphoto(false);
                        } else
                        {
                                $picPointer.eq($picPointer.length - 1).remove();
                          //  spinOut();
//                navigator.notification.alert(lang.Mobile084, function () {
//                }, lang.Mobile083, '✔');
                        }

        }});
}

function bindGalleryImg(attrSelector) {
    $(attrSelector).attr('src', 'img/gallery.png');
    $(attrSelector).on('click', function () {
        if (attrSelector.indexOf("cameralibrary") != -1) {
            $(this).prev().before('<img src="img/loading.png" />');
        } else {
            $(this).before('<img src="img/loading.png" />');
        }
        $picPointer = $(this).parent().find('img');
        $dataMax = $(this).parent().attr('data-max') - $picPointer.length + 1; // add plus 1 is because of the img/loading.png that will be remove
        if ($picPointer.length < $(this).parent().attr('data-max')) {
            attachImg();
        } else if ($picPointer.length == $(this).parent().attr('data-max')) {
            attachImg();
        } else if ($(this).parent().attr('data-max') == undefined) { //if data-max was not defined
            attachImg();
        } else {
            $picPointer.eq($picPointer.length - 1).remove();
            navigator.notification.alert(lang.Mobile086, function () {
            }, lang.Mobile085, '✔');
        }
    });
}



/*** new file OPENER ***/
function resetFormSaver()
{
    savingFilenameIndex = 0;
    nextChunkStartPoint = 0;
    savedContent = '';
    jobBeingSaved = '';

    isAutoSave = false;
    isNewForm = false;
    newFormData = '';
    isSavingBeforeQueued = false;
}

function newSaveForm(html_file, data)
{
    appDirectory.getFile(html_file, {create: true, exclusive: false}, function (fileEntry) {
        fileEntry.createWriter(win, fail);
    }, fail);
    function win(writer)
    {
        writer.onwriteend = function (evt)
        {
            newSaveDividedForm(jobBeingSaved, isAutoSave, isNewForm, newFormData, isSavingBeforeQueued);
        };
        writer.write(data);
    }
    ;
    function fail(error) {
        //console.log("Writer Error: " + error.code);
        writeLogs("newSaveForm, Writer Error: " + error.code + error.message);
        spinOut();
        navigator.notification.alert(lang.Mobile094, function () {
        }, lang.Mobile093, '✔');
    }
}

function resetFormDeleter()
{
    deletingFilenameIndex = 0;
}


function newDeleteFile(html_file, startIndex)
{
    var nextIndex = deletingFilenameIndex + parseInt(startIndex, 10);

    //console.log('Deleting file ' + html_file + '-' + nextIndex);
    writeLogs("Deleting file " + html_file + "-" + nextIndex);

    appDirectory.getFile(html_file + '-' + nextIndex, {create: false},
            function (fileEntry)
            {
                fileEntry.remove(function ()
                {
                    //console.log("Deleted: " + html_file + '-' + nextIndex);
                    writeLogs("Deleted: " + html_file + '-' + nextIndex);
                    deletingFilenameIndex++;
                    newDeleteFile(html_file, startIndex);
                }, function (err) {
                    //console.log('Finished deleting remaining file series: ' + html_file + ' after index ' + nextIndex);
                    writeLogs("newDeleteFile, Finished deleting remaining file series: " + html_file + " after index " + nextIndex + " error " + err.code + err.message);
                    deletingFilenameIndex++;
                });

            },
            function (err)
            {
                //console.log('Finished deleting remaining file series: ' + html_file + ' after index ' + nextIndex);
                writeLogs("newDeleteFile, Cant get remaining file series: " + html_file + " after index " + nextIndex + " error " + err.code + err.message);
                deletingFilenameIndex++;
            }
    );
}
/*** params for new file SAVER, OPENER, DELETER ***/

var multiplier = 800000;
var formDividerLimit = 5000000; // 5 000 000
var retrievingFilenameIndex = 0;
var jobBeingOpened = '';
var fileAllHtml = '';

var savingFilenameIndex = 0;
var nextChunkStartPoint = 0;
var savedContent = '';
var jobBeingSaved = '';
var isAutoSave = false;
var isNewForm = false;
var newFormData = '';
var isSavingBeforeQueued = false;

var deletingFilenameIndex = 0;

var uploadingFilenameIndex = 0;
var jobBeingUploaded = '';
var uploadedJobAllHtml = '';

/*** params for new file SAVER, OPENER, DELETER ***/

function resetFormUploader()
{
    uploadingFilenameIndex = 0;
    jobBeingUploaded = '';
    uploadedJobAllHtml = '';
}


function newUploadQueue()
{
    //console.log("Checking uploadQueue for files.");
    writeLogs("newUploadQueue, checking Uploadqueue for files" + localStorage.getItem("uploadQueue"));

    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null)
    {
        var tuploadQueue = [];
        tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");

        var html_file = tuploadQueue[0];

        if (html_file != "")
        {
            resetFormUploader();
            openDividedFormForUpload(html_file);
            writeLogs("newUploadQueue, openDividedFormforUpload file = " + html_file);
        } else
        {
            //console.log("uploadqueue: Empty html_file id. Removed and updated uploadQueue.");
            writeLogs("uploadqueue: Empty html_file id. Removed and updated uploadQueue.");
            //tuploadQueue.shift();
            window.localStorage["uploadQueue"] = JSON.stringify(tuploadQueue);

            $('.uploadCount span').html(tuploadQueue.length); //update Upload count	
            clearTimeout(uploadInterval);
            uploadInterval = setTimeout(function () {
                newUploadQueue();
            }, uploadDelay);
        }
    } else
    {
        console.log("No more files to upload.");
    }
}


function newDownload(html_file, details)
{
    appDirectory.getFile(html_file + '-0', {create: false}, function (fileEntry)
    {
        fileEntry.file(winCheck, failCheck); //file: Creates a File object containing file properties.

        function winCheck(file)
        {
            if (file.size == 0)
            {
                resetFormSaver();
                newSaveDividedForm(html_file, true, true, details, false);
//                appDirectory.getFile(html_file, {create: true, exclusive: false}, function (fileEntry) {
//                    fileEntry.createWriter(winWriter, failWriter);
//                }, failWriter);
            } 
            else
            {
//                console.log("File Series exist: " + html_file);
            }
        }
        function failCheck(error)
        {
            writeLogs("newDownload, failcheck funciton, if fail to create a file, go back into the loop again and try to create. Might cause inifinite loop.")
            newDownload(html_file, details);
        }
    }, function () {
        uploadDirectory.getFile(html_file + '-0', {create: false}, function (fileEntry) {
            //PENDING - handling of UPLOAD DIRECTORY
            console.log("File Exist In Upload Queue: " + html_file);
        }, function () {
            console.log("Create new: " + html_file);
            resetFormSaver();
            newSaveDividedForm(html_file, true, true, details, false);
//            appDirectory.getFile(html_file, {create: true, exclusive: false}, function (fileEntry) {
//                fileEntry.createWriter(winWriter, failWriter);
//            }, failWriter);
        });
    });

    count++;
}

/* Start of Code for Submit Button Click */

function newSubmitForm(html_file) {
    spinIn();
    var empty = 0; //count unfilled mandatory questions

    $('input[type="text"]').each(function () {
        if ($(this).attr("required") && $(this).val() == "") {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).attr("value", $(this).val());
            $(this).parent().css("background-color", "inherit");
        }
    });
    $('input[type="date"]').each(function () {
        if ($(this).attr("required") && $(this).val() == "") {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).attr("value", $(this).val());
            $(this).parent().css("background-color", "inherit");
        }
    });
    $('input[type="time"]').each(function () {
        if ($(this).attr("required") && $(this).val() == "") {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).attr("value", $(this).val());
            $(this).parent().css("background-color", "inherit");
        }
    });
    $('input[type="email"]').each(function () {
        if ($(this).attr("required") && $(this).val() == "") {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).attr("value", $(this).val());
            $(this).parent().css("background-color", "inherit");
        }
    });
    $('input[type="datetime-local"]').each(function () {
        if ($(this).attr("required") && $(this).val() == "") {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).attr("value", $(this).val());
            $(this).parent().css("background-color", "inherit");
        }
    });
    $('input[type="number"]').each(function () {
        if ($(this).attr("required") && $(this).val() == "") {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).attr("value", $(this).val());
            $(this).parent().css("background-color", "inherit");
        }
    });
    $('textarea').each(function () {
        if ($(this).attr("required") && $(this).val() == "") {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).html($(this).val());
            $(this).parent().css("background-color", "inherit");
        }
    });
    $('select').each(function () {
        if ($(this).attr("required") && $(this).val() == "") {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).find('option[value!="' + $(this).val() + '"]').attr("selected", false);
            $(this).find('option[value="' + $(this).val() + '"]').attr("selected", true);
            $(this).parent().css("background-color", "inherit");
        }
    });
    $('fieldset').each(function () {
        var checkMandatory = $(this).parent().parent().children().first().hasClass('mandatory');
        if ($(this).find('input[type="radio"]').val() != undefined) { //if radio  
            if ($(this).parent().hasClass('ratings')) { // the following is for rating 
                var emptyRating = 0;
                $(this).children().each(function () {
                    if ($(this).find('input[type="radio"]:checked').val() == undefined && checkMandatory) {
                        empty++;
                        emptyRating++;
                        $(this).children().first().css("background-color", "pink");
                    } else {
                        $(this).find('input[type="radio"]:checked').attr("checked", true);
                        $(this).find('input[type="radio"]:not(:checked)').removeAttr("checked");
                        $(this).children().first().css("background-color", "inherit");
                    }
                });
                if (emptyRating != 0) {
                    $(this).parent().parent().children().first().css("background-color", "pink");
                } else {
                    $(this).parent().parent().children().first().css("background-color", "inherit");
                }
            } else { // the following is for radio button 
                if ($(this).find('input[type="radio"]:checked').val() == undefined && checkMandatory) {
                    empty++;
                    $(this).parent().parent().children().first().css("background-color", "pink");
                } else {
                    $(this).find('input[type="radio"]:checked').attr("checked", true);
                    $(this).find('input[type="radio"]:not(:checked)').removeAttr("checked");
                    $(this).parent().parent().children().first().css("background-color", "inherit");
                }
            }

        } else if ($(this).find('input[type="checkbox"]').val() != undefined) { //if checkbox
            if ($(this).attr("required") && $(this).find('input[type="checkbox"]:checked').val() == undefined) {
                empty++;
                $(this).parent().css("background-color", "pink");
            } else {
                $(this).find('input[type="checkbox"]:checked').attr("checked", true);
                $(this).find('input[type="checkbox"]:not(:checked)').removeAttr("checked");
                $(this).parent().css("background-color", "inherit");
            }
        }
    });

    $('.camera').each(function () {
        if ($(this).find('img').length < $(this).attr('data-min'))
        {
            empty++;
            $(this).parent().children().first().css("background-color", "pink");
        } else
        {
            $(this).parent().children().first().css("background-color", "inherit");
            $(this).find('img').each(function () {
                
                $(this).parent().parent().children().first().css("background-color", "inherit");
                
//                var imgLength = $(this).attr('src').length;
//                if (imgLength < 1000) {
//                    empty++;
//                    $(this).parent().parent().children().first().css("background-color", "pink");
//                    return false;
//                } else {
//                    $(this).parent().parent().children().first().css("background-color", "inherit");
//                }
            });
        }
    });
    $('.cameralibrary').each(function () {
        if ($(this).find('img').length < $(this).attr('data-min'))
        {
            empty++;
            $(this).parent().children().first().css("background-color", "pink");
        } else
        {
            $(this).parent().children().first().css("background-color", "inherit");
            $(this).find('img').each(function () {
                
                 $(this).parent().parent().children().first().css("background-color", "inherit");
                
                
//                var imgLength = $(this).attr('src').length;
//                if (imgLength < 1000) {
//                    empty++;
//                    $(this).parent().parent().children().first().css("background-color", "pink");
//                    return false;
//                } else {
//                    $(this).parent().parent().children().first().css("background-color", "inherit");
//                }
            });
        }
    });
    $('.gallery').each(function () {
        if ($(this).find('img').length < $(this).attr('data-min'))
        {
            empty++;
            $(this).parent().children().first().css("background-color", "pink");
        } else {
            $(this).parent().children().first().css("background-color", "inherit");
        }
    });
    $('.video').each(function () {
        if ($(this).attr("required") && $(this).find('.videoArea').html() == "") {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).parent().css("background-color", "inherit");
        }
    });

    $('.signature').each(function () {
        if ($(this).parent().children().first().hasClass('mandatory') && $(this).find('img').attr('src') == "img/signature.png") {
            empty++;
            $(this).parent().children().first().css("background-color", "pink");
        } else {
            $(this).parent().children().first().css("background-color", "inherit");
        }
    });

    $('.drawing').each(function () {
        if ($(this).parent().children().first().hasClass('mandatory') && $(this).find('img').attr('src') == "img/signature.png") {
            empty++;
            $(this).parent().children().first().css("background-color", "pink");
        } else {
            $(this).parent().children().first().css("background-color", "inherit");
        }
    });

    $('.barcode').each(function () {
        if ($(this).attr("required") && $(this).find('ul').attr('data-barcode') == "" && $(this).find('ul').attr('data-barcode').split(',').length <= $(this).attr("data-min")) {
            empty++;
            $(this).parent().css("background-color", "pink");
        } else {
            $(this).parent().css("background-color", "inherit");
        }
    });

    if (empty == 0) 
    {
        var job_id = window.sessionStorage["selected_id"];
        var checkstatus_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=checkStatus&jobScheduleIds=" + job_id;
        writeLogs("Check Job Status before Submitting form. Job Id : " + job_id);
        $.ajax({
            url: checkstatus_URL,
            type: 'GET',
            success: function (data) {
                writeLogs("newSubmitForm, check status data result = " + data.result + " job_status : " + data.arrStatus + " job id : " + data.arrJobId);
                if (data.result) {
                    var job_status = data.arrStatus;
                    var job_fullid = data.arrJobId;
                    console.log("beforesubmitcheckstatus success: " + job_status);
                    if (job_status == 0 || job_status == 8) { //job deleted or ended
                        resetFormDeleter();
                        //newDeleteFile(html_file, 0);
                        sessionStorage.removeItem('selected_id');
                        sessionStorage.removeItem('selected_file');
                        sessionStorage.removeItem('selected_name');
                        setTimeout(function () {
                            $.mobile.changePage("#main", {transition: 'fade', reverse: 'true'});
                            window.clearInterval(jobInterval);
                            jobInterval = window.setInterval(function () {
                                if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                            }, refreshRate);
                            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                            spinOut();
                            navigator.notification.alert(lang.Mobile098 + ' ' + job_fullid + ' ' + lang.Mobile099, function () {
                            }, lang.Mobile095, '✔');
                        }, 0);
                    } else if (job_status == 11) { //job cancelled
                        resetFormDeleter();
                        //newDeleteFile(html_file, 0);
                        sessionStorage.removeItem('selected_id');
                        sessionStorage.removeItem('selected_file');
                        sessionStorage.removeItem('selected_name');
                        setTimeout(function () {
                            $.mobile.changePage("#main", {transition: 'fade', reverse: 'true'});
                            window.clearInterval(jobInterval);
                            jobInterval = window.setInterval(function () {
                                if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                            }, refreshRate);
                            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                            spinOut();
                            navigator.notification.alert(lang.Mobile098 + ' ' + job_fullid + ' ' + lang.Mobile100, function () {
                            }, lang.Mobile095, '✔');
                        }, 0);
                    } else { //nothing wrong
                        resetFormSaver();
                        newSaveDividedForm(html_file, true, false, '', true);
                        getCurrentLocationNew(8,job_id);
                    }
                } 
                else 
                {
                    // What can cause Ajax to fail? Not sure why if ajax return false, the action is to do delete 
                    // maybe can change here to auto save manually and prompt a different message
                    writeLogs("newsubmitform, Checking of Job Status Ajax return false and save the job. jobStatus " + job_status + " job Id " + job_fullid);

                    resetFormDeleter();
                    //newDeleteFile(html_file, 0); // why delete job here?

                    sessionStorage.removeItem('selected_id');
                    sessionStorage.removeItem('selected_file');
                    sessionStorage.removeItem('selected_name');
//                    navigator.notification.alert(lang.Mobile123, function () { // write as Job Id + ? + no longer exist. Submit Job Failed
//                        resetFormSaver();
//                        newSaveDividedForm(window.sessionStorage["selected_file"], false, false, '', false);
//                        }, lang.Mobile095, '✔');
                    setTimeout(function () {
                        $.mobile.changePage("#main", {transition: 'fade', reverse: 'true'});
                        window.clearInterval(jobInterval);
                        jobInterval = window.setInterval(function () {
                            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                        }, refreshRate);
                        if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                        spinOut();
                        navigator.notification.alert(lang.Mobile098 + " " + lang.Mobile099, function () { // write as Job Id + ? + no longer exist. Submit Job Failed
                        }, lang.Mobile095, '✔');
                    }, 0);
                }
            },
            timeout: 60000, //1minutes
            error: function (error, errorText, errorThrown) {
                spinOut();
                //console.log("beforesubmitcheckstatus error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown);
                writeLogs("beforesubmitcheckstatus error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown);
//                navigator.notification.alert(lang.Mobile101, function () {
//                }, lang.Mobile095, '✔');
                endPlannedWithoutNetwork(html_file, job_id);
            }
        });

    } else {
        spinOut();
        navigator.notification.alert(empty + " " + lang.Mobile103, function () {
        }, lang.Mobile102, '✔');
    }
}

function endPlannedWithoutNetwork(html_file, job_id)
{
    resetFormSaver();
    newSaveDividedForm(html_file, true, false, '', true);
    getCurrentLocationNew(8,job_id);
}
/* End of Code for Submit Button Click */

// Following function will save the HTML into a file in the mobile with an file extention of .v3
//  3 parts that will use this function : when new job is downloaded, user initial manual save, user submit form
function newSaveDividedForm(html_file, auto_save, is_new_form, new_form_data, is_saving_before_queued)
{
    jobBeingSaved = html_file;
    isAutoSave = auto_save;
    isNewForm = is_new_form;
    newFormData = new_form_data;
    isSavingBeforeQueued = is_saving_before_queued;

    var allHtml = '';

    //fileWriter has been reset, write file
    $('input[type="text"]').each(function () {
        $(this).attr("value", $(this).val());
    });

    $('textarea').each(function () {
        $(this).html($(this).val());
    });

    $('select').each(function () {
        $(this).find('option[value!="' + $(this).val() + '"]').attr("selected", false);
        $(this).find('option[value="' + $(this).val() + '"]').attr("selected", true);

    });
    $('fieldset').each(function () {
        $(this).find('input[type="radio"]:checked').attr("checked", true);
        $(this).find('input[type="radio"]:not(:checked)').removeAttr("checked");
        $(this).find('input[type="checkbox"]:checked').attr("checked", true);
        $(this).find('input[type="checkbox"]:not(:checked)').removeAttr("checked");
    });

    $('input[type="date"]').each(function () {
        $(this).attr("value", $(this).val());
    });

    $('input[type="time"]').each(function () {
        $(this).attr("value", $(this).val());
    });

    $('input[type="datetime-local"]').each(function () {
        $(this).attr("value", $(this).val());
    });

    $('input[type="email"]').each(function () {
        $(this).attr("value", $(this).val());
    });
    $('input[type="number"]').each(function () {
        $(this).attr("value", $(this).val());
    });

    if (isNewForm)
    {
        allHtml = newFormData;
    } else
    {
        allHtml = $("#form_content").html();
    }

    // slice from 0 positon and 5m character
    savedContent = allHtml.slice(nextChunkStartPoint, nextChunkStartPoint + formDividerLimit);
    //console.log('Starts at: ' + nextChunkStartPoint + ', savedContent length: ' + savedContent.length);
    writeLogs("Starts at: " + nextChunkStartPoint + ", savedContent length: " + savedContent.length + " for File Name = " + html_file);

    if (nextChunkStartPoint < allHtml.length) // this check if there a need for v1, if dont need, go delete v1 and continue
    {
        newSaveForm(jobBeingSaved + '-' + savingFilenameIndex, savedContent); // this function ask to save the v0, v1, v2.
        nextChunkStartPoint += formDividerLimit;
        savingFilenameIndex++;
    } else
    {
        resetFormDeleter();
        //newDeleteFile(html_file, savingFilenameIndex); // this is to delete the additional vX created. 

        spinOut();

        if (isAutoSave == false)
        {
            //console.log("newSaveDividedForm manualSave success");
            writeLogs("newSaveDividedForm, manaulSave success. saveBtm Clicked. file Name =  " + html_file);

            navigator.notification.alert(lang.Mobile092, function () {
            }, lang.Mobile091, '✔');
        } else
        {
            console.log("newSaveDividedForm autoSave success");

        }

        if (isSavingBeforeQueued == true)
        {
            queueJob(html_file);
        }
    }
}
// insert the job id of the submitted job into the queue array and update the status of the job to "Uploading" 
function queueJob(html_file)
{
    // Test updateUploading with timeout 30
    // CHS 09 Sept -- Move this portion to after successfully returning to job screen?
    var id = html_file.split("_")[0];
    var tuploadQueue = [];

    var file_exists = false;

    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
        tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");

//        console.log('$$ queue job tuploadQueue size: ' + tuploadQueue.length);
        for (var i = 0; i < tuploadQueue.length; i++)
        {
//            console.log('$$ ' + i + ' -- filename: ' + tuploadQueue[i])
            if (tuploadQueue[i] === html_file)
            {
//                console.log('$$ file exists: ' + tuploadQueue[i])
                file_exists = true;
                break;
            }
        }
    }

    if (file_exists == false)
    {
        tuploadQueue.push(html_file);
        window.localStorage["uploadQueue"] = JSON.stringify(tuploadQueue);
        //console.log("Queue success. tuploadQueue = " + tuploadQueue );
        writeLogs("queueJob, queue success. tuploadQueue = " + tuploadQueue + " File Added to queue = " + html_file);
    } else
    {
        //console.log("$$ Job was already queued. tuploadQueue = " + tuploadQueue);
        writeLogs("queueJob, $$ Job was already queued. tuploadQueue = " + tuploadQueue + " File Name " + html_file);
    }

    // CHS 09 Sept -- Move this portion to after successfully returning to job screen?

    updateUploading();

    function updateUploading()
    {
        var uploadingStatus = "13";

        var now = new Date();
        var now = two(now.getDate()) + two(now.getMonth() + 1) + now.getFullYear() + two(now.getHours()) + two(now.getMinutes()) + two(now.getSeconds());

        var user_id = window.sessionStorage["userID"];
        var asset_id = window.sessionStorage["assetId"];
//        console.log('assetId : ' + asset_id);
        var statuschange_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=statusChange&jobScheduleIds=" + id + "&statusId=" + uploadingStatus
                + "&driverId=" + user_id + "&dateTime=" + now + "&assetId=" + asset_id;
        
//        console.log('AATESTING5 ' + statuschange_URL );
        
        $.ajax({
            url: statuschange_URL,
            type: 'GET',
            timeout: 30000,
            success: function (data) {
                if (data.result)
                {
                    //console.log("statuschange success: Uploading " + html_file);
                    writeLogs("statuschange success: Uploading " + html_file);
                    spinOut();

                    $.mobile.changePage("#main", {transition: 'fade', reverse: 'true'});
                    setTimeout(function () 
                    {
                        // CHX 28 July loadJob("new");
                        if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                        window.clearInterval(jobInterval);
                        jobInterval = window.setInterval(function () {
                            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
                        }, refreshRate);
                    }, 500);
//                    navigator.notification.alert(lang.Mobile105, function () {
                    if (tuploadQueue.length == 1)
                    { //if this is the only job in queue
                        //console.log("No jobs in queue. Starting upload queue now.");
                        writeLogs("No jobs in queue. Starting upload queue now.");
                        newUploadQueue();
                        //uploadQueue(); //start upload immediately
                    } else
                    {
                        writeLogs("Jobs uploading in queue. Job added to queue and pending upload.");
                        //console.log("Jobs uploading in queue. Job added to queue and pending upload.");
                    }
//                    }, lang.Mobile104, '✔');
                } 
                else
                {
                    spinOut();
                    writeLogs("updateUploading,statusChange to Uploading, server send back false");
                    navigator.notification.alert("Please check your connection and try again.", function () {
                    }, "No Response from Server", '✔');
                }
            },
            error: function (error, errorText, errorThrown) {
                spinOut();
                writeLogs("statuschange uploading error: " + error.responseText + " errorText: " + errorText + " errorThrown: " + errorThrown)
                newPendingStatus(id, uploadingStatus, now, user_id, asset_id);
                uploadPlannedWithoutNetwork();
            }
        });
    }
    
    function uploadPlannedWithoutNetwork()
    {
        $.mobile.changePage("#main", {transition: 'fade', reverse: 'true'});
        setTimeout(function () 
        {
            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
            window.clearInterval(jobInterval);
            jobInterval = window.setInterval(function () {
                if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
            }, refreshRate);
        }, 500);
    //                    navigator.notification.alert(lang.Mobile105, function () {

        if (tuploadQueue.length == 1)
        { //if this is the only job in queue
            writeLogs("No jobs in queue. Starting upload queue now.");
            newUploadQueue();
        } 
        else
        {
            writeLogs("Jobs uploading in queue. Job added to queue and pending upload.");
        }
    }
}


$( document ).on( "pageshow", "#main", function( event ) 
{
    isInForm = false;
    
    var uploadQueueArr = [];
    
    if (window.localStorage["uploadQueue"])
    {
        uploadQueueArr = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
    //    console.log('xxx uploadQueueArr: ' + uploadQueueArr);

        $('ul li').each(function(i)
        {
            var liName = $(this).attr('name'); // This is your rel value
    //        console.log('xxx liName = ' + liName);

            for (var i = 0 ; i < uploadQueueArr.length ; i++)
            {
                if (uploadQueueArr[i] == liName)
                {
    //                console.log('xxx hey same! remove plx')
                    var jobCount = $('#main .jobCount span').text();
                    var newJobCount = parseInt(jobCount, 10) - 1;
                    $('#main .jobCount span').html(newJobCount);
                    $(this).remove();
                    break;
                }
            }
        });
    }
    
    // CHX2019
    if (appDirectory != undefined && uploadDirectory != undefined) 
    {
        setTimeout(function () 
        {
            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
            window.clearInterval(jobInterval);
            jobInterval = window.setInterval(function () {
                if (isJobHistoryCheck  == true) 
                {
                    if (autoRefresh == true) loadHistoryJob("all"); 
                } 
                else 
                {
                    if (autoRefresh == true) loadJob("all"); 
                }
            }, refreshRate);
        }, 1000);
    } 
    else 
    {
        setTimeout(function () {
            if (isJobHistoryCheck  == true) {loadHistoryJob("all"); } else {loadJob("all"); }
            window.clearInterval(jobInterval);
            jobInterval = window.setInterval(function () {
                if (isJobHistoryCheck  == true) 
                {
                    if (autoRefresh == true) loadHistoryJob("all"); 
                } 
                else 
                {
                    if (autoRefresh == true) loadJob("all"); 
                }
            }, refreshRate);
        }, 400);
    }
    
    if ($('#mainSelectedDate').val() !== '')
    {
        document.getElementById("calendarNav").style.visibility = "visible";
        document.getElementById("logoutNav").style.visibility = "hidden";
    }
    else
    {
        document.getElementById("calendarNav").style.visibility = "hidden";
        document.getElementById("logoutNav").style.visibility = "visible";
    }
    
});


function newPendingStatus(jobId, statusId, time, userId, assetId)
{
    if (window.localStorage["pendingJobId"])
    {
        var pendingJobId = window.localStorage["pendingJobId"].split(',');
        var pendingStatusId = window.localStorage["pendingStatusId"].split(',');
        var pendingTime = window.localStorage["pendingTime"].split(',');
        var pendingUserId = window.localStorage["pendingUserId"].split(',');
        var pendingAssetId = window.localStorage["pendingAssetId"].split(',');

    }
    else
    {
        var pendingJobId = [];
        var pendingStatusId = [];
        var pendingTime = [];
        var pendingUserId = [];
        var pendingAssetId = [];
    }
    
    pendingJobId.push(jobId);
    pendingStatusId.push(statusId);
    pendingTime.push(time);
    pendingUserId.push(userId);
    pendingAssetId.push(assetId);

    window.localStorage["pendingJobId"] = pendingJobId.join();
    window.localStorage["pendingStatusId"] = pendingStatusId.join();
    window.localStorage["pendingTime"] = pendingTime.join();
    window.localStorage["pendingUserId"] = pendingUserId.join();
    window.localStorage["pendingAssetId"] = pendingAssetId.join();
}


function sendPendingStatusUpdates()
{
    if (window.localStorage["pendingJobId"])
    {
        var pendingJobId = window.localStorage["pendingJobId"].split(',');
        var pendingStatusId = window.localStorage["pendingStatusId"].split(',');
        var pendingTime = window.localStorage["pendingTime"].split(',');
        var pendingUserId = window.localStorage["pendingUserId"].split(',');
        var pendingAssetId = window.localStorage["pendingAssetId"].split(',');

        
        /*
         * 
         uploading
        var statuschange_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=statusChange&jobScheduleIds=" + id + "&statusId=" + uploadingStatus
                + "&driverId=" + user_id + "&dateTime=" + now + "&assetId=" + asset_id;
        
        startjob
            var statuschange_URL = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=statusChange&jobScheduleIds=" + job_id
                + "&statusId=" + startedStatus + "&dateTime=" + now + "&assetId=" + asset_id;
        
         * 
         * 
         */
        
        var userId = 0;
        if (parseInt(pendingUserId[0],10) > 0)
        {
            userId = parseInt(pendingUserId[0],10);
        }
        
        var url = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=statusChange&"
                    + "jobScheduleIds=" + pendingJobId[0] 
                    + "&statusId=" + pendingStatusId[0]
                    + "&driverId=" + userId
                    + "&dateTime=" + pendingTime[0] 
                    + "&assetId=" + pendingAssetId[0];
        
//        console.log('xxx sendPendingStatusUpdates: ' + url)
        
        $.ajax({
            url: url,
            type: 'GET',
            timeout: 30000,
            success: function (data) 
            {
                // send regardless of data.result, in case job got deleted.
                pendingJobId.shift();
                pendingStatusId.shift();
                pendingTime.shift();
                pendingUserId.shift();
                pendingAssetId.shift();

                window.localStorage["pendingJobId"] = pendingJobId.join();
                window.localStorage["pendingStatusId"] = pendingStatusId.join();
                window.localStorage["pendingTime"] = pendingTime.join();
                window.localStorage["pendingUserId"] = pendingUserId.join();
                window.localStorage["pendingAssetId"] = pendingAssetId.join(); 
            },
            error: function (error, errorText, errorThrown) {
//                console.log('xxx still no network...');
            }
        });
    }
    else
    {
//        console.log('xxx no more pendings to upload...')
    }
}




/* Utilities Function */

/*  Date & Time Function  */


function two(num) {
    var num = ("0" + num).slice(-2);
    return num;
}
function mth(num) {
    var month = "";
    switch (num) {
        case 1:
            month = "Jan";
            break;
        case 2:
            month = "Feb";
            break;
        case 3:
            month = "Mar";
            break;
        case 4:
            month = "Apr";
            break;
        case 5:
            month = "May";
            break;
        case 6:
            month = "Jun";
            break;
        case 7:
            month = "Jul";
            break;
        case 8:
            month = "Aug";
            break;
        case 9:
            month = "Sep";
            break;
        case 10:
            month = "Oct";
            break;
        case 11:
            month = "Nov";
            break;
        case 12:
            month = "Dec";
            break;
        default:
            month = num;
            break;
    }
    return month;
}

// Get Date time in different format
function getCurrentDateTime(mode) {
    var now = new Date();
    var currentDateTime = "";
    switch (mode) {
        case 1:  //display both
            currentDateTime = two(now.getDate()) + "/"
                    + two(now.getMonth() + 1) + "/"
                    + two(now.getFullYear()) + " "
                    + two(now.getHours()) + ":"
                    + two(now.getMinutes()) + ":"
                    + two(now.getSeconds());
            break;
        case 2: // hide date display time
            currentDateTime = two(now.getHours()) + ":"
                    + two(now.getMinutes()) + ":"
                    + two(now.getSeconds());
            break;
        case 3: // display date hide time
            currentDateTime = two(now.getDate()) + "/"
                    + two(now.getMonth() + 1) + "/"
                    + two(now.getFullYear());
            break;
        case 4: // this is special case, to show the month as Jan/Feb
            currentDateTime = two(now.getDate()) + " "
                    + mth(now.getMonth() + 1) + " "
                    + now.getFullYear() + " "
                    + two(now.getHours()) + ":"
                    + two(now.getMinutes()) + ":"
                    + two(now.getSeconds());
            break;
        case 5: // date for system files etc, log file
            currentDateTime = two(now.getDate()) + "-"
                    + two(now.getMonth() + 1) + "-"
                    + two(now.getFullYear());
            break;
        default:
            currentDateTime = "";
            break;
    }
    return currentDateTime;
}
function rebindMainJobList() { // using .one function so that user dont spam click and cause problem to the loading of the form. This will rebind the joblist with .one so user can continue clicking
    $('#main .jobList li').off('click');
    $('#main .jobList li').one('click', function (e) {
        if ($(this).attr('name') != null && $(e.target).attr('class') != "job-value job-navigate") {
            
            var timeleft = jobDuration;
            jobEndedInTime = false ;
            jobDurationTimer = setInterval(function(){
                timeleft--;
                if(timeleft <= 0){
                        clearInterval(jobDurationTimer);
                        jobEndedInTime = true ;  
                }
            },1000); 
            
            goForm($(this).attr('job_id'), $(this).attr('name'), $(this).attr('job_name'), $(this).attr('job_type_id'), $(this).attr('job_status'), false);
        }
    });
}
// when take photo, save image to user mobile gallery if form field enable "save to gallery" 
function saveProcessedImage(base64String)
{
    var jobId = window.sessionStorage["selected_id"];
    var params = {data: base64String, prefix: 'JOB_' + jobId + '_', format: 'JPG', quality: 100, mediaScanner: true};
    window.imageSaver.saveBase64Image(params,
            function (filePath) {
                writeLogs("File saved on " + filePath);
                //console.log('File saved on ' + filePath);
            },
            function (msg) {
                //console.error(msg);
                writeLogs("Saving Processed Image Error " + msg);
            }
    );
}


function stat(status) { //give status id and returns status in string
    status = parseInt(status); //convert to int
    var stat = "";
    switch (status) {
        case 0:
            stat = "<mark style='background-color:#000000;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile040 + "</mark>";
            break;
        case 1:
            stat = "<mark style='background-color:#AE9A9A;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile041 + "</mark>";
            break;
        case 2:
            stat = "<mark style='background-color:#6BAC61;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile039 + "</mark>";
            break;
        case 3:
            stat = "<mark style='background-color:#000000;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile042 + "</mark>";
            break;
        case 4:
            stat = "<mark style='background-color:#000000;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile043 + "</mark>";
            break;
        case 5:
            stat = "<mark style='background-color:#FFBC00;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile044 + "</mark>";
            break;
        case 6:
            stat = "<mark style='background-color:#000000;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile045 + "</mark>";
            break;
        case 7:
            stat = "<mark style='background-color:#70E15E;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile046 + "</mark>";
            break;
        case 8:
            stat = "<mark style='background-color:#66A9FF;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile047 + "</mark>";
            break;
        case 9:
            stat = "<mark style='background-color:#000000;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile048 + "</mark>";
            break;
        case 10:
            stat = "<mark style='background-color:#000000;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile049 + "</mark>";
            break;
        case 11:
            stat = "<mark style='background-color:#000000;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile050 + "</mark>";
            break;
        case 12:
            stat = "<mark style='background-color:#CBA2E4;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile051 + "</mark>";
            break;
        case 13:
            stat = "<mark style='background-color:#30ECEF;border-radius:5px;padding:0 10px;color:#FFF;'>" + lang.Mobile052 + "</mark>";
            break;
        default:
            stat = "<mark style='background-color:#000000;border-radius:5px;padding:0 10px;color:#FFF;'>" + status + "</mark>";
            break;
    }
    return stat;
}

function ratingsSummary() {
    var arr = [];
    var score = 0;
    var ratingNum = 0;
    var percentage = 0;
    var max = $('.ratings').attr("data-max");

    $('input[class="rating-input"]:checked').each(function () {
        if (this.value == 0.1) {
            ratingNum++;
        } else if (parseInt(this.value) != 0) {
            score += parseInt(this.value);
            ratingNum++;
        }
        percentage = ((score / (ratingNum * max)) * 100).toFixed(2);
    });
    arr.push(score);
    arr.push(percentage);
    return arr;
}


// sorting algo for Wifiwizard.
var sort_by;
(function () {
    // utility functions
    var default_cmp = function (a, b) {
        if (a == b)
            return 0;
        return a < b ? -1 : 1;
    },
            getCmpFunc = function (primer, reverse) {
                var dfc = default_cmp, // closer in scope
                        cmp = default_cmp;
                if (primer) {
                    cmp = function (a, b) {
                        return dfc(primer(a), primer(b));
                    };
                }
                if (reverse) {
                    return function (a, b) {
                        return -1 * cmp(a, b);
                    };
                }
                return cmp;
            };

    // actual implementation
    sort_by = function () {
        var fields = [],
                n_fields = arguments.length,
                field, name, reverse, cmp;

        // preprocess sorting options
        for (var i = 0; i < n_fields; i++) {
            field = arguments[i];
            if (typeof field === 'string') {
                name = field;
                cmp = default_cmp;
            } else {
                name = field.name;
                cmp = getCmpFunc(field.primer, field.reverse);
            }
            fields.push({
                name: name,
                cmp: cmp
            });
        }

        // final comparison function
        return function (A, B) {
            var a, b, name, result;
            for (var i = 0; i < n_fields; i++) {
                result = 0;
                field = fields[i];
                name = field.name;

                result = field.cmp(A[name], B[name]);
                if (result !== 0)
                    break;
            }
            return result;
        }
    }
}());


// * Start of Queue Page */ Currently not activated. Not sure what exacting does this do. 

var queuePointer = ""; //yyy

function initQueueList() { //yyy
    $("#queue .backBtn").unbind('click');
    $("#queue .queueList li .upBtn").unbind('click');
    $("#queue .queueList li .delBtn").unbind('click');
    // $("#queue .logView").html("");
    $("#queue .logView").hide();
    $("#queue .logBtn img").attr("src", "img/info_off.png");
    $("#queue .queueList ul").html("");
    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
        var tuploadQueue = [];
        tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");

        for (i = 0; i < tuploadQueue.length; i++) {
            $("#queue .queueList ul").append("<li><div>" + tuploadQueue[i] + "</div><span class='upBtn'>UPL</span><span class='delBtn'>DEL</span></li>")
        }
    } else {
        $("#queue .queueList ul").html("No job currently in queue.");
    }

    $("#queue .backBtn").bind('click', function () {
        $("#queue .logView").hide();
        queuePointer = "";
        $.mobile.changePage("#main", {transition: 'flip', reverse: 'true'});
    })

    $("#queue .logBtn").bind('click', function () {
        if ($("#queue .logBtn img").attr("src") == "img/info_off.png") {
            $("#queue .logBtn img").attr("src", "img/info_on.png");
        } else {
            $("#queue .logBtn img").attr("src", "img/info_off.png");
        }
        $("#queue .logView").toggle();
    })

    $("#queue .queueList li .upBtn").bind('click', function () {
        queuePointer = $(this).parent().find("div").html();
        navigator.notification.confirm(
                "Confirm upload " + queuePointer + "? \nDo not attempt to upload another job before this current one finishes.\nIf you face any issue during the upload, please screenshot the message.",
                confirmUpQueue,
                "Confirm Upload Job",
                ["NO", "YES"]
                );
    })

    $("#queue .queueList li .delBtn").bind('click', function () {
        queuePointer = $(this).parent().find("div").html();
        navigator.notification.confirm(
                "Confirm delete " + queuePointer + "? \nThis job will be removed from the queue.",
                confirmDelQueue,
                "Confirm Delete Job",
                ["NO", "YES"]
                );
    })
}
// Do we still need this queue page?

function singleQueueUpload() { //yyy
    $("#queue .logView").append("Starting single upload function.<br>");
    $("#queue .logView").show();
    $("#queue .logView").html("");

    var html_file = queuePointer;
    $("#queue .logView").append("Uploading " + html_file + ".<br>");
    if (html_file != "") {
        $("#queue .logView").append("File name is not null" + ".<br>");
        var id = html_file.split("_")[0];
        var driver_id = window.sessionStorage["userID"];
        var asset_id = window.sessionStorage["assetId"];
        var version_no = localStorage.getItem("version");

        $("#queue .logView").append("ID=" + id + ", DRIVER_ID=" + driver_id + ".<br>");
        $("#queue .logView").append("Looking for file in appDirectory" + ".<br>");
        appDirectory.getFile(html_file, {create: false}, function (fileEntry) {
            $("#queue .logView").append("appDirectory.getFile Success.<br>");
            fileEntry.file(uploadWin, uploadFail);
        }, uploadFail);

        function uploadWin(file) {
            $("#queue .logView").append("File is found" + ".<br>");
            var reader = new FileReader();
            $("#queue .logView").append("Created new FileReader" + ".<br>");
            reader.onloadend = function (evt) {
                $("#queue .logView").append("FileReader onloadend" + ".<br>");
                var endedStatus = "8";
                var details = Base64.encode(evt.target.result);
                if (details != null && details != undefined) {
                    $("#queue .logView").append("File content is not null or undefined" + ".<br>");
                } else {
                    $("#queue .logView").append("File content is: " + details + "<br>");
                }
                $("#queue .logView").append("Forming JSONText" + ".<br>");
                var JSONText = {};
                JSONText.job_id = parseInt(id);
                JSONText.driver_id = parseInt(driver_id);
                JSONText.asset_id = parseInt(asset_id); //xxxx
                JSONText.status_id = parseInt(endedStatus);
                JSONText.version_no = version_no;
                JSONText.details = details;
                JSONText = JSON.stringify(JSONText);
                $("#queue .logView").append("JSONText formed success" + ".<br>");
                var upload_url = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=upload";
                
                console.log('AATESTING2 ' + upload_url + "AATESTING2 JSON :-" + JSONText);
                
                $("#queue .logView").append("Uploading JSON To: " + upload_url + "<br>");
                $("#queue .logView").append("Waiting response from server." + ".<br>");
                $.ajax({
                    type: 'POST',
                    url: upload_url,
                    data: JSONText,
                    contentType: "application/json",
                    dataType: "json",
                    cache: false,
                    timeout: 300000,
                    success: function (data) {
                        if (data.result) {
                            $("#queue .logView").append("Upload File Success. id=" + id + "<br>");
                            $("#queue .logView").append("DeleteFunction: Starting function to delete physical file." + ".<br>");
                            deleteUploaded(); //delete uploaded file

                            $("#queue .logView").append("Removing " + html_file + " filename from Queuelist" + ".<br>");
                            $("#queue .logView").append("Getting Queuelist" + ".<br>");
                            var tuploadQueue = [];
                            if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
                                tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
                            }
                            $("#queue .logView").append("Current Queuelist= " + tuploadQueue.toString() + "<br>");
                            var index = tuploadQueue.indexOf(html_file);
                            tuploadQueue.splice(index, 1);
                            $("#queue .logView").append("Removing index=" + index + " job from the list.<br>");
                            window.localStorage["uploadQueue"] = JSON.stringify(tuploadQueue);
                            $("#queue .logView").append("New Queuelist= " + window.localStorage["uploadQueue"] + "<br>");
                            $('.uploadCount span').html(tuploadQueue.length); //update Upload count
                            $("#queue .logView").append("Queue Length= " + tuploadQueue.length + "<br>");
                            $("#queue .logView").append("Finished. Closing log in 3 seconds.<br>");
                            setTimeout(function () {
                                $("#queue .logView").hide();
                                initQueueList()
                            }, 3000)
                        } else {
                            $("#queue .logView").append("Upload File Failed. Response result is false. id=" + id + "<br>");
                            $("#queue .logView").append("Please take a screenshot of this log.<br>Press the back button on the top left to exit.<br>");
                        }
                    },
                    //timeout: 540000, //180000
                    error: function (error, errorText, errorThrown) {
                        $("#queue .logView").append("Server response throws error. error: " + error + " errorText: " + errorText + " errorThrown: " + errorThrown + "<br>");
                        $("#queue .logView").append("Please take a screenshot of this log.<br>Press the back button on the top left to exit.<br>");
                    }
                });
            };
            reader.readAsText(file);
        }
        ;

        function uploadFail(error) {
            console.log("uploadFail");
            $("#queue .logView").append("Unable to find file in appDirectory. Error Code: " + error.code + ". Attempt to find file in uploadDirectory.<br>");
            uploadDirectory.getFile(html_file, {create: false}, function (fileEntry) {
                $("#queue .logView").append("uploadDirectory.getFile Success.<br>");
                fileEntry.file(uploadWin, uploadFail2);
            }, uploadFail2);
        }

        function uploadFail2(error) {
            console.log("uploadFail2");
            $("#queue .logView").append("Unable to find file in uploadDirectory. Error Code: " + error.code + ".<br>");
            $("#queue .logView").append("File in queue does not exist anymore.<br>");
            $("#queue .logView").append("Removing " + html_file + " filename from Queuelist" + ".<br>");
            $("#queue .logView").append("Getting Queuelist" + ".<br>");
            var tuploadQueue = [];
            if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
                tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
            }
            $("#queue .logView").append("Current Queuelist= " + tuploadQueue.toString() + "<br>");
            var index = tuploadQueue.indexOf(html_file);
            tuploadQueue.splice(index, 1);
            $("#queue .logView").append("Removing index=" + index + " job from the list.<br>");
            window.localStorage["uploadQueue"] = JSON.stringify(tuploadQueue);
            $("#queue .logView").append("New Queuelist= " + window.localStorage["uploadQueue"] + "<br>");
            $('.uploadCount span').html(tuploadQueue.length); //update Upload count	
            $("#queue .logView").append("Queue Length= " + tuploadQueue.length + "<br>");
            $("#queue .logView").append("Finished. Closing log in 3 seconds.<br>");
            setTimeout(function () {
                $("#queue .logView").hide();
                initQueueList()
            }, 3000)
        }

        function deleteUploaded() {
            $("#queue .logView").append("DeleteFunction: Looking for file in appDirectory" + ".<br>");
            appDirectory.getFile(html_file, {create: false}, function (fileEntry) {
                $("#queue .logView").append("DeleteFunction: appDirectory.getFile Success.<br>");
                fileEntry.remove(function () {
                    $("#queue .logView").append("DeleteFunction: Delete physical file form appDirectory Success.<br>");
                }, function () {
                    $("#queue .logView").append("DeleteFunction: Delete physical file form appDirectory Failed.<br>");
                    deleteUploaded();
                    $("#queue .logView").append("DeleteFunction: Calling delete function again.<br>");
                });
            }, function () {
                $("#queue .logView").append("DeleteFunction: Unable to find file in appDirectory. Error Code: " + error.code + ". Attempt to find file in uploadDirectory.<br>");
                uploadDirectory.getFile(html_file, {create: false}, function (fileEntry) {
                    $("#queue .logView").append("DeleteFunction: uploadDirectory.getFile Success.<br>");
                    fileEntry.remove(function () {
                        $("#queue .logView").append("DeleteFunction: Delete physical file form appDirectory Success.<br>");
                    }, function () {
                        $("#queue .logView").append("DeleteFunction: Delete physical file form appDirectory Failed.<br>");
                        deleteUploaded();
                        $("#queue .logView").append("DeleteFunction: Calling delete function again.<br>");
                    });
                }, function () {
                    $("#queue .logView").append("DeleteFunction: Unable to find file in uploadDirectory. Error Code: " + error.code + ".<br>");
                    $("#queue .logView").append("DeleteFunction: Physical file does not exist for unknown reason.");
                    $("#queue .logView").append("Please take a screenshot of this log.<br>Press the back button on the top left to exit.<br>");
                });
            });
        }
    } else {
        $("#queue .logView").append("File name is null.<br>");
        $("#queue .logView").append("Removing " + html_file + " filename from Queuelist" + ".<br>");
        $("#queue .logView").append("Getting Queuelist" + ".<br>");
        var tuploadQueue = [];
        if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
            tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
        }
        $("#queue .logView").append("Current Queuelist= " + tuploadQueue.toString() + "<br>");
        var index = tuploadQueue.indexOf(html_file);
        tuploadQueue.splice(index, 1);
        $("#queue .logView").append("Removing index=" + index + " job from the list.<br>");
        window.localStorage["uploadQueue"] = JSON.stringify(tuploadQueue);
        $("#queue .logView").append("New Queuelist= " + window.localStorage["uploadQueue"] + "<br>");
        $('.uploadCount span').html(tuploadQueue.length); //update Upload count	
        $("#queue .logView").append("Queue Length= " + tuploadQueue.length + "<br>");
        $("#queue .logView").append("Finished. Closing log in 3 seconds.<br>");
        setTimeout(function () {
            $("#queue .logView").hide();
            initQueueList()
        }, 3000)
    }
}

function singleQueueDelete() { //yyy

    console.log("singleQueueDelete");
    $("#queue .logView").append("Starting single delete function.<br>");
    $("#queue .logView").show();
    $("#queue .logView").html("");

    var html_file = queuePointer;
    $("#queue .logView").append("Deleting " + html_file + ".<br>");

    $("#queue .logView").append("DeleteFunction: Looking for file in appDirectory" + ".<br>");
    appDirectory.getFile(html_file, {create: false}, function (fileEntry) {
        $("#queue .logView").append("DeleteFunction: appDirectory.getFile Success.<br>");
        fileEntry.remove(function () {
            $("#queue .logView").append("DeleteFunction: Delete physical file form appDirectory Success.<br>");
        }, function () {
            $("#queue .logView").append("DeleteFunction: Delete physical file form appDirectory Failed.<br>");
            deleteUploaded();
            $("#queue .logView").append("DeleteFunction: Calling delete function again.<br>");
        });
    }, function (error) {
        $("#queue .logView").append("DeleteFunction: Unable to find file in appDirectory. Error Code: " + error.code + ". Attempt to find file in uploadDirectory.<br>");
        uploadDirectory.getFile(html_file, {create: false}, function (fileEntry) {
            $("#queue .logView").append("DeleteFunction: uploadDirectory.getFile Success.<br>");
            fileEntry.remove(function () {
                $("#queue .logView").append("DeleteFunction: Delete physical file form appDirectory Success.<br>");
            }, function () {
                $("#queue .logView").append("DeleteFunction: Delete physical file form appDirectory Failed.<br>");
                deleteUploaded();
                $("#queue .logView").append("DeleteFunction: Calling delete function again.<br>");
            });
        }, function (error) {
            $("#queue .logView").append("DeleteFunction: Unable to find file in uploadDirectory. Error Code: " + error.code + ".<br>");
            $("#queue .logView").append("DeleteFunction: Physical file does not exist anymore.<br>");
            $("#queue .logView").append("Finished. Closing log in 3 seconds.<br>");
            setTimeout(function () {
                $("#queue .logView").hide();
                initQueueList()
            }, 3000)
        });
    });

    $("#queue .logView").append("Removing " + html_file + " filename from Queuelist" + ".<br>");
    $("#queue .logView").append("Getting Queuelist" + ".<br>");
    var tuploadQueue = [];
    if (localStorage.getItem("uploadQueue") != "[]" && localStorage.getItem("uploadQueue") != null) {
        tuploadQueue = JSON.parse(window.localStorage["uploadQueue"]).toString().split(",");
    }
    $("#queue .logView").append("Current Queuelist= " + tuploadQueue.toString() + "<br>");
    var index = tuploadQueue.indexOf(html_file);
    tuploadQueue.splice(index, 1);
    $("#queue .logView").append("Removing index=" + index + " job from the list.<br>");
    window.localStorage["uploadQueue"] = JSON.stringify(tuploadQueue);
    $("#queue .logView").append("New Queuelist= " + window.localStorage["uploadQueue"] + "<br>");
    $('.uploadCount span').html(tuploadQueue.length); //update Upload count	
    $("#queue .logView").append("Queue Length= " + tuploadQueue.length + "<br>");
    $("#queue .logView").append("Finished. Closing log in 3 seconds.<br>");
    setTimeout(function () {
        $("#queue .logView").hide();
        initQueueList()
    }, 3000)
}

function confirmUpQueue(response) { //yyy
    if (response == 2) { //if Yes
        singleQueueUpload();
    } else {
        //else do nothing
    }
}

function confirmDelQueue(response) { //yyy

    console.log("confirmDelQueue : response = " + response);
    if (response == 2) { //if Yes
        singleQueueDelete();
    } else {
        //else do nothing
    }
}

function checkBeaconJob(id) 
{
    rebindMainJobList();
    var output = false;
    var form = $('#main .jobList li[job_id=' + id + ']').children(".job-preview");
    
    if ((form.children('.job-preview-value-bluetooth').text() === '')||(form.children('.job-preview-value-bluetooth').text() === null))
    {
        output = true;
        
        // -1 means not a beacon job
        startJobBeaconId = '-1';
    }
    else
    {
        var beaconId = checkLastDetectedBeacons(form.children('.job-preview-value-bluetooth').text());
        
        if (beaconId !== '')
        {
            output = true;
            startJobBeaconId = beaconId;
        }
    }
    
    return output;
    
}


async function deleteUploadJobFile() { // this is to delete the upload job file > 7 days.
    console.log("deletingFileUploaded");
    var lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 8);

    var directoryReader = appDirectory.createReader();
    directoryReader.readEntries(readAllFilesSuccess, readAllFilesFail);

    function readAllFilesFail(error) {
        alert("Failed to list directory contents: " + error.code);
    }
    function readAllFilesSuccess(entries) {
        
        synArr = [];
        var strdata = "Uploaded";
        
        for (var i = 0; i < entries.length; i++) {
            if(entries[i].isFile) {
                entries[i].file(function (file) {
                    if(file.name.length > 15) {
                        
                        var strfilename = file.name.toString();
                        
                        if (strfilename.includes(strdata)) {
                            
                                var getDatePart = file.name.split("_");
                                var fileDateText = getDatePart[1];
                                var year = fileDateText.substring(0, 4);
                                var month = fileDateText.substring(4, 6);
                                var dt = fileDateText.substring(6, 8);       
                                var fileDate = new Date(year +"-" + month +"-" + dt);
                                if (lastWeekDate.getTime() > fileDate.getTime()) {
                                    appDirectory.getFile(file.name, {create: false}, function (fileEntry) {
                                        console.log("removing file name " + file.name);
                                        fileEntry.remove(function () {
                                            console.log('File removed.');
                                        }, errorCallback);
                                    }, errorCallback1);
                                }                            
                            
                        }

                    }
                });                
            }
        }
    }
    function errorCallback(error) {
        console.log("ERROR with removing file: " + error.code)
    }
    function errorCallback1(error) {
        console.log("ERROR with finding file : " + error.code)
    }
}


async function showUploadJobFile() { 
    
    var directoryReader = appDirectory.createReader();
    directoryReader.readEntries(readAllFilesSuccess, readAllFilesFail);

    function readAllFilesFail(error) {
        alert("Failed to list directory contents: " + error.code);
    }
    function readAllFilesSuccess(entries) {
        
        synArr = [];
        
        $('#syncjobList .jobItemList ul').html('');
        
        jobsLoaded = 0;
        allJob = [];

        arrCount = 0;
        arrSyncJob = [];  
        uploadCount = 0;
        var strdata = "Uploaded";
        
        
        for (var i = 0; i < entries.length; i++) {
            if(entries[i].isFile) {
                entries[i].file(function (file) {
                    if(file.name.length > 15) {
                        var strfilename = file.name.toString();
                        
                        if (strfilename.includes(strdata)) {

                            var getDatePart = file.name.split("_");
                            var fileDateText = getDatePart[1];
                            var year = fileDateText.substring(0, 4);
                            var month = fileDateText.substring(4, 6);
                            var dt = fileDateText.substring(6, 8);       
                            var fileDate = new Date(year +"-" + month +"-" + dt);
                            var id = getDatePart[0];
                            console.log('File read ' + file.name );
                            synArr.push([id,file.name]);
                            appDirectory.getFile(file.name, {create: false}, function (fileEntry) {
                                    fileEntry.file(function(fileObj) {

                                        var oFReader = new FileReader();
                                        oFReader.readAsDataURL(file);
                                        oFReader.onload = function (oFREvent) {

                                                var str = oFREvent.target.result;
                                                var htmlpart = str.split(',');
                                                var contentdata = Base64.decode(htmlpart[1]); ;

                                                var  filesize;
                                                filesize = ((fileObj.size)/1024);
                                                filesize = filesize.toFixed(2);
                                                console.log("actual size " + filesize + "KB"); 
                                                var job_type_id = id;
                                                $('#syncjobList .jobItemList ul').append("<li name='" + id + "' job_name='" + file.name + "' job_id='" + htmlpart[1] + "' job_base64='" + job_type_id   + "'>" +
                                                    "<span class='job-title'><img src='img/id.png' /><span class='job-value job-id'>" + "<mark style='background-color:#008000;border-radius:5px;padding:0 10px;color:#FFF;'>" + id + "</mark>" + "</span></span><br>" +
                                                    "<span class='job-title'><img src='img/schedule.png' /><span class='job-value job-dt'>" + dt + "-" + month + "-" + year + "</span></span><br>" +
                                                    "<span class='job-title'><img src='img/status.png' /><span class='job-value job-status'>" +  "<mark style='background-color:#FF8C00;border-radius:5px;padding:0 10px;color:#FFF;'>" + filesize + " KB" + "</mark>" + "</span></span><br>" +
                                                    "</li>");
                                                uploadCount = uploadCount +1;
                                                $('#syncjobList .uploadCount span').html(uploadCount); 
                                                $('#syncjobList .jobItemList li').off('click');
                                                $('#syncjobList .jobItemList li').one('click', function () 
                                                {
                                                    console.log("A21");
                                                    navigator.notification.confirm(
                                                        lang.Mobile111,
                                                        uploadFileToServer($(this).attr('name'),$(this).attr('job_id')),
                                                        lang.Mobile112,
                                                        ["✘", "✔"]
                                                    );
                                                     
                                                      //uploadFileToServer($(this).attr('name'),$(this).attr('job_id'));
                                                      
                                                });   

                                        };                                    

                                    }, function(error) {
                                        console.log('file entry error' + error);
                                    });                             
                            }, errorCallback1);                        
                            
                            
                        }
                        
                    }
                    
                    ///
                });                
            }
        }
        
    }
    function errorCallback(error) {
        console.log("ERROR with removing file: " + error.code)
    }
    function errorCallback1(error) {
        console.log("ERROR with finding file : " + error.code)
    }
}

function uploadFileToServer(jobId,base64Html) // will come to here when there is no more file to read from. 
{

    var id = jobId;
    var driver_id = window.sessionStorage["userID"];
    var asset_id = window.sessionStorage["assetId"];
    var version_no = localStorage.getItem("version");

    var endedStatus = "8";
    var details = base64Html;
    var JSONText = {};

    JSONText.job_id = parseInt(id);
    JSONText.driver_id = parseInt(driver_id);
    JSONText.asset_id = parseInt(asset_id); 
    JSONText.version_no = version_no;
    JSONText.status_id = parseInt(endedStatus);
    JSONText.details = details;
    JSONText = JSON.stringify(JSONText);
    
    spinIn();

    var upload_url = databaseIP + "/Controller/mobile_controller.jsp?type=job&action=upload&jobId=" + id + "&assetId=" + asset_id + "&detailsLength=" + details.length + "&driverId=" + driver_id;

    $.ajax({
        type: 'POST',
        url: upload_url,
        data: JSONText,
        contentType: "application/json",
        dataType: "json",
        cache: false,
        timeout: 300000, // 30000
        beforeSend: function () {
            writeLogs("openFileUploadFail, uploading file Name = " + jobBeingUploaded);
        },
        success: function (data)
        {
            console.log('Uploading data result: ' + data.result);
            if (data.result)
            {
                spinOut();
               
                clearTimeout(uploadInterval); // not to have two instant of uploadInterval occuring at the same time, therefore, clear first before re-initatiate.
                uploadInterval = setTimeout(function () {
                   
                }, uploadDelay); //calls again after 30seconds
            } else
            {
               spinOut(); 
            }
        },
        error: function (error, errorText, errorThrown) {
            spinOut();

        }
    });
}


function renameJobUploadedFile(html_file, startIndex)
{
    var nextIndex = deletingFilenameIndex + parseInt(startIndex, 10);

    appDirectory.getFile(html_file + '-' + nextIndex, {create: false},
            function (fileEntry)
            { 
                fileEntry.moveTo(appDirectory,html_file + "Uploaded",renameSuccess,renameFail);   
            },
            function (err)
            {
               
            }
    );
}

//and the sample success function
function renameSuccess() {
    console.log('renamed!');
}

//and the sample fail function
function renameFail() {
    console.log('failed');
}
