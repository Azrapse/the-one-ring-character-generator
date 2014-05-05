define(["jquery", "gamedata", "text"],
    function ($, Gamedata, Text) {

        var PopupMenu = (function () {
            function PopupMenu(container, initializer, context) {
                var self = this;
                this.items = {};
                if (!this.lockElement(container)) {
                    return false;
                }
                this.container = container;

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
                var handleClicks = function (event) {
                    var itemId = $(this).attr("data-id");
                    if (itemId in self.items) {
                        var item = self.items[itemId];
                        item.callback.call(item, self.context);
                    }
                };
                this.container.on("click", ".menuItem", handleClicks);
            }

            PopupMenu.prototype.render = function () {
                var menuElement = this.container;
                menuElement.empty();
                for (var itemKey in this.items) {
                    if (this.items.hasOwnProperty(itemKey)) {
                        var item = this.items[itemKey];
                        if (item.condition.call(item, this.context)) {
                            var itemHTML = item.render();
                            var itemElement = $(itemHTML);
                            menuElement.append(itemElement);
                        }
                    }
                }
                menuElement.show();
                return menuElement;
            };

            PopupMenu.prototype.close = function () {
                if (this.container) {
                    this.container.empty().hide();
                    this.container.off("click", ".menuItem");
                    this.unlockElement(this.container);
                }
            };

            // Interactive menus
            PopupMenu.prototype.show = function (x, y) {
                if (this.container) {
                    this.render();
                    this.container
                        .css("left", x)
                        .css("top", y)
                        .show();
                }
            };

            // A map between elements and menus
            PopupMenu.prototype.lockedElements = [];
            PopupMenu.prototype.lockElement = function (element) {
                if (element.length) {
                    element = element[0];
                }
                if (PopupMenu.prototype.lockedElements.indexOf(element) != -1) {
                    return false;
                } else {
                    PopupMenu.prototype.lockedElements.push(element);
                    return true;
                }
            };
            PopupMenu.prototype.unlockElement = function (element) {
                if (element.length) {
                    element = element[0];
                }
                var index = PopupMenu.prototype.lockedElements.indexOf(element);
                if (index != -1) {
                    PopupMenu.prototype.lockedElements.splice(index, 1);
                }
            };
            return PopupMenu;
        } ());

        var MenuItem = (function () {
            function MenuItem(menu, key, callback, condition, cssClass) {
                this.menu = menu;
                this.key = key;
                this.condition = condition || function () { return true; };
                this.callback = callback || function () { };
                this.cssClass = cssClass || "";
            }

            MenuItem.prototype.render = function () {
                var element = $("<div>")
                    .addClass("action")
                    .addClass("menuItem")
                    .addClass(this.cssClass)
                    .attr("data-id", this.key)
                    .html(Text.getText(this.key));
                return element;
            };

            return MenuItem;
        } ());

        return PopupMenu;
    });