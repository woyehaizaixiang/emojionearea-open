define([
    'function/getEmojioneVersion',
],function() {
    var emojioneVersion = getEmojioneVersion()
    return {
        defaultBase: "https://cdn.jsdelivr.net/npm/emojionearea-open@"+emojioneVersion+"/assets",
        base: null,
        isLoading: false
    };
});
