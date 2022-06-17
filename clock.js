Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

Clock = function(selector, options) {
    this.tickId;  // Timeout function
    this.selector = selector;
    this.options = options || {};
    this._parent = $(selector)
    // State
    this.hrs = null;
    this.mins = null;
    // Init HTML
    var html = `<span class="clk-hrs"></span><span class="clk-sep">:</span><span class="clk-mins"></span><span class="clk-sep">:</span><span class="clk-secs"></span>`;
    if (this.options["24hr"] === false) {
        html += '<span class="clk-ampm"></span>';
    }
    this._parent.html(html);
}

Clock.prototype.tick = function() {
    let now = new Date();
    hours = now.getHours();
    mins = now.getMinutes();
    ampm = "";
    if ("24hr" in this.options && this.options["24hr"] === false) {
        if (hours > 11) {
            ampm = "pm";
        } else {
            ampm = "am";
        }
        if (hours > 12) {
            hours = hours - 12;
        }
    }
    // Only update hours and minutes if they've changed
    if (hours !== this.hrs) {
        this._parent.find(".clk-hrs").text(`${(hours).pad(2)}`);
        this._parent.find(".clk-ampm").text(" " + ampm);
        this.hrs = hours;
    }
    if (mins !== this.mins) {
        this._parent.find(".clk-mins").text(`${(mins).pad(2)}`);
    }
    this._parent.find(".clk-secs").text(`${(now.getSeconds()).pad(2)}`);
}

Clock.prototype.startTick = function() {
    let _this = this;
    _this.tick();
    this.tickId = setInterval(function() { _this.tick(); }, 1000);
}

Clock.prototype.stopTick = function() {
    clearInterval(this.tickId)
}
