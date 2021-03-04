define([
  'jquery',
  'function/pasteHtmlAtCaret',
  'prototype/var/EmojioneArea'
],
function($, pasteHtmlAtCaret, EmojioneArea) {
  EmojioneArea.prototype.pasteHtmlAtCaret = function (str) {
    pasteHtmlAtCaret(str);
  }
});