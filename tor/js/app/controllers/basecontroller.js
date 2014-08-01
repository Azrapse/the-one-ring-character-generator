define(["pj", "pjsheet", "gamedata", "rivets", "text", "jquery", "jquery.ui",
    "txt!views/server/connect.html"],
function (Pj, PjSheet, Gamedata, Rivets, Text, $) {

    var BaseController = (function () {
        function BaseController() {
            this.container = $(document.body);
            this.view = null;
            this.element = null;
        };

        BaseController.prototype.createView = function (template, models) {
            this.disposeView();
            var template = $.parseHTML(template)
                .filter(function (e) { return e instanceof HTMLElement; })[0];
            this.element = $(template);
            this.container.append(this.element);
            this.element.draggable();
            this.view = Rivets.bind(this.element, models);
            Text.localizeAll(this.element);
            return { view: this.view, element: this.element };
        };

        BaseController.prototype.disposeView = function () {
            if (this.view) {
                this.view.unbind();
                this.view = null;
            }
            if (this.element) {
                this.element.remove();
                this.element = null;
            }
        };


        return BaseController;
    })();
    
    return BaseController;
});