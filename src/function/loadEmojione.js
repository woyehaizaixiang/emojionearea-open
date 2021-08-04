define([
    'var/emojione',
    'var/uniRegexp',
    'var/readyCallbacks',
    'var/emojioneSupportMode',
    'var/cdn',
    'function/getEmojioneVersion',
    'function/emojioneReady',
    'function/detectVersion',
    'function/getSupportMode'
],
function(emojione, uniRegexp, readyCallbacks, emojioneSupportMode, cdn, getEmojioneVersion, emojioneReady, detectVersion, getSupportMode) {
    return function(options) {
        var emojioneVersion = getEmojioneVersion()
        options = getOptions(options);

        if (!cdn.isLoading) {
            if (!emojione || getSupportMode(detectVersion(emojione)) < 2) {
                cdn.isLoading = true;
                var emojioneJsCdnUrlBase;
                emojioneJsCdnUrlBase = cdn.defaultBase;
                $.ajax({
                    url: emojioneJsCdnUrlBase + "/js/emojione.min.js",
                    dataType: "script",
                    cache: true,
                    success: function () {
                        emojione = window.emojione;
                        emojioneVersion = detectVersion(emojione);
                        emojioneSupportMode = getSupportMode(emojioneVersion);
                        var sprite;
                        cdn.base = cdn.defaultBase + "/assets";
                        sprite = cdn.base + "/emojione.sprites.css";
                        if (options.sprite) {
                            if (document.createStyleSheet) {
                                document.createStyleSheet(sprite);
                            } else {
                                $('<link/>', {rel: 'stylesheet', href: sprite}).appendTo('head');
                            }
                        }
                        while (readyCallbacks.length) {
                            readyCallbacks.shift().call();
                        }
                        cdn.isLoading = false;
                    }
                });
            } else {
                emojioneVersion = detectVersion(emojione);
                emojioneSupportMode = getSupportMode(emojioneVersion);
                cdn.base = cdn.defaultBase + "/assets";
            }
        }

        emojioneReady(function() {
            var emojiSize = "";
            if (options.useInternalCDN) {
                if (emojioneSupportMode > 4) emojiSize = emojione.emojiSize + "/";

                emojione.imagePathPNG = cdn.base + "/emoji/";
                emojione.imagePathSVG = cdn.base + "/emoji/";
                emojione.imagePathSVGSprites = cdn.base + "/sprites/emojione.sprites.svg";
                emojione.imageType = options.imageType;
            }
            if (getSupportMode(emojioneVersion) > 4) {
                uniRegexp = emojione.regUnicode;
                emojione.imageType = options.imageType || "png";
            } else {
                uniRegexp = new RegExp("<object[^>]*>.*?<\/object>|<span[^>]*>.*?<\/span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|(" + emojione.unicodeRegexp + ")", "gi");
            }
        });
    };
});
