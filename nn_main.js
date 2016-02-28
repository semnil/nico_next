const MOVIE_URL_PREFIX = 'www.nicovideo.jp/watch/';

const PLAYER_NAME = 'external_nicoplayer';

const URL_ANCHOR = '#playerContainerWrapper';

const FAILED_MESSAGE = '次の動画が見つかりませんでした。';


var interval;


function findLastSymbolIndex(str) {
    var index = str.lastIndexOf('次');
    if (index == -1) {
        index = str.lastIndexOf('→');
    }
    return index;
}

function findFirstTag(str) {
    var index = str.indexOf('<');
    if (index != -1) {
        index += 1;
        var nextSpaceIndex = str.substr(index).indexOf(' ');
        if (nextSpaceIndex < 0) {
            nextSpaceIndex = str.substr(index).indexOf('>');
        }
        return str.substr(index, nextSpaceIndex);
    }
    return null;
}

function getFirstUrl(str) {
    var nextHrefIndex = str.indexOf('href=') + 5;
    var lastCharIndex = str.substr(nextHrefIndex).indexOf(' ') - 1;
    if (lastCharIndex < 0) {
        lastCharIndex = str.substr(nextHrefIndex).indexOf('>') - 1;
    }
    var lastChar = str.substr(nextHrefIndex + lastCharIndex, 1);
    if (lastChar == '\'' || lastChar == '\"') {
        // remove quote characters
        nextHrefIndex += 1;
        lastCharIndex -= 1;
    }
    var nextUrl = str.substr(nextHrefIndex, lastCharIndex);
    if (nextUrl.indexOf(MOVIE_URL_PREFIX) != -1) {
        //alert(nextUrl);
        return nextUrl + URL_ANCHOR;
    } else {
        return null;
    }
}

function next() {
    //var obj = document.getElementById('playerContainerWrapper');
    //if (obj) {
    //    window.scrollTo(0, obj.offsetTop - obj.style.marginTop - obj.style.paddingTop);
    //}
    var player = document.getElementById(PLAYER_NAME);
    if (player && player.ext_getStatus() == 'end') {
        var descriptions = document.getElementsByClassName('videoDescription');
        for (var i = 0; descriptions && i < descriptions.length; i++) {
            var innerHtmlString = descriptions[i].innerHTML;
            for (var lastIndex = innerHtmlString.length;lastIndex >= 0;) {
                var symbolIndex = findLastSymbolIndex(innerHtmlString.substr(0, lastIndex));
                lastIndex = symbolIndex;
                var nextTag = findFirstTag(innerHtmlString.substr(symbolIndex));
                if (nextTag && nextTag == 'a') {
                    var nextUrl = getFirstUrl(innerHtmlString.substr(symbolIndex));
                    if (nextUrl) {
                        window.location.href = nextUrl;
                        i = descriptions.length;
                        break;
                    }
                }
            }
        }
        if (nextUrl == null) {
            alert(FAILED_MESSAGE);
            clearInterval(interval);
        }
    }
}

if (window.location.href.indexOf(MOVIE_URL_PREFIX) != -1) {
    interval = setInterval('next()', 5000);
}
