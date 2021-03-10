define([
  'jquery',
  'function/pasteHtmlAtCaret',
  'function/htmlFromText',
  'prototype/var/EmojioneArea'
],
function($, pasteHtmlAtCaret, htmlFromText, EmojioneArea) {
  EmojioneArea.prototype.insert = function (str) {
    var self = this;
    var html = htmlFromText(str, self);
    pasteHtmlAtCaret(html);
  }
});