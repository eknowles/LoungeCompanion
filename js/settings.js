// Saves options to localStorage.
function save_options() {
    var background = $('#backgrounds').val();

    chrome.storage.local.set({'backgroundImage': background}, function () {
        $('#status').fadeIn(800, function () {
            setTimeout(function () {
                $('#status').fadeOut(400);
            }, 2000);
        });
    });
}
// Resets bg options to localStorage.
function reset_options() {
    var background = 'xJFAJwB220HYP78WfVEW3nzdipZEBtUBDPFsDJm3XnkNmnfcWWqdU3jmo-hbMVhUcciThRFElxkH_HEUmLRffgCeZJxHYo5Rebvv7kJ7RlM7ns3WUUycWwr3MVnT9xsuCJEygx03jFR9-KaxD38bGSSYmodKG81VWaUzWYLqQGwL';

    chrome.storage.local.set({'backgroundImage': background}, function () {
        $("#backgrounds").val(background);
        $('#status').fadeIn(800, function () {
            setTimeout(function () {
                $('#status').fadeOut(400);
            }, 2000);
        });
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
    $("#dTable").tablesorter({ sortList: [[2,1], [3,1], [1,1]] });
});
document.querySelector('#saving').addEventListener('click', save_options);
document.querySelector('#reset').addEventListener('click', reset_options);