requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
        "app": "../app",
        "jquery": "jquery-1.11.0",
        "jquery.ui": "jquery-ui-1.10.4.custom.min",
        "jquery.linq": "jquery.linq.min",
        "jquery.migrate": "jquery-migrate-1.2.1",
        "modernizr": "modernizr-1.7.min",
        "json": "json-serialization",
        "gamedata": "../app/gamedata"
    },
    "shim": {
        "jquery.linq": ["jquery"],
        "jquery.ui": ["jquery"],
        "jquery.cookies": ["jquery"],
        "jquery.migrate": ["jquery"]
    }
});

// Load the main app module to start the app
requirejs(["app/code"]);