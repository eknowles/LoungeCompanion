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
//Global variable for fixed item size
var itemSize = 0;
chrome.storage.local.get("itemSize", function (fetchedData) {
    itemSize = fetchedData.itemSize;
    console.log(itemSize);
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
    // has already set a price so dont do anything
    if (!SearchItem.hasClass('priced')) {
        SearchItem.find('.rarity').html('Loading...');
        //Temporary until settings
        var currency = 3;
        var itemName = SearchItem.find('img.smallimg').attr("alt");
        var itemUrl = "http://steamcommunity.com/market/priceoverview/?country=US&currency=" + currency + "&appid=" + gameid + "&market_hash_name=" + itemName;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", itemUrl, true);
        xhr.withCredentials = true;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var response = jQuery.parseJSON(xhr.responseText);
                lowest_price = parseFloat(response.lowest_price.substring(0, 4).replace(',','.'));
                //Temporary currency symbol
                SearchItem.find('.rarity').html(lowest_price + '€');
                SearchItem.addClass('priced');
                priceSimilarItems(SearchItem);
            } else {
                SearchItem.find('.rarity').html('Not Found');
            }
        }
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
// Also hook on item location tab (armory/returns)
$('#main a.tab').on("click", function() {
    $("#backpack").html('<img src="http://cdn.dota2lounge.com/img/load.gif" id="loading" style="margin: 0.75em 2%">');
    $("#backpack").bind("DOMSubtreeModified", function() {
        if($(this).find(".item").length != 0) {
            $(this).unbind("DOMSubtreeModified");
            $(this).find(".item").hover( function() { priceItem($(this)); }, null);
            tidyItems();
        }
    });
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
            $(this).find('div.value').hide();
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
        if (itemSize != 0) {
            item.css({ 'width': itemSize + 'px'});
        } else {
            item.css({ 'width': newItemWidth + 'px' });
        }
        
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
//Sort the returned items by their value
function sortReturns() {
    var items = $($('.standard')[1]).find('.item');
    items.tsort('div.value', { order: 'desc' });
}
function calculateReturnsValue() {
    var items = $($('.standard')[1]).find('.item');
    var value = 0;
    items.each(function (index) {
        value += parseFloat($(this).find('.value').html().replace('$ ', ''));
    });
    return value;
}
function calculateBetValue(bet) {
    //Get prices for all items
    bet.find(".item[class!='priced']").each(function () {
        priceItem($(this));
    });

    //Wait until all items have been priced
    var loop = setInterval(function () {
        if (bet.find('.item:not(.priced)').length == 0) {

            function sumItems(items) {
                var totalValue = 0;
                //.each didnt work for some reason so had to use a for loop
                for (var i = 0; i < items.length; i++) {
                    //Temporary currency
                    var value = parseFloat($(items[i]).find('.rarity').text().replace('€', ''));
                    if (!isNaN(value)) {
                        totalValue += value;
                    }
                }
                return totalValue;
            }
            console.log("bet length" + bet.length);
            var placedValue = sumItems(bet.first().find('.item'));
            var headerText = '';
            //Bet was won
            if (bet.last().children().length > 1) {
                var wonValue = sumItems(bet.last().find('.item'));
                //Temporary currency
                headerText = '<span style="color:green">' + wonValue.toFixed(2) + '€' + '</span>';
            } else { //Bet was lost
                headerText = '-' + placedValue.toFixed(2) + '€';
            }
            //sbet.prev().children(':eq(0)').find('a:eq(1)').text(headerText).css('color', 'blue !important;');
            console.log(placedValue);
            clearInterval(loop);
        }
    }, 1000);
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
    /*
    *   BET HISTORY ADDITIONS
    */
    //Delete old button and insert a new one so that we can do custom events for it
    var oldButton = $("a.lc-button:contains('Bet History')");
    var newButton = $('<a class="lc-button">Bet History</a>');
    oldButton.parent().append(newButton);
    oldButton.remove();
    newButton.click(function () {
        var container = $('#ajaxCont');
        container.html('<img src="../img/load.gif" id="loading" style="margin: 0.75em 2%">');
        //Need to keep jquery in scope
        var $$ = $;
        //Get bet historyButton
        $.ajax({
            url: 'ajax/betHistory.php',
            type: 'POST',
            success: function(data) {
                container.html(data).slideDown('fast', function () {
                    tidyItems();
                    setItemWidth();
                    //Register hover event again when the items actually are here
                    $$(".item").hover( function() { priceItem($$(this)); }, null);
                    //Every bet has a +
                    var bets = $("a:contains('+')[class!='info']");
                    bets.each(function (index) {
                        $(this).parent().css('white-space', 'nowrap');
                        var betIdString = $(this).attr('onclick');
                        var betId = betIdString.substring(3, betIdString.indexOf("'", 4));
                        //Link for calculating bet values
                        var link = $('<a style="margin-left:5px">$</a>');
                        link.click(function () {
                            calculateBetValue($(betId));
                        });
                        $(this).parent().append(link);
                    });
                });
            }
        });
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
    $(".simplePagerNav > li > a").click(function () {
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
    }(), 3000);

    var $loadDelay = 0;
    $(".lc-big-preview-bg, .lc-big-preview, .lc-preview-img").click(function () {
        closePreview();
    });
    updatePreviewBG();
    //Sidebar slideout
    $('.lc-sidebar_menu').click(function () {
        $('#submenu').toggleClass('open');
    });
    sortReturns();
    //Add value of returned items to the title if we have the right title
    var title = $($('div .title')[1]);
    if (title.text() == 'returns') {
        title.text( title.text() + ' (' + '$' + calculateReturnsValue().toFixed(2) + ')');
    } 

});
$(window).resize(function () {
    setItemWidth();
    updatePreviewBG();
});