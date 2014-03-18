var users = {};
var profiles = {};
/////
/**
 * @return {number}
 */
function QuickRegEx(regex, data) {
    match = data.match(regex);
    if (match == null) {
        return -1;
    }
    return match[1];
}
function GetUserCurrent() {
    localStorage['lcid'] = $.cookie('id');
    var user = {
        //PHPSESSID:	$.cookie('PHPSESSID'),
        id: $.cookie('id'),
        //tkz:		$.cookie('tkz'),
        token: $.cookie('token'),
        success: true
    };
    if (typeof(user.id) == "undefined") {
        user.success = false;
    }
    return user;
}

function SaveUserCurrent(callback) {
    var user = GetUserCurrent();
    if (user.success) {
        delete user.success;
        GetUserList(function () {
            users[user.id] = user;
            chrome.storage.local.set({users: users}, function () {
                callback();
            });
        });
    }
    else {
        callback();
    }
}

function GetUserList(callback) {
    chrome.storage.local.get('users', function (stored) {
        if (typeof(stored.users) != "undefined") {
            users = stored.users;
        }
        callback();
    });
}
function CheckProfiles(callback) {
    users_count = Object.keys(users).length;
    $.each(users, function (steam_id, user) {
        if (typeof(profiles[user.id]) == "undefined") {
            GetProfile(user.id, function (profile) {
                profiles[profile.id] = profile;
            });
        }
    });
    callback();
}
function GetProfileList(callback) {
    chrome.storage.local.get('profiles', function (stored) {
        if (typeof(stored.profiles) != "undefined") {
            profiles = stored.profiles;
        }
        callback();
    });
}
function SaveProfileList(callback) {
    GetProfileList(function () {
        CheckProfiles(function () {
            chrome.storage.local.set({profiles: profiles}, function () {
                callback();
            });
        });
    });
}
function GetProfile(steam_id, callback) {
    profile = {};
    $.ajax({
        url: 'http://csgolounge.com/profile?id=' + steam_id,
        success: function (page) {
            profile.id = steam_id;
            profile.name = QuickRegEx(/href=\"http\:\/\/steamcommunity\.com\/profiles\/\d+\/\"\sclass=\"user\">\s+<b>(.*?)<\/b>/i, page);
            profile.pic = QuickRegEx(/<img\ssrc=\"(.*?)\"\salt=\"Avatar\"\s\/>/i, page);
            callback(profile);
        },
        async: false
    });
}
function SetUserCurrent(steam_id, callback) {
    if (typeof(users[steam_id]) != "undefined") {
        if (steam_id != $.cookie('id')) {
            $.each(users[steam_id], function (key, value) {
                $.cookie(key, value, { expires: 30, path: '/' });
            });
        }
        callback();
    }
}
function LogOutUser(callback) {
    $.get('/logout', function () {
        callback();
    });
}
function LogOutAndSetUser(steam_id, callback) {
    LogOutUser(function () {
        SetUserCurrent(steam_id, function () {
            callback();
        });
    });
}
function ShowUi() {
    //style
    //added in css
    //menu item
    $('#menu').append('<li><a id="switch_account" href="#"><img src="http://csgolounge.com/img/profile.png" alt="Sign in as..."><span>sign in as...</span></a></li>');
    //switch account ui
    $('body').append('<div id=switch_accounts_ui></div>');
    $("#switch_account").parent().mouseenter(function () {
        $('#switch_accounts_ui').clearQueue();
        MenuPosition = $(this).position();
        $('#switch_accounts_ui').css('top', MenuPosition.top + $('#menu li:first').height());
        $('#switch_accounts_ui').css('left', MenuPosition.left);
    }).mouseleave(function () {
            $('#switch_accounts_ui').delay(150).queue(function (next) {
                $('#switch_accounts_ui').css('top', '-1000px');
                $('#switch_accounts_ui').css('left', '-1000px');
                next();
            });
        });
    $('#switch_accounts_ui').mouseenter(function () {
        $('#switch_accounts_ui').clearQueue();
    }).mouseleave(function () {
            $('#switch_accounts_ui').delay(150).queue(function (next) {
                $('#switch_accounts_ui').css('top', '-1000px');
                $('#switch_accounts_ui').css('left', '-1000px');
                next();
            });
        });
    //fill switch account ui
    var ClassActive = ' notactive';
    $.each(users, function (steam_id, user) {
        if ($.cookie('id') == user.id) {
            ClassActive = ' logged';
        }
        $('#switch_accounts_ui').append('<div class="sa_account' + ClassActive + '" steam_id=' + user.id + '><div class=sa_avatar><img src=' + profiles[user.id].pic + '></div><div class=sa_meta><div class=sa_name>' + profiles[user.id].name + '</div><div class=sa_steamid>' + user.id + '</div></div></div>');
        ClassActive = ' notactive';
    });
    $('.sa_account').click(function () {
        LogOutAndSetUser($(this).attr('steam_id'), function () {
            location.reload();
        });
    });
    $('.sa_account').mouseenter(function () {
        if ($(this).hasClass('notactive')) {
            $(this).removeClass('notactive').addClass('active')
        }
    }).mouseleave(function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active').addClass('notactive')
            }
        });
    //clear data ui
    $('#switch_accounts_ui').append('<div class=sa_clear>Clear data...</div>');
    $('.sa_clear').click(function () {
        AreYouSure = 'Ara you sure about this?';
        if ($(this).text() != AreYouSure) {
            $(this).text(AreYouSure);
        }
        else {
            chrome.storage.local.clear(function () {
                location.reload();
            });
        }
    });
    //img fix
    $('.sa_account .sa_avatar img').error(function () {
        $(this).attr('src', 'http://media.steampowered.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg');
    });
}
SaveUserCurrent(function () {
    GetUserList(function () {
        SaveProfileList(function () {
           ShowUi();
        });
    });
});

