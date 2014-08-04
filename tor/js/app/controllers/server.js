define(["pj", "pjsheet", "gamedata", "rivets", "text", "basecontroller", "jquery", "extends", "jquery.ui",
    "txt!views/server/connect.html",
    "txt!views/server/loadcharacter.html"],
function (Pj, PjSheet, Gamedata, Rivets, Text, BaseController, $, _extends) {

    var Server = (function (_super) {
        _extends(Server, BaseController);

        function Server() {
            _super.call(this);
            this.connected = false;
            this.username = null;
            this.password = null;
            this.alias = "Gollum";
            //            this.serverBaseUrl = "http://azrapse.es/torServer";
            this.serverBaseUrl = "http://localhost:8080/torServer/";
            this.characterLoadUrl = this.serverBaseUrl + "characters/ajax_list_public";
            this.isValid = false;
        };

        /** Credentials **/

        Server.prototype.connectDialog = function () {
            var template = require("txt!views/server/connect.html");
            var model = { controller: this, credentials: { username: this.username, password: this.password, alias: this.alias} };
            return this.createView(template, model);
        };

        // Validate the username, password and alias

        var checkValidTexts = function (username, password, alias) {
            this.isValid = (username && password && alias);
        }

        Server.prototype.onTextChanged = function (event, models) {
            checkValidTexts.call(models.controller, models.credentials.username, models.credentials.password, models.credentials.alias);
        }

        Server.prototype.connectClick = function (event, models) {
            var controller = models.controller;
            checkValidTexts(models.credentials.username, models.credentials.password, models.credentials.alias);
            if (controller.isValid) {
                controller.disposeView();
                controller.connectToServer(models.credentials.username, models.credentials.password, models.credentials.alias);
            }
        };

        Server.prototype.cancelClick = function (event, models) {
            models.controller.disposeView();
        };

        Server.prototype.connectToServer = function (username, password, alias) {
            this.loadCharacterDialog();
        };

        /** Load character **/

        Server.prototype.loadCharacterDialog = function () {
            var template = require("txt!views/server/loadcharacter.html");
            this.isLoading = false;
            this.message = "0";
            var model = { controller: this, characters: [] };
            return this.createView(template, model);
        };

        Server.prototype.loadAllClick = function (e, models) {
            var self = models.controller;
            self.isLoading = true;
            $.ajax({
                cache: false,
                url: self.characterLoadUrl,
                dataType: "json"
            })
            .done(function (data, status, response) {
                models.characters = data;
                self.message = data.length;
            })
            .always(function () {
                self.isLoading = false;
            });
        };

        return Server;
    })(BaseController);

    var singleton = singleton || new Server();
    return singleton;
});