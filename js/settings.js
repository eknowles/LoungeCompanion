// Saves options to localStorage.
function save_options() {
    var background = $('#backgrounds').val();
    chrome.storage.local.set({'backgroundImage': background}, function () {
    });
}
// Resets bg options to localStorage.
function reset_options() {
    var background = 'xJFAJwB220HYP78WfVEW3nzdipZEBtUBDPFsDJm3XnkNmnfcWWqdU3jmo-hbMVhUcciThRFElxkH_HEUmLRffgCeZJxHYo5Rebvv7kJ7RlM7ns3WUUycWwr3MVnT9xsuCJEygx03jFR9-KaxD38bGSSYmodKG81VWaUzWYLqQGwL';
    chrome.storage.local.set({'backgroundImage': background}, function () {
        $("#backgrounds").val(background);
    });
}
// Restores select box state to saved value from localStorage.
function restore_options() {
    chrome.storage.local.get("backgroundImage", function (fetchedData) {
        bg = fetchedData.backgroundImage
        $("#backgrounds").val(bg);
    });
}
$(document).ready(function () {
    restore_options();
    $("#dTable").tablesorter({ sortList: [
        [2, 1],
        [3, 1],
        [1, 1]
    ] });
    chrome.identity.getAuthToken({ 'interactive': false },function (token) {
        //            alert("back token=" + token);
        console.log(token);
        console.log("Identity:", chrome.identity);
    });
});
$("#authme").click(
    function interactiveSignIn() {
        // @corecode_begin getAuthToken
        // @description This is the normal flow for authentication/authorization
        // on Google properties. You need to add the oauth2 client_id and scopes
        // to the app manifest. The interactive param indicates if a new window
        // will be opened when the user is not yet authenticated or not.
        // @see http://developer.chrome.com/apps/app_identity.html
        // @see http://developer.chrome.com/apps/identity.html#method-getAuthToken
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
            } else {
                console.log('Token acquired:'+token+
                    '. See chrome://identity-internals for details.');
                setToken(token);
                getLicence(token);
            }
        });
        // @corecode_end getAuthToken
    }
);

function getLicence(token){
    var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
    var req = new XMLHttpRequest();
    req.open('GET', CWS_LICENSE_API_URL + chrome.runtime.id);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            var license = JSON.parse(req.responseText);
            console.log(license);
            verifyAndSaveLicense(license);
        }
    };
    req.send();
}
function setToken(token){
    chrome.storage.sync.set({'userToken': token}, function() {
    });
}
function verifyAndSaveLicense(license){
    var licenseStatus;
    if (license.result && license.accessLevel == "FULL") {
        console.log("Fully paid & properly licensed.");
        licenseStatus = "FULL";
    } else if (license.result && license.accessLevel == "FREE_TRIAL") {
        var daysAgoLicenseIssued = Date.now() - parseInt(license.createdTime, 10);
        daysAgoLicenseIssued = daysAgoLicenseIssued / 1000 / 60 / 60 / 24;
        if (daysAgoLicenseIssued <= 3) {
            console.log("Free trial, still within trial period");
            licenseStatus = "FREE_TRIAL";
        } else {
            console.log("Free trial, trial period expired.");
            licenseStatus = "FREE_TRIAL_EXPIRED";
        }
    } else {
        console.log("No license ever issued.");
        licenseStatus = "NONE";
    }
}
document.querySelector('#saving').addEventListener('click', save_options);
document.querySelector('#reset').addEventListener('click', reset_options);