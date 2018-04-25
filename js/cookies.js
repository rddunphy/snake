function CookieHandler() {
    this.initialise();
}

CookieHandler.prototype.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";";
};

CookieHandler.prototype.getCookie = function(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
};

CookieHandler.prototype.initialise = function() {
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#216942",
                "text": "#b2d192"
            },
            "button": {
                "background": "#afed71"
            }
        },
        "content": {
            "message": "This site uses cookies to remember your settings and highscores.",
            "dismiss": "Okay"
        }
    });
};
