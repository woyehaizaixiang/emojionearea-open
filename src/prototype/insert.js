define([
  'jquery',
  'function/pasteHtmlAtCaret',
  'function/trigger',
  'prototype/var/EmojioneArea'
],
function($, pasteHtmlAtCaret, trigger, EmojioneArea) {
  EmojioneArea.prototype.insert = function (str) {
    pasteHtmlAtCaret(str);
  }
});