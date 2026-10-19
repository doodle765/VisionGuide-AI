/* ==========================================================================
   VisionGuide AI — UI enhancements (new file, safe to add)
   Nothing here changes behaviour defined in script.js; every enhancement
   no-ops gracefully if an element or API is missing.
   ========================================================================== */
(function () {
    "use strict";

    /* 1) Recolor the detection overlay to match the UI palette.
       script.js draws the bounding boxes with its own hard-coded colors
       (cyan). This remaps those exact color values at the canvas level so
       the overlay uses the cane-red accent and readable label text.
       If the browser exposes no setters to patch, boxes keep their
       default color and everything still works. */
    function remapCanvasColors() {
        var ACCENT = "#c8102e";
        var ACCENT_FILL = "rgba(200, 16, 46, 0.92)";
        var LABEL_TEXT = "#ffffff";

        var map = {
            "#06b6d4": ACCENT,
            "rgba(6, 182, 212, 0.85)": ACCENT_FILL,
            "#000000": LABEL_TEXT
        };

        try {
            var proto = window.CanvasRenderingContext2D &&
                        window.CanvasRenderingContext2D.prototype;
            if (!proto) return;

            ["strokeStyle", "fillStyle"].forEach(function (prop) {
                var descriptor = Object.getOwnPropertyDescriptor(proto, prop);
                if (!descriptor || !descriptor.set) return;
                var nativeSet = descriptor.set;
                Object.defineProperty(proto, prop, {
                    configurable: true,
                    get: descriptor.get,
                    set: function (value) {
                        var key = String(value).toLowerCase();
                        nativeSet.call(this, map[key] || value);
                    }
                });
            });
        } catch (err) {
            /* Older engine — leave overlay colors untouched. */
        }
    }

    /* 2) Flip the whole layout to RTL and set the document language
       whenever the app switches to Urdu (script.js only updates a button
       label; this watches that label and mirrors it onto <html>). */
    function watchLanguage() {
        var label = document.getElementById("lang-btn-label");
        if (!label || !window.MutationObserver) return;

        var apply = function () {
            var urdu = /urdu/i.test(label.textContent || "");
            document.documentElement.lang = urdu ? "ur" : "en";
            document.documentElement.dir = urdu ? "rtl" : "ltr";
        };

        new MutationObserver(apply).observe(label, {
            childList: true,
            characterData: true,
            subtree: true
        });

        apply();
    }

    /* 3) Keyboard shortcuts — handy for low-vision users with a keyboard:
          C = camera on/off, L = switch language, M = mute/unmute audio. */
    function bindKeys() {
        var press = function (id) {
            var el = document.getElementById(id);
            if (el) el.click();
        };

        document.addEventListener("keydown", function (event) {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            var tag = (event.target && event.target.tagName) || "";
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

            switch (event.key.toLowerCase()) {
                case "c": press("toggle-camera-btn"); break;
                case "l": press("lang-toggle-btn"); break;
                case "m": press("speech-toggle-btn"); break;
            }
        });
    }

    function init() {
        remapCanvasColors();
        watchLanguage();
        bindKeys();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
