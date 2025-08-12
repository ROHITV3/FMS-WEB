/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function registerFCMDevice() {
   // alert("registerFCMDevice");

    FirebasePlugin.getToken(function (token) {
        localStorage.setItem("deviceID", token);
    }, function (error) {
        console.error("Failed to get token:", error);
    });

    // Optional: Listen for token refresh
    FirebasePlugin.onTokenRefresh(function (token) {
        console.log("FCM Token refreshed:", token);
    }, function (error) {
        console.error("Token refresh error:", error);
    });


}



