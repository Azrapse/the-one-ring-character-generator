define(["pj", "pjsheet", "gamedata", "text", "rivets", "jquery", "txt!views/generator/culture.html",
    "jquery.linq"],
function (Pj, PjSheet, Gamedata, Text, Rivets, $, cultureTemplate) {
    var PcGenerator = {};
    var pj = null;
    var sheet = null;
    var container = document.body;
    var view = null;
    var element = null;
    PcGenerator.start = function (initializer) {
        pj = null;
        sheet = initializer.sheet;
        container = $(initializer.container || container);

        return PcGenerator.cultureSelection();
    };

    function createView(template, models) {
        disposeView();
        var template = $.parseHTML(template)
            .filter(function (e) { return e instanceof HTMLElement; })[0];
        element = $(template);
        container.append(element);
        view = Rivets.bind(element, models);
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

    PcGenerator.cancel = function () {
        disposeView();
    }

    PcGenerator.cultureSelection = function () {
        var cultures = JSON.parse(JSON.stringify(Gamedata.cultures));
        var models = { pj: pj, controller: this, cultures: cultures };
        var viewElement = createView(cultureTemplate, models);
        Text.localizeAll(element);
    }


    return PcGenerator;
});