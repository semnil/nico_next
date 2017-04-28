const MOVIE_URL_PREFIX = 'www.nicovideo.jp/watch/';

const PLAYER_NAME = 'external_nicoplayer';

const URL_ANCHOR = '#playerContainerWrapper';

const FAILED_MESSAGE = '次の動画が見つかりませんでした。';


var interval;
var isScrolled = false;


function findLastSymbolIndex(str) {
    var index = str.lastIndexOf('次');
    if (index === -1) {
        index = str.lastIndexOf('→');
    }
    if (index === -1) {
        index = str.lastIndexOf('＞');
    }
    return index;
}

function findFirstTag(str) {
    var index = str.indexOf('<');
    if (index !== -1) {
        index += 1;
        var tagCloseIndex = str.substr(index).indexOf('>');
        var nextSpaceIndex = str.substr(index).indexOf(' ');
        if (tagCloseIndex < 0 ||
            (nextSpaceIndex >= 0 && tagCloseIndex > nextSpaceIndex)) {
            tagCloseIndex = nextSpaceIndex;
        }
        return str.substr(index, tagCloseIndex);
    }
    return null;
}

function findVideoId(str) {
    return str.match(/sm[0-9]+/);
}

function getFirstUrl(str) {
    var nextCloseSymbolIndex = str.indexOf('/');
    var nextHrefIndex = str.indexOf('href=') + 5;
    if (nextCloseSymbolIndex < nextHrefIndex)
        return null;

    var lastCharIndex = str.substr(nextHrefIndex).indexOf(' ') - 1;
    if (lastCharIndex < 0) {
        lastCharIndex = str.substr(nextHrefIndex).indexOf('>') - 1;
    }
    var lastChar = str.substr(nextHrefIndex + lastCharIndex, 1);
    if (lastChar === '\'' || lastChar === '\"') {
        // remove quote characters
        nextHrefIndex += 1;
        lastCharIndex -= 1;
    }
    var nextUrl = str.substr(nextHrefIndex, lastCharIndex);
    if (nextUrl.indexOf(MOVIE_URL_PREFIX) !== -1) {
        //alert(nextUrl);
        return nextUrl + URL_ANCHOR;
    } else {
        return null;
    }
}

function next() {
    var descriptions = document.getElementsByClassName('videoDescription');
    if (!descriptions || descriptions.length === 0)
        descriptions = document.getElementsByClassName('VideoDescription-html');
    for (var i = 0; descriptions && i < descriptions.length; i++) {
        var innerHtmlString = descriptions[i].innerHTML;
        for (var lastIndex = innerHtmlString.length;lastIndex >= 0;) {
            var symbolIndex = findLastSymbolIndex(innerHtmlString.substr(0, lastIndex));
            lastIndex = symbolIndex;
            var nextTag = findFirstTag(innerHtmlString.substr(symbolIndex));
            if (nextTag) {
                var nextUrl = getFirstUrl(innerHtmlString.substr(symbolIndex));
                if (nextUrl) {
                    window.location.href = nextUrl;
                    i = descriptions.length;
                }
                break;
            }
        }
    }
    if (!descriptions || descriptions.length === 0)
        descriptions = document.getElementsByClassName('VideoDescription-plain');
    for (i = 0; descriptions && i < descriptions.length; i++) {
        var innerTextString = descriptions[i].innerText;
        for (var lastIndex2 = innerTextString.length;lastIndex2 >= 0;) {
            var symbolIndex2 = findLastSymbolIndex(innerTextString.substr(0, lastIndex2));
            lastIndex2 = symbolIndex2;
            var nextVID = findVideoId(innerTextString.substr(symbolIndex2));
            if (nextVID) {
                var nextVUrl = "http://www.nicovideo.jp/watch/" + nextVID;
                if (nextVUrl) {
                    window.location.href = nextVUrl;
                    i = descriptions.length;
                }
                break;
            }
        }
    }
    if (nextUrl === null) {
        alert(FAILED_MESSAGE);
        clearInterval(interval);
    }
}

function checkNext() {
    if (localStorage.nico_next_auto_scroll === "true" && !isScrolled) {
        var header = document.getElementById('siteHeader');
        var obj = document.getElementById('videoTagContainer');
        if (obj)
            obj = [obj];
        else
            obj = document.getElementsByClassName('TagContainer');
        if (header && obj && obj.length > 0) {
            var height = obj[0].offsetTop - header.scrollHeight;
            var temp = document.getElementsByClassName('html5_message');
            if (temp && temp.length > 0)
                height += temp[0].scrollHeight + temp[0].offsetTop;
            window.scrollTo(0, height);
        }
        isScrolled = true;
    }
    var player = document.getElementById(PLAYER_NAME);
    if (player && player.ext_getStatus() === 'end') {
        next();
    } else {
        var seekBars = document.getElementsByClassName("SeekBarHandle");
        if (seekBars && seekBars.length > 0) {
            var bar = seekBars[0];
            if (bar.style.transform === "translateX(0%)")
                next();
        }
    }
}

function toggleButton() {
    localStorage.nico_next_auto_scroll = (localStorage.nico_next_auto_scroll === "true" ? "false" : "true");
    var button = document.getElementById('nico_next_auto_scroll');
    button.textContent = "autoscroll:" + (localStorage.nico_next_auto_scroll === "true" ? "on" : "off");
}

if (window.location.href.indexOf(MOVIE_URL_PREFIX) !== -1) {
    if (!localStorage.nico_next_auto_scroll)
        localStorage.nico_next_auto_scroll = "true";

    isScrolled = false;
    var obj = document.getElementById('playerContainerWrapper');
    if (obj)
        obj = [obj];
    else
        obj = document.getElementsByClassName('MainContainer');
    if (obj && obj.length > 0) {
        var button = document.createElement('button');
        button.id = 'nico_next_auto_scroll';
        button.textContent = "autoscroll:" + (localStorage.nico_next_auto_scroll === "true" ? "on" : "off");
        button.onclick = toggleButton;
        obj[0].appendChild(button)
    }

    interval = setInterval('checkNext()', 5000);
}
