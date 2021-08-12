define([
    'function/getEmojioneVersion',
],function(getEmojioneVersion) {
    var emojioneVersion = getEmojioneVersion()
    return {
        defaultBase: "https://cdn.jsdelivr.net/npm/emojionearea-open@"+emojioneVersion+"/assets",
        base: null,
        isLoading: false
    };
});
