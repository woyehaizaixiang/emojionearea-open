define([
    'jquery',
    'var/emojione',
    'var/blankImg',
    'var/slice',
    'var/css_class',
    'var/emojioneSupportMode',
    'var/invisibleChar',
    'function/trigger',
    'function/attach',
    'function/shortnameTo',
    'function/pasteHtmlAtCaret',
    'function/getOptions',
    'function/saveSelection',
    'function/restoreSelection',
    'function/htmlFromText',
    'function/textFromHtml',
    'function/isObject',
    'function/calcButtonPosition',
    'function/lazyLoading',
    'function/selector',
    'function/div',
    'function/updateRecent',
    'function/getRecent',
    'function/setRecent',
    'function/supportsLocalStorage'
    //'function/calcElapsedTime', // debug only
],
function($, emojione, blankImg, slice, css_class, emojioneSupportMode, invisibleChar, trigger, attach, shortnameTo,
         pasteHtmlAtCaret, getOptions, saveSelection, restoreSelection, htmlFromText, textFromHtml, isObject,
         calcButtonPosition, lazyLoading, selector, div, updateRecent, getRecent, setRecent, supportsLocalStorage)
{
    return function(self, source, options) {
        //calcElapsedTime('init', function() {
        self.options = options = getOptions(options);
        self.sprite = options.sprite && emojioneSupportMode < 3;
        self.inline = options.inline === null ? source.is("INPUT") : options.inline;
        self.shortnames = options.shortnames;
        self.saveEmojisAs = options.saveEmojisAs;
        self.standalone = options.standalone;
        self.emojiTemplate = '<img alt="{alt}" class="emojione' + (self.sprite ? '-{uni}" src="' + blankImg + '"/>' : 'emoji" src="{img}"/>');
        self.emojiTemplateAlt = self.sprite ? '<i class="emojione-{uni}"/>' : '<img class="emojioneemoji" src="{img}"/>';
        self.emojiBtnTemplate = '<i class="emojibtn" role="button" data-name="{name}" title="{friendlyName}">' + self.emojiTemplateAlt + '</i>';
        self.recentEmojis = options.recentEmojis && supportsLocalStorage();

        var pickerPosition = options.pickerPosition;
        self.floatingPicker = pickerPosition === 'top' || pickerPosition === 'bottom';
        self.source = source;

        if (source.is(":disabled") || source.is(".disabled")) {
            self.disable();
        }

        var sourceValFunc = source.is("TEXTAREA") || source.is("INPUT") ? "val" : "text",
            editor, buttoninsert, button, picker, filters, filtersBtns, searchPanel, emojisList, categories, categoryBlocks, scrollArea,
            tones = div('tones',
                options.tones ?
                    function() {
                        this.addClass(selector('tones-' + options.tonesStyle, true));
                        for (var i = 0; i <= 5; i++) {
                            this.append($("<i/>", {
                                "class": "btn-tone btn-tone-" + i + (!i ? " active" : ""),
                                "data-skin": i,
                                role: "button"
                            }));
                        }
                    } : null
            ),
            app = div({
                "class" : css_class + ((self.standalone) ? " " + css_class + "-standalone " : " ") + (source.attr("class") || ""),
                role: "application"
            },
            editor = self.editor = div("editor").attr({
                contenteditable: (self.standalone || options.disabled) ? false : true,
                placeholder: options.placeholder || source.data("placeholder") || source.attr("placeholder") || "",
                tabindex: 0
            }),
            // 添加插入功能按钮
            buttoninsert = options.insert?self.buttoninsert = div('buttoninsert',
                div('buttoninsert-btn')
            ): null,
            button = self.button = !options.disabled?(div('button',
                div('button-open'),
                div('button-close')
            ).attr('title', options.buttonTitle)):null,
            picker = self.picker = options.disabled
            ? null
            : div('picker',
                div('wrapper',
                    filters = div('filters'),
                    (options.search ?
                        searchPanel = div('search-panel',
                            div('search',
                                options.search ?
                                function() {
                                    self.search = $("<input/>", {
                                        "placeholder": options.searchPlaceholder || "",
                                        "type": "text",
                                        "class": "search"
                                    });
                                    this.append(self.search);
                                } : null
                            ),
                            tones
                        ) : null
                    ),
                    scrollArea = div('scroll-area',
                        options.tones && !options.search ? div('tones-panel',
                            tones
                        ) : null,
                        emojisList = div('emojis-list')
                    )
                )
            ).addClass(selector('picker-position-' + options.pickerPosition, true))
             .addClass(selector('filters-position-' + options.filtersPosition, true))
             .addClass(selector('search-position-' + options.searchPosition, true))
             .addClass('hidden')
        );

        if (options.search && !options.disabled) {
            searchPanel.addClass(selector('with-search', true));
        }

        self.searchSel = null;

        editor.data(source.data());

        $.each(options.attributes, function(attr, value) {
            editor.attr(attr, value);
        });

        var mainBlock = div('category-block').attr({"data-tone": 0}).prependTo(emojisList);

        $.each(options.filters, function(filter, params) {
            var skin = 0;
            if (filter === 'recent' && !self.recentEmojis) {
                return;
            }
            if (filter !== 'tones') {
                $("<i/>", {
                    "class": selector("filter", true) + " " + selector("filter-" + filter, true),
                    "data-filter": filter,
                    title: params.title
                })
                .wrapInner(shortnameTo(params.icon, self.emojiTemplateAlt))
                .appendTo(filters);
            } else if (options.tones) {
                skin = 5;
            } else {
                return;
            }

            do {
                var category,
                    items = params.emoji.replace(/[\s,;]+/g, '|');

                if (skin === 0) {
                    category = div('category').attr({
                        name: filter,
                        "data-tone": skin
                    }).appendTo(mainBlock);
                } else {
                    category = div('category-block').attr({
                        name: filter,
                        "data-tone": skin
                    }).appendTo(emojisList);
                }

                if (skin > 0) {
                    category.hide();
                    items = items.split('|').join('_tone' + skin + '|') + '_tone' + skin;
                }

                if (filter === 'recent') {
                    items = getRecent();
                }

                items = shortnameTo(items,
                    self.sprite ?
                        '<i class="emojibtn" role="button" data-name="{name}" title="{friendlyName}"><i class="emojione-{uni}"></i></i>' :
                        '<i class="emojibtn" role="button" data-name="{name}" title="{friendlyName}"><img class="emojioneemoji lazy-emoji" data-src="{img}"/></i>',
                    true).split('|').join('');

                category.html(items);
                $('<div class="emojionearea-category-title"/>').text(params.title).prependTo(category);
            } while (--skin > 0);
        });

        options.filters = null;
        if (!self.sprite) {
            self.lasyEmoji = emojisList && emojisList.find(".lazy-emoji");
        }

        filtersBtns = filters && filters.find(selector("filter"));
        filtersBtns && filtersBtns.eq(0).addClass("active");
        categoryBlocks = emojisList && emojisList.find(selector("category-block"))
        categories = emojisList && emojisList.find(selector("category"))

        self.recentFilter = filtersBtns && filtersBtns.filter('[data-filter="recent"]');
        self.recentCategory = categories && categories.filter("[name=recent]");

        self.scrollArea = scrollArea;

        if (options.container) {
            $(options.container).wrapInner(app);
        } else {
            app.insertAfter(source);
        }

        if (options.hideSource) {
            source.hide();
        }

        self.setText(source[sourceValFunc]());
        source[sourceValFunc](self.getText());
        !options.disabled && calcButtonPosition.apply(self);

        // if in standalone mode and no value is set, initialise with a placeholder
        if (self.standalone && !self.getText().length) {
            var placeholder = $(source).data("emoji-placeholder") || options.emojiPlaceholder;
            self.setText(placeholder);
            editor.addClass("has-placeholder");
        }

        // attach() must be called before any .on() methods !!!
        // 1) attach() stores events into possibleEvents{},
        // 2) .on() calls bindEvent() and stores handlers into eventStorage{},
        // 3) bindEvent() finds events in possibleEvents{} and bind founded via jQuery.on()
        // 4) attached events via jQuery.on() calls trigger()
        // 5) trigger() calls handlers stored into eventStorage{}

        if(!options.disabled){
            attach(self, emojisList.find(".emojibtn"), {click: "emojibtn.click"});
            attach(self, window, {resize: "!resize"});
            attach(self, tones.children(), {click: "tone.click"});
            attach(self, [picker, button], {mousedown: "!mousedown"}, editor);
            attach(self, button, {click: "button.click"});
            attach(self, [picker, buttoninsert], {mousedown: "!mousedown"}, editor);
            attach(self, buttoninsert, {click: "buttoninsert.click"});
            // 新增支持insert插入方法，但需传入触发事件的dom
            options.insertel && attach(self, [picker, options.insertel], {mousedown: "!mousedown"}, editor);
            attach(self, editor, {paste :"!paste"}, editor);
            attach(self, editor, ["focus", "blur"], function() { return self.stayFocused ? false : editor; } );
            attach(self, picker, {mousedown: "picker.mousedown", mouseup: "picker.mouseup", click: "picker.click",
                keyup: "picker.keyup", keydown: "picker.keydown", keypress: "picker.keypress"});
            attach(self, editor, ["mousedown", "mouseup", "click", "keyup", "keydown", "keypress", "cut",]);
            attach(self, picker.find(".emojionearea-filter"), {click: "filter.click"});
            attach(self, source, {change: "source.change"});

            if (options.search && !options.disabled) {
                attach(self, self.search, {keyup: "search.keypress", focus: "search.focus", blur: "search.blur"});
            }
        }

        var noListenScroll = false;
        scrollArea && scrollArea.on('scroll', function () {
            if (!noListenScroll) {
                lazyLoading.call(self);
                if (scrollArea.is(":not(.skinnable)")) {
                    var item = categories.eq(0), scrollTop = scrollArea.offset().top;
                    categories.each(function (i, e) {
                        if ($(e).offset().top - scrollTop >= 10) {
                            return false;
                        }
                        item = $(e);
                    });
                    var filter = filtersBtns.filter('[data-filter="' + item.attr("name") + '"]');
                    if (filter[0] && !filter.is(".active")) {
                        filtersBtns.removeClass("active");
                        filter.addClass("active");
                    }
                }
            }
        });

        self.on("@filter.click", function(filter) {
            var isActive = filter.is(".active");
            if (scrollArea.is(".skinnable")) {
                if (isActive) return;
                tones.children().eq(0).click();
            }
            noListenScroll = true;
            if (!isActive) {
                filtersBtns.filter(".active").removeClass("active");
                filter.addClass("active");
            }
            var headerOffset = categories.filter('[name="' + filter.data('filter') + '"]').offset().top,
                scroll = scrollArea.scrollTop(),
                offsetTop = scrollArea.offset().top;

            scrollArea.stop().animate({
                scrollTop: headerOffset + scroll - offsetTop - 2
            }, 200, 'swing', function () {
                lazyLoading.call(self);
                noListenScroll = false;
            });
        })

        .on("@picker.show", function() {
            if (self.recentEmojis) {
                updateRecent(self);
            }
            lazyLoading.call(self);
        })

        .on("@tone.click", function(tone) {
            tones.children().removeClass("active");
            var skin = tone.addClass("active").data("skin");
            if (skin) {
                scrollArea.addClass("skinnable");
                categoryBlocks.hide().filter("[data-tone=" + skin + "]").show();
                filtersBtns.removeClass("active");//.not('[data-filter="recent"]').eq(0).addClass("active");
            } else {
                scrollArea.removeClass("skinnable");
                categoryBlocks.hide().filter("[data-tone=0]").show();
                filtersBtns.eq(0).click();
            }
            lazyLoading.call(self);
            if (options.search && !options.disabled) {
                self.trigger('search.keypress');
            }
        })

        .on("@button.click", function(button) {
            if (button.is(".active")) {
                self.hidePicker();
            } else {
                self.showPicker();
                self.searchSel = null;
            }
        })

        // 点击插入按钮
        .on("@buttoninsert.click", function(buttoninsert) {
            pasteHtmlAtCaret(options.insert);
        })

        .on("@!paste", function(editor, event) {
            if(options.disabled) return;
            var pasteText = function(text) {
                var caretID = "caret-" + (new Date()).getTime();
                var html = htmlFromText(text, self);
                pasteHtmlAtCaret(html);
                pasteHtmlAtCaret('<i id="' + caretID +'"></i>');
                editor.scrollTop(editorScrollTop);
                var caret = $("#" + caretID),
                    top = caret.offset().top - editor.offset().top,
                    height = editor.height();
                if (editorScrollTop + top >= height || editorScrollTop > top) {
                    editor.scrollTop(editorScrollTop + top - 2 * height/3);
                }
                caret.remove();
                self.stayFocused = false;
                calcButtonPosition.apply(self);
                trigger(self, 'paste', [editor, text, html]);
            };

            if (event.originalEvent.clipboardData) {
                var text = event.originalEvent.clipboardData.getData('text/plain');
                pasteText(text);

                if (event.preventDefault){
                    event.preventDefault();
                } else {
                    event.stop();
                }

                event.returnValue = false;
                event.stopPropagation();
                return false;
            }

            self.stayFocused = true;
            // insert invisible character for fix caret position
            pasteHtmlAtCaret('<span>' + invisibleChar + '</span>');

            var sel = saveSelection(editor[0]),
                editorScrollTop = editor.scrollTop(),
                clipboard = $("<div/>", {contenteditable: true})
                    .css({position: "fixed", left: "-999px", width: "1px", height: "1px", top: "20px", overflow: "hidden"})
                    .appendTo($("BODY"))
                    .focus();

            window.setTimeout(function() {
                editor.focus();
                restoreSelection(editor[0], sel);
                var text = textFromHtml(clipboard.html().replace(/\r\n|\n|\r/g, '<br>'), self);
                clipboard.remove();
                pasteText(text);
            }, 200);
        })
        .on("@emojibtn.click", function(emojibtn) {
            editor.removeClass("has-placeholder");

            if (self.searchSel !== null) {
                editor.focus();
                restoreSelection(editor[0], self.searchSel);
                self.searchSel = null;
            }
            if (self.standalone) {
                editor.html(shortnameTo(emojibtn.data("name"), self.emojiTemplate));
                self.trigger("blur");
            } else {
                saveSelection(editor[0]);
                pasteHtmlAtCaret(shortnameTo(emojibtn.data("name"), self.emojiTemplate));
            }

            if (self.recentEmojis) {
                setRecent(self, emojibtn.data("name"));
            }

            // self.search.val('').trigger("change");
            self.trigger('search.keypress');
        })

        .on("@!resize @keyup @emojibtn.click", !options.disabled && calcButtonPosition)

        .on("@!mousedown", function(editor, event) {
            if ($(event.target).hasClass('search')) {
                // Allow search clicks
                self.stayFocused = true;
                if (self.searchSel === null) {
                    self.searchSel = saveSelection(editor[0]);
                }
            } else {
                if (!app.is(".focused")) {
                    editor.trigger("focus");
                }
                event.preventDefault();
            }
            return false;
        })

        .on("@change", function() {
            var html = self.editor.html().replace(/<\/?(?:div|span|p)[^>]*>/ig, '');
            // clear input: chrome adds <br> when contenteditable is empty
            if (!html.length || /^<br[^>]*>$/i.test(html)) {
                self.editor.html(self.content = '');
            }
            source[sourceValFunc](self.getText());
        })

        .on("@source.change", function() {
            self.setText(source[sourceValFunc]());
            trigger('change');
        })

        .on("@focus", function() {
            app.addClass("focused");
        })

        .on("@blur", function() {
            app.removeClass("focused");

            if (options.hidePickerOnBlur) {
                self.hidePicker();
            }

            var content = self.editor.html();
            if (self.content !== content) {
                self.content = content;
                trigger(self, 'change', [self.editor]);
                source.trigger("blur").trigger("change");
            } else {
                source.trigger("blur");
            }

            if (options.search && !options.disabled) {
                self.search.val('');
                self.trigger('search.keypress', true);
            }
        })

        // v1.1.1新增优化change事件
        .on("@paste", function() {
            var content = self.editor.html();
            if (self.content !== content) {
                self.content = content;
                trigger(self, 'change', [self.editor]);
            }
        })

        .on("@cut", function() {
            setTimeout(function(){
                var content = self.editor.html();
                if (self.content !== content) {
                    self.content = content;
                    trigger(self, 'change', [self.editor]);
                }
            })
        })

        .on("@keyup", function() {
            var content = self.editor.html();
            if (self.content !== content) {
                self.content = content;
                trigger(self, 'change', [self.editor]);
            }
        });

        if (options.search && !options.disabled) {
            self.on("@search.focus", function() {
                self.stayFocused = true;
                self.search.addClass("focused");
            })

            .on("@search.keypress", function(hide) {
                var filterBtns = picker.find(".emojionearea-filter");
                var activeTone = (options.tones ? tones.find("i.active").data("skin") : 0);
                var term = self.search.val().replace( / /g, "_" ).replace(/"/g, "\\\"");

                if (term && term.length) {
                    if (self.recentFilter.hasClass("active")) {
                        self.recentFilter.removeClass("active").next().addClass("active");
                    }

                    self.recentCategory.hide();
                    self.recentFilter.hide();

                    categoryBlocks.each(function() {
                        var matchEmojis = function(category, activeTone) {
                            var $matched = category.find('.emojibtn[data-name*="' + term + '"]');
                            if ($matched.length === 0) {
                                if (category.data('tone') === activeTone) {
                                    category.hide();
                                }
                                filterBtns.filter('[data-filter="' + category.attr('name') + '"]').hide();
                            } else {
                                var $notMatched = category.find('.emojibtn:not([data-name*="' + term + '"])');
                                $notMatched.hide();

                                $matched.show();

                                if (category.data('tone') === activeTone) {
                                    category.show();
                                }

                                filterBtns.filter('[data-filter="' + category.attr('name') + '"]').show();
                            }
                        }

                        var $block = $(this);
                        if ($block.data('tone') === 0) {
                            categories.filter(':not([name="recent"])').each(function() {
                                matchEmojis($(this), 0);
                            })
                        } else {
                            matchEmojis($block, activeTone);
                        }
                    });
                    if (!noListenScroll) {
                        scrollArea.trigger('scroll');
                    } else {
                        lazyLoading.call(self);
                    }
                } else {
                    updateRecent(self, true);
                    categoryBlocks.filter('[data-tone="' + tones.find("i.active").data("skin") + '"]:not([name="recent"])').show();
                    $('.emojibtn', categoryBlocks).show();
                    filterBtns.show();
                    lazyLoading.call(self);
                }
            })

            .on("@search.blur", function() {
                self.stayFocused = false;
                self.search.removeClass("focused");
                self.trigger("blur");
            });
        }

        if (options.shortcuts) {
            self.on("@keydown", function(_, e) {
                if (!e.ctrlKey) {
                    if (e.which == 9) {
                        e.preventDefault();
                        button.click();
                    }
                    else if (e.which == 27) {
                        e.preventDefault();
                        if (button.is(".active")) {
                            self.hidePicker();
                        }
                    }
                }
            });
        }

        if (isObject(options.events) && !$.isEmptyObject(options.events)) {
            $.each(options.events, function(event, handler) {
                self.on(event.replace(/_/g, '.'), handler);
            });
        }

        if (options.autocomplete) {
            var autocomplete = function() {
                var textcompleteOptions = {
                    maxCount: options.textcomplete.maxCount,
                    placement: options.textcomplete.placement
                };

                if (options.shortcuts) {
                    textcompleteOptions.onKeydown = function (e, commands) {
                        if (!e.ctrlKey && e.which == 13) {
                            return commands.KEY_ENTER;
                        }
                    };
                }

                var map = $.map(emojione.emojioneList, function (_, emoji) {
                    return !options.autocompleteTones ? /_tone[12345]/.test(emoji) ? null : emoji : emoji;
                });
                map.sort();
                editor.textcomplete([
                    {
                        id: css_class,
                        match: /\B(:[\-+\w]*)$/,
                        search: function (term, callback) {
                            callback($.map(map, function (emoji) {
                                return emoji.indexOf(term) === 0 ? emoji : null;
                            }));
                        },
                        template: function (value) {
                            return shortnameTo(value, self.emojiTemplate) + " " + value.replace(/:/g, '');
                        },
                        replace: function (value) {
                            return shortnameTo(value, self.emojiTemplate);
                        },
                        cache: true,
                        index: 1
                    }
                ], textcompleteOptions);

                if (options.textcomplete.placement) {
                    // Enable correct positioning for textcomplete
                    if ($(editor.data('textComplete').option.appendTo).css("position") == "static") {
                        $(editor.data('textComplete').option.appendTo).css("position", "relative");
                    }
                }
            };

            var initAutocomplete = function() {
                if (self.disabled) {
                    var enable = function () {
                        self.off('enabled', enable);
                        autocomplete();
                    };
                    self.on('enabled', enable);
                } else {
                    autocomplete();
                }
            }

            if ($.fn.textcomplete) {
                initAutocomplete();
            } else {
                // 禁用自动匹配
                initAutocomplete
                // $.ajax({
                //     url: "https://cdn.bootcdn.net/ajax/libs/jquery.textcomplete/1.3.4/jquery.textcomplete.js",
                //     dataType: "script",
                //     cache: true,
                //     success: initAutocomplete
                // });
            }
        }

        if (self.inline) {
            app.addClass(selector('inline', true));
            self.on("@keydown", function(_, e) {
                if (e.which == 13) {
                    e.preventDefault();
                }
            });
        }

        if (/firefox/i.test(navigator.userAgent)) {
            // disabling resize images on Firefox
            document.execCommand("enableObjectResizing", false, false);
        }

        self.isReady = true;
        self.trigger("onLoad", editor);
        self.trigger("ready", editor);
        //}, self.id === 1); // calcElapsedTime()
    };
});
