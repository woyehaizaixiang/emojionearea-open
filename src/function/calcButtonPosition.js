define(
function() {
    return function() {
        if(this.options.disabled) return;
        var self = this,
            offset = self.editor[0].offsetWidth - self.editor[0].clientWidth;
        if(self.button){
            var current = parseInt(self.button.css('marginRight'));
        }
        if (current !== offset) {
            self.button && self.button.css({marginRight: offset});
            if (self.floatingPicker) {
                self.picker.css({right: parseInt(self.picker.css('right')) - current + offset});
            }
        }
    }
});