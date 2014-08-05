define(["pj", "pjsheet", "gamedata", "rivets", "text", "basecontroller", "jquery", "extends", "jquery.ui", "jquery.cookies",
    "txt!views/server/connect.html",
    "txt!views/server/loadcharacter.html"],
function (Pj, PjSheet, Gamedata, Rivets, Text, BaseController, $, _extends) {

    var Server = (function (_super) {
        _extends(Server, BaseController);

        function Server() {
            _super.call(this);
            this.connected = false;
            this.username = $.cookie('username') || "";
            this.password = $.cookie('password') || "";
            this.alias = $.cookie('alias') || "Gollum";
            //            this.serverBaseUrl = "http://azrapse.es/torServer";
            this.serverBaseUrl = "http://localhost:8080/torServer/";
            this.allCharactersLoadUrl = this.serverBaseUrl + "characters/ajax_list_public";
            this.myCharactersLoadUrl = this.serverBaseUrl + "characters/ajax_list_own";            
        };

        /** Credentials **/

        Server.prototype.connectDialog = function () {
            var template = require("txt!views/server/connect.html");            
            var model = { controller: this };
            this.createView(template, model);
        };

        // Validate the username, password and alias

        Server.prototype.isValid = function () {
            return this.username && this.password && this.alias;
        };

        Server.prototype.connectClick = function (event, models) {
            var self = models.controller;            
            if (self.isValid) {
                self.disposeView();
                self.connectToServer(self.username, self.password, self.alias);
            }
        };

        Server.prototype.cancelClick = function (event, models) {
            var self = models.controller;
            self.characters = [];
            self.disposeView();
        };

        Server.prototype.connectToServer = function (username, password, alias) {
            if (this.isValid) {
                $.cookie('username', username, { expires: 3650 });
                $.cookie('password', password, { expires: 3650 });
                $.cookie('alias', alias, { expires: 3650 });
                this.username = username;
                this.password = password;
                this.alias = alias;
                this.loadCharacterDialog();
            }

        };

        /** Load character **/

        Server.prototype.loadCharacterDialog = function () {
            var template = require("txt!views/server/loadcharacter.html");
            this.isLoading = false;
            this.message = "0";
            var model = { controller: this };
            this.characters = [];
            return this.createView(template, model);
        };

        Server.prototype.loadAllClick = function (e, models) {
            var self = models.controller;
            self.characters = [];
            self.isLoading = true;
            self.readOnly = true;
            $.ajax({
                cache: false,
                url: self.allCharactersLoadUrl,
                dataType: "json",
                type: "POST"
            })
            .done(function (data, status, response) {
                self.characters = data;
                self.message = data.length;
            })
            .always(function () {
                self.isLoading = false;
            });
        };

        Server.prototype.loadMineClick = function (e, models) {
            var self = models.controller;
            self.characters = [];
            self.isLoading = true;
            self.readOnly = false;
            var username = self.username;
            var password = self.password;
            $.ajax({
                cache: false,
                url: self.myCharactersLoadUrl,
                data: { username: username, password: password },
                dataType: "json",
                type: "POST"
            })
            .done(function (data, status, response) {
                self.characters = data;
                self.message = data.length;
            })
            .always(function () {
                self.isLoading = false;
            });
        };

        Server.prototype.characterRowClick = function (e, models) {
            var self = models.controller;
            self.characters
                .filter(function (c) { return c.selected; })
                .forEach(function (c) { c.selected = false; });
            var character = models.character;
            character.selected = true;
            self.selectedCharacter = character;
        };

        return Server;
    })(BaseController);

    var singleton = singleton || new Server();
    return singleton;
});