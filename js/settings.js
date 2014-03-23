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
        bg = fetchedData.backgroundImage;
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
});
$('#authme').click(function () {
    interactiveSignIn();
});
function interactiveSignIn() {
    var licence;
    chrome.storage.sync.get('loungeLicense', function (response) {
        console.log(response.loungeLicense.createdTime);
        if (response) {
            chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError);
                } else {
                    console.log('Token acquired:' + token +
                        '. See chrome://identity-internals for details.');
                    getLicence(token);
                }
            });
        }
    });
}
function getLicence(token) {
    var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
    var req = new XMLHttpRequest();
    req.open('GET', CWS_LICENSE_API_URL + chrome.runtime.id);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            var license = JSON.parse(req.responseText);
            verifyAndSaveLicense(license);
        }
    };
    req.send();
}
function verifyAndSaveLicense(license) {
    console.log(license);
    var licenseStatus;
    if (license.result && license.accessLevel == "FULL") {
        console.log("Fully paid & properly licensed.");
        licenseStatus = "FULL";
        chrome.notifications.create(
            'license',{
                type: 'basic',
                iconUrl: 'img/notification.png',
                title: "Verified FULL License",
                message: "You have a FULL license!"
            },
            function() {}
        );
    } else if (license.result && license.accessLevel == "FREE_TRIAL") {
        var daysAgoLicenseIssued = Date.now() - parseInt(license.createdTime, 10);
        daysAgoLicenseIssued = daysAgoLicenseIssued / 1000 / 60 / 60 / 24;
        if (daysAgoLicenseIssued <= 7) {
            console.log("Free trial, still within trial period");
            licenseStatus = "FREE_TRIAL";
            chrome.notifications.create(
                'license',{
                    type: 'basic',
                    iconUrl: 'img/notification.png',
                    title: "Within Free Trial",
                    message: "You are still within the 7 day free trial period."
                },
                function() {}
            );
        } else {
            console.log("Free trial, trial period expired.");
            licenseStatus = "FREE_TRIAL_EXPIRED";
            chrome.notifications.create(
                'license',{
                    type: 'basic',
                    iconUrl: 'img/notification.png',
                    title: "Expired Free Trial",
                    message: "You're free trial period has expired. Please buy a licence via the Google Web Store."
                },
                function() {}
            );
        }
    } else {
        console.log("No license ever issued.");
        licenseStatus = "NONE";
    }
    chrome.storage.sync.set({'licenseStatus': licenseStatus}, function () {
    });
}
document.querySelector('#saving').addEventListener('click', save_options);
document.querySelector('#reset').addEventListener('click', reset_options);