define(["jquery", "extends", "gamedata", "text"],
    function ($, _extends, Gamedata, Text) {

        var PopupMenu = (function () {
            function PopupMenu(initializer, context) {
                this.items = {};
                if (initializer) {
                    for (var itemKey in initializer) {
                        if (initializer.hasOwnProperty(itemKey)) {
                            var config = initializer[itemKey];
                            var callback = config;
                            var condition = null;
                            var cssClass = null;
                            if (!(config instanceof Function)) {
                                callback = config.callback;
                                condition = config.condition;
                                cssClass = config.cssClass;
                            }
                            var item = new MenuItem(this, itemKey, callback, condition, cssClass);
                            this.items[itemKey] = item;
                        }
                    }
                }
                this.context = context;
            }

            PopupMenu.prototype.render = function (containerElement) {
                var menuElement = $(containerElement);
                for (var itemKey in this.items) {
                    if (this.items.hasOwnProperty(itemKey)) {
                        var item = this.items[itemKey];
                        if (item.condition.call(this.context)) {
                            var itemHTML = item.render();
                            var itemElement = $(itemHTML);
                            menuElement.append(itemElement);
                        }
                    }
                }
                return menuElement;
            };

            return PopupMenu;
        }());

        var MenuItem = (function () {
            function MenuItem(menu, key, callback, condition, cssClass) {
                this.menu = menu;
                this.key = key;
                this.condition = condition || function () { return true; };
                this.callback = callback || function () { };
                this.cssClass = cssClass || "action";
            }

            MenuItem.prototype.render = function () {
                var element = $("div")
                    .addClass(this.cssClass)
                    .attr("data-id", this.key)
                    .html(Text.getText(this.key));
                return element;
            };

            return MenuItem;
        }());

        return PopupMenu;
    });