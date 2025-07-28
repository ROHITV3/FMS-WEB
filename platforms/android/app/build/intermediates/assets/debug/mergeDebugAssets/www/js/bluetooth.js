/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global ble */

var referenceId;
var referenceType;
var lat = "0";
var lng = "0";
var eventId = 0;
var count = 0;
var beaconArray = [];
var strongestBeaconRefId = '';
var strongestBeaconSignal = -999;

var startJobBeaconDetected = false;

var bluetoothRequestMade = false;


    function checkBluetoothInterval()
    {
        var beacons = JSON.parse(window.sessionStorage.getItem("beaconId"));
//        console.log('beacons', beacons)
        if (beacons.length > 0) 
        {
            checkBluetooth(beacons);
        }
    }

    function checkBluetooth(beacons) 
    {
        beaconArray = [];
        
        ble.isEnabled(
            function success()
            {
//                console.log('bluetooth is already enabled')
                scan(beacons);
            },
            function failed()
            {
                if (bluetoothRequestMade === false)
                {
                    bluetoothRequestMade = true;
                    
                    ble.enable(
                            function enableOk()
                            {
    //                            console.log('bluetooth is NOW ENABLED')
                                scan(beacons);
                            },
                            function enableFail()
                            {
    //                            console.log('bluetooth enabling FAILED');
                            }
                        );
                }
            }
        );
            
        //ble.enable(scan(beacons));
    }

    function scan(beacons) 
    {
//        console.log('## I AM THE MAJOR START: ' + window.sessionStorage["bluetoothStopScanRate"] + ', window.sessionStorage["bluetoothRSSI"]: ' + window.sessionStorage["bluetoothRSSI"])
        strongestBeaconRefId = '';
        strongestBeaconSignal = -999;
        
        setTimeout(function()
        {
            stopBluetooth();
            sendStrongestBeacon();
        }, window.sessionStorage["bluetoothStopScanRate"]);
        
        ble.startScanWithOptions([], 
                {
                    reportDuplicates: false
                }, 
                function success(device) 
                {
                    onDiscover(device,beacons);
                }, 
                function failure() 
                {
                    onBleError();
                }
            );
        
    }
    
    
    
    function sendStrongestBeacon()
    {
        referenceType = 1;
        eventId = 27;
        
//        console.log('strongestBeaconRefId: ' + strongestBeaconRefId + ', strongestBeaconSignal: ' + strongestBeaconSignal)
        
        if (strongestBeaconRefId !== '')
        {
//            console.log('Send Location with Beacon: ' + strongestBeaconRefId + " - RSSI " + strongestBeaconSignal + " -- eventId " + eventId);
            
            getCurrentLocation(eventId, strongestBeaconRefId, referenceType);
//            sendLocation(lat, lng, '', eventId, strongestBeaconRefId, referenceType);
        }
        
//        console.log('## I AM THE MAJOR END');
    }
    
    function onDiscover(device,beacons) 
    {
        var elementPos = beacons.map(function (x) {
            return x.unit_id;
        }).indexOf(device.name);
        
        
        if (parseInt(device.rssi) > window.sessionStorage["bluetoothRSSI"]) 
        {
//            console.log ('--- CHECKING deviceName: ' + device.name + ', deviceId: ' + device.id + ' RSSI: ' + device.rssi);
            
            if (beacons[elementPos] !== undefined) 
            {
                beaconArray.push('' + device.name);
                
                if (device.rssi > strongestBeaconSignal)
                {
                    strongestBeaconSignal = device.rssi;
                    strongestBeaconRefId = device.name;
                }
            }
        }
    }
    
    function onBleError() 
    {
        console.log("scanning failed");
    }
    
    

    function stopBluetooth() {
        ble.stopScan(function success() {
        }, function failure() {
            console.log("stop scan fail");
        });
        
    }
    
    
    function checkLastDetectedBeacons(aBeaconId) 
    {
        for (var i = 0 ; i < beaconArray.length ; i++)
        {
            if (aBeaconId.indexOf(beaconArray[i]) !== -1)
            {
                return beaconArray[i];
            }
        }
        
        return '';
    }
    
    


