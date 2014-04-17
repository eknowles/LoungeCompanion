var $body = $('body');
$body.prepend('<div class="lc-big-preview" style="display: none;"><img src="" alt="" class="lc-preview-img" /><img src="" alt="" class="lc-preview-stattrak" /><img src="" alt="" class="lc-preview-souvenir" /><div class="lc-preview-title"></div><a href="" target="_blank" class="lc-preview-steamlink lc-button">Open Steam Market Page</a></div>');
$body.prepend('<div class="lc-big-preview-bg" style="display: none;"><img src="" alt="Loading..." class="lc-preview-spinner" /><div id="countdown"></div></div>');
$body.prepend('<div class="lc-bet" style="display: none;"></div>');
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return str.length > 0 && this.substring(0, str.length) === str;
    }
}
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return str.length > 0 && this.substring(this.length - str.length, this.length) === str;
    }
}
chrome.storage.local.get("backgroundImage", function (fetchedData) {
    bg = fetchedData.backgroundImage
    document.body.style.backgroundImage = "url(http://cdn.steamcommunity.com/economy/image/" + bg + ")";
});
var gameid = ''; // csgo 730, dota2 570
if ($(location).attr('href').startsWith('http://csgolounge.com/')) {
    gameid = '730';
} else {
    gameid = '570';
}
var $boxShinyAlt = $('.box-shiny-alt');
var $boxShiny = $('.box-shiny');
var $buttonRight = $('.buttonright');
var $button = $('.button');
$boxShinyAlt.addClass('gradient');
$boxShiny.addClass('gradient');
$boxShinyAlt.removeClass('box-shiny-alt');
$boxShiny.removeClass('box-shiny');
$buttonRight.addClass('lc-button');
$buttonRight.removeClass('buttonright');
$button.addClass('lc-button');
$button.removeClass('button');
$('.selectbox').toggleClass('selectbox').toggleClass('lc-button');
$('input[type="text"]').toggleClass('lc-button').toggleClass('selectbox');
function getSkinQuality(wear) {
    if (wear == 'Battle-Scarred') {
        return '5';
    } else if (wear == 'Well-Worn') {
        return '4';
    } else if (wear == 'Field-Tested') {
        return '3';
    } else if (wear == 'Minimal Wear') {
        return '2';
    } else if (wear == 'Factory New') {
        return '1';
    }
}
function updateBetPoolWidth() {
    var $holding = $('form#betpool').find('div.betpool');
    var width = 0;
    $('#betpool>.betpool').css('background', 'red');
    $holding.children('.item').each(function () {
        width += $(this).outerWidth(true);
    });
    console.log(width);
    $holding.css('width', width);
}
function priceSimilarItems(item) {
    var itemId = item.find('img.smallimg').attr("alt");
    var itemPrice = item.find('.rarity').html();
    $(".item").each( function () {
        if ($(this).find('img.smallimg').attr("alt") == itemId && !$(this).hasClass('priced')) {
            $(this).find('.rarity').html(itemPrice);
            $(this).addClass('priced');
        }
    });
}

function priceItem(SearchItem) {
    if (SearchItem.hasClass('priced')) {
        // has already set a price so dont do anything
    } else {
        SearchItem.find('.rarity').html('Loading...');
        var itemurl = "http://steamcommunity.com/market/listings/" + gameid + "/" + SearchItem.find('img.smallimg').attr("alt") + "/";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", itemurl, true);
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var item_price = xhr.responseText.match(/<span class="market_listing_price market_listing_price_with_fee">\r\n(.+)<\/span>/g);
                if (item_price) {
                    $(item_price).each(function (index, value) {
                        if (!(value.match(/\!/))) {
                            item_to_get = value.match(/<span class="market_listing_price market_listing_price_with_fee">\r\n(.+)<\/span>/);
                            return false;
                        }
                    });
                    lowest_price = item_to_get[1].trim();
                    SearchItem.find('.rarity').html(lowest_price);
                    SearchItem.addClass('priced');
                    priceSimilarItems(SearchItem);
                } else {
                    SearchItem.find('.rarity').html('Not Found');
                }
            }
        };
        xhr.send();
    }
}

$(".item").hover( function() { priceItem($(this)); }, null);
// When backpack is loaded add the mouse event to its item too
$("#backpack").bind("DOMSubtreeModified", function() {
    if($(this).find(".item").length != 0) {
        $(this).unbind("DOMSubtreeModified");
        $(this).find(".item").hover( function() { priceItem($(this)); }, null);
    }
});

function tidyItems() {
    $(".item").each(function (index) {
        lowest_price = '';
        title = $(this).find('img.smallimg').attr("alt")
        $(this).attr('title', title);
        var itemQuality = $(this).find('div.rarity').text();
        $(this).attr('data-lc-quality', getSkinQuality(itemQuality));
        var itemvalue = $(this).find("input[name=worth]").val();
        if (itemvalue) {
            if ($(this).find('div.itemval').length > 0) {
                $(this).find('div.itemval').text(itemvalue);
            } else {
                $(this).append('<div class="itemval"></div>');
                $(this).find('div.itemval').text(itemvalue);
            }
        }
        if ($(this).find('.steam-link').length == 0) {
            $(this).find('.name').append('<p><a href="http://steamcommunity.com/market/listings/' + gameid + '/' + title + '" target="_blank" class="steam-link">Community Market Page</a></p>');
        }
    });
    $('#backpack').find('.item').tsort('input[name=worth]', {
        attr : 'value',
        order: 'desc'
    }, '.rarity', '.name');
}
function closePreview() {
    var $previewBackground = $('.lc-big-preview-bg');
    var $previewForeground = $('.lc-big-preview');
    $previewBackground.fadeOut();
    console.log('clicked closePreview');
    $(".lc-preview-steamlink").fadeOut();
    $previewForeground.removeClass('StatTrak');
    $previewForeground.removeClass('Souvenir');
    $previewForeground.slideUp();
    $('.lc-preview-stattrak').hide();
    $('.lc-preview-souvenir').hide();
}
function openPreview(raritydiv) {
    var $previewBackground = $('.lc-big-preview-bg');
    var $previewForeground = $('.lc-big-preview');
    console.log('clicked openPreview');
    $(".lc-preview-steamlink").delay(400).fadeIn();
    $previewForeground.slideDown();
    if (raritydiv.parent().hasClass('StatTrak').toString() == 'true') {
        $previewForeground.addClass('StatTrak');
        $('.lc-preview-stattrak').delay(400).fadeIn();
    }
    if (raritydiv.parent().hasClass('Souvenir').toString() == 'true') {
        $previewForeground.addClass('Souvenir');
        $('.lc-preview-souvenir').delay(400).fadeIn();
    }
    updatePreviewBG();
    $previewBackground.fadeIn();
}
function clickUpdateItems() {
    setItemWidth();
    tidyItems();
}
function setItemWidth() {
    var minWidth = 70;
    var maxWidth = 200;
    var $delayFadeIn = 0;
    $(".item").each(function (index) {
        var item = $(this);
        var parentWidth = item.parent().width();
        var itemRowCount = 7;
        var newItemWidth = (parentWidth / itemRowCount) - 9;
        parentClass = item.parent().attr('class');
        parentId = item.parent().attr('id');
        if (item.parent().next().attr('#freezeback')) {
            console.log(item);
        }
        if (parentId) {
            switch (parentId) {
                case 'backpack':
                    itemRowCount = 7;
                    break;
                case 'armory':
                    itemRowCount = 7;
                    break;
                case 'trash':
                    itemRowCount = 7;
                    break;
                case 'itemlist':
                    itemRowCount = 7;
                    break;
                case 'bpheader':
                    itemRowCount = 7;
                    break;
                case 'freezeback':
                    itemRowCount = 7;
                    break;
                default:
                    itemRowCount = 7;
                    break;
            }
        }
        if (parentClass) {
            switch (parentClass) {
                case 'winsorloses':
                    itemRowCount = 4;
                    break;
                case 'left':
                    itemRowCount = 4;
                    break;
                case 'right':
                    itemRowCount = 4;
                    break;
                case 'lc-current-bets':
                    itemRowCount = 4;
                    break;
                case 'bpheader':
                    itemRowCount = 7;
                    break;
                default:
                    itemRowCount = 4;
                    break;
            }
        }
        //backpack || 'armory' || 'trash' || 'itemlist' || 'bpheader'
        // if (item.parent().hasClass('bpheader')) {
        //     itemRowCount = 7;
        // }
        // if (item.parent().is('td')) {
        //     itemRowCount = 7;
        // }
        // if (newItemWidth < minWidth) {
        //     itemRowCount = itemRowCount - 1;
        // }
        newItemWidth = (parentWidth / itemRowCount) - 9;
        item.css({
            'width': newItemWidth + 'px'
        });
        if ($(this).hasClass('Souvenir').toString() == 'true') {
            if ($(this).children('div.lc-souvenir').length == 0) {
                $(this).append('<div class="lc-souvenir"><img src="" alt="Souvenir"/></div>');
            }
        }
        if ($(this).hasClass('StatTrak' || 'Star').toString() == 'true') {
            if ($(this).children('div.lc-stattrak').length == 0) {
                $(this).find('div.clreff:contains("ST")').after('<div class="lc-stattrak"></div>');
            }
        }
        item.show();
        // $delayFadeIn += 10;
    });
}
// If page is match page
if ($(location).attr('href').startsWith('http://csgolounge.com/match?m')) {
    $('section.box').first().next().find('.gradient').append('<div id="disqus_thread"></div>');
    /* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
    var disqus_shortname = 'loungecompanion'; // required: replace example with your forum shortname
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);

    }
// If page is mybets
if ($(location).attr('href').endsWith('mybets')) {
    $('#freezebutton').after('<a class="lc-button lc-donate" href="http://steamcommunity.com/tradeoffer/new/?partner=79369712&token=RXsEt60_" target="_blank"><i class="fa fa-heart"></i> Donate to Lounge Companion </a>');
    var $currentBets = $('.lc-current-bets');
    $('.match').toggleClass('match').toggleClass('lc-current-bets');
    $('.matchmain').addClass('winsorloses');
    $('.lc-current-bets').find('.half').toggleClass('half').toggleClass('full');
    $('.lc-current-bets').find('div.full:first-child').addClass('lc-bet-teams');
    $('.lc-current-bets').find('div.full:first-child').attr('title', 'Click to open match page');
    $('.lc-current-bets').find('div.full:nth-child(2)').addClass('lc-bet-pot');
    $('.lc-current-bets').find('div.full:nth-child(4)').addClass('lc-bet-reward');
    $('.lc-bet-teams span:first-child').css({
        'width'     : '45%',
        'text-align': 'right'
    });
    $('.lc-bet-teams span:nth-child(3)').css({
        'width'     : '45%',
        'text-align': 'left'
    });
}
// If page is myprofile
if ($(location).attr('href').endsWith('myprofile')) {
    $("a.lc-button:contains('Bet History')").click(function () {
        console.log('Clicked Bet History');
        tidyItems();
        setItemWidth();
    });
    $("a.lc-button:contains('Trade History')").click(function () {
        console.log('Clicked Trade History');
        tidyItems();
        setItemWidth();
    });
}

//If page is main page
if ($(location).attr('href').endsWith('.com/')) {
    //Color the team name and odds on main page
    $("div.teamtext").each(function(index) {
        var odds = $(this).children().last().text().slice(0,-1);
        $(this).css("color", "rgb(" + Math.round((100 - odds)*1.8) + ", " + Math.round(odds*1.8) + ", 0)");
    });
    
    //Show matches already bet on
    //Get bets from mybet page
    $.get("mybets", function(data) {
        var mybets = new Object();
        jQuery("<html>").html(data).find("div.match").each( function(index){
            var matchNode = $(this).find("div.half:first a").first();
            var matchId = matchNode.attr('href').split('=')[1];
            if (matchNode.children().first().html().indexOf("(your type)") != -1 ) {
                //Selected first team
                mybets[matchId] = 1;
            } else {
                //Selected second team
                mybets[matchId] = 2;
            }
        });
        
        //mybets now contains {matchid:1, matchid:2...}

        //Apply style on main page matches
        $("div.matchleft a").each(function(index) {
            var matchId = $(this).attr('href').split('=')[1];
            if(mybets[matchId] != null) {
                if(mybets[matchId] == 1) {
                    $(this).find("div.team").first().addClass("selectedTeam");
                } else {
                    $(this).find("div.team").last().addClass("selectedTeam");
                }
            }
        });
    });
}

// Swap wear for preview text
$('.rarity').hover(
    function () {
        var $this = $(this); // caching $(this)
        $this.data('initialText', $this.text());
        $this.text('Open Preview');
        $this.addClass('lc-hover-preview-active');
    },
    function () {
        var $this = $(this); // caching $(this)
        $this.text($this.data('initialText'));
        $this.removeClass('lc-hover-preview-active');
    }
);
// Open up the preview modal
$("a:contains('Preview')").attr("onclick", null);
$("a:contains('Preview')").click(function () {
    var poop = $(this).parent().parent().find('.rarity');
    var newSrc = poop.prev().prev().attr("src").replace("99fx66f", ""); //360fx360f
    var newName = poop.prev().prev().attr('alt');
    var steamLink = 'http://steamcommunity.com/market/listings/' + gameid + '/' + newName;
    $(".lc-preview-img").attr("src", newSrc);
    $(".lc-preview-title").text(newName);
    $(".lc-preview-steamlink").attr('href', steamLink);
    openPreview(poop);
});
$(".rarity").click(function () {
    var newSrc = $(this).prev().prev().attr("src").replace("99fx66f", ""); //360fx360f
    var newName = $(this).prev().prev().attr('alt');
    var steamLink = 'http://steamcommunity.com/market/listings/' + gameid + '/' + newName;
    $(".lc-preview-img").attr("src", newSrc);
    $(".lc-preview-title").text(newName);
    $(".lc-preview-steamlink").attr('href', steamLink);
    openPreview($(this));
});
function addSideMenuOptions() {
    $('nav#submenu>div').first().before(
        '<div class="lc-sidebar_menu"><i class="fa fa-bars"></i></div>' +
            '<div><a href="myprofile"><i class="fa fa-user"></i> My Profile</a>' +
            '<a href="mytrades"><i class="fa fa-exchange"></i> My Trades</a>' +
            '<a href="myoffers"><i class="fa fa-bullhorn"></i> My Offers</a>' +
            '<a href="mybets"><i class="fa fa-money"></i> My Bets</a>' +
            '<a href="bookmarks"><i class="fa fa-bookmark"></i> Bookmarks</a>' +
            '<a href="search"><i class="fa fa-search"></i> Search</a>' +
            '<a href="addtrade"><i class="fa fa-plus"></i> Add Trade</a></div>' +
            '<div><a class="UpdateItemsAll"><i class="fa fa-bolt"></i> Refresh Items</a></div>');
    $('#submenu').css({
        'height': ($(document).height() - $('header').height()) + 'px'
    });
}
function updatePreviewBG() {
    var $previewBackground = $('.lc-big-preview-bg');
    $previewBackground.css({
        'height': $(document).height() + 'px',
        'width' : $(window).width() + 'px'
    });
}
$(document).ready(function () {
    var $previewBackground = $('.lc-big-preview-bg');
    var $previewForeground = $('.lc-big-preview');
    var $calcButton = $("a:contains('Calculate reward')");
    clickUpdateItems();
    addSideMenuOptions();
    $('.lc-preview-spinner').css({
        'top' : ($(window).height() / 2) + 'px',
        'left': ($(window).width() / 2) - (32 / 2) + 'px'
    });
    $("span:contains('Potential reward:')").css('display', 'none');
    $('.matchheader').find('.lc-button').each(function (index) {
        $(this).removeClass('lc-button');
        $(this).addClass('lc-bet-swap');
        $(this).appendTo($(this).prev());
    });
    $(".simplePagerNav>li>a").click(function () {
        setTimeout(function () {
            clickUpdateItems();
        }, 2000);
    });
    clickUpdateItems();
    $(".UpdateItemsAll").click(function () {
        tidyItems();
    });
    setInterval(function () {
        setItemWidth();
    }, 3000);
    var $loadDelay = 0;
    $(".lc-big-preview-bg, .lc-big-preview, .lc-preview-img").click(function () {
        closePreview();
    });
    updatePreviewBG();
    // Add donation button to first box of every page
    $('section.box').first().append('<a class="lc-button lc-donate dullhover" href="http://steamcommunity.com/tradeoffer/new/?partner=79369712&token=RXsEt60_" target="_blank"><i class="fa fa-heart"></i> Donate to Lounge Companion </a>');
    //    $('#placebut').after('<a class="lc-button" id="lc-donate" href="http://steamcommunity.com/tradeoffer/new/?partner=79369712&token=RXsEt60_" target="_blank"><i class="fa fa-heart"></i> Donate to Lounge Companion </a>');
    //Sidebar slideout
    $('.lc-sidebar_menu').click(function () {
        $('#submenu').toggleClass('open');
    });
});
$(window).resize(function () {
    setItemWidth();
    updatePreviewBG();
});