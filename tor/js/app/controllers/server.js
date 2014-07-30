define(["pj", "pjsheet", "gamedata", "rivets", "text", "jquery", "jquery.ui",
    "txt!views/server/connect.html"],
function (Pj, PjSheet, Gamedata, Rivets, Text, $) {

    var Server = {
        connected: false,
        username: null,
        password: null,
        alias: "Gollum",
        serverBaseUrl: "http://azrapse.es/torServer"
    };

    var container = $(document.body);
    var view = null;
    var element = null;

    function createView(template, models) {
        disposeView();
        var template = $.parseHTML(template)
            .filter(function (e) { return e instanceof HTMLElement; })[0];
        element = $(template);
        container.append(element);
        element.draggable();
        view = Rivets.bind(element, models);
        Text.localizeAll(element);
        return { view: view, element: element };
    }

    function disposeView() {
        if (view) {
            view.unbind();
            view = null;
        }
        if (element) {
            element.remove();
            element = null;
        }
    }

    Server.connectDialog = function () {
        var template = require("txt!views/server/connect.html");
        var model = { controller: Server, credentials: { username: Server.username, password: Server.password, alias: Server.alias} };
        return createView(template, model);
    };

    Server.connectClick = function (event, models) {
        disposeView();
        Server.connectToServer(models.credentials.username, models.credentials.password, models.credentials.alias);
    };

    Server.cancelClick = function (event, models) {
        disposeView();
    };

    Server.connectToServer = function (username, password, alias) {
        alert("Connecting to " + Server.serverBaseUrl + " with group " + username + " as " + alias);
    };

    return Server;
});