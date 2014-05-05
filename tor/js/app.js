requirejs.config({
    "baseUrl": "js",
    
    "paths": {
        "app": "app",
        "views": "app/views",
        "controllers": "app/controllers",
        "models": "app/models",
        
        "jquery": "lib/jquery-1.11.0",
        "jquery.ui": "lib/jquery-ui-1.10.4.custom.min",
        "jquery.linq": "lib/jquery.linq.min",
        "jquery.cookies": "lib/jquery.cookies",
        "jquery.migrate": "lib/jquery-migrate-1.2.1",
        "modernizr": "lib/modernizr-1.7.min",
        "json": "lib/json-serialization",
        "rivets": "lib/rivets",

        "gamedata": "app/models/gamedata",
        "text": "app/text",
        "tutorial": "app/tutorial",
        "extends": "app/extends",
        "character": "app/models/character",
        "pj": "app/models/pj",
        "pjsheet": "app/models/pjsheet",        
        "txt": "lib/text",
        "tooltip": "app/tooltip",
        "popupMenu": "app/popupMenu"
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