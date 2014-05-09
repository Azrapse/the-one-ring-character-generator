define(["pj", "pjsheet", "gamedata", "text", "rivets", "jquery",
    "txt!views/generator/culture.html",
    "txt!views/generator/wspackage.html",
    "jquery.linq"],
function (Pj, PjSheet, Gamedata, Text, Rivets, $,
    cultureTemplate,
    wsPackageTemplate) {
    var PcGenerator = {};
    var pj = null;
    var sheet = null;
    var container = document.body;
    var view = null;
    var element = null;
    PcGenerator.start = function (initializer) {
        pj = new Pj("???");
        sheet = initializer.sheet;
        container = $(initializer.container || container);
        sheet.pj = pj;
        return cultureSelectionStart();
    };

    function createView(template, models) {
        disposeView();
        var template = $.parseHTML(template)
            .filter(function (e) { return e instanceof HTMLElement; })[0];
        element = $(template);
        container.append(element);
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

    PcGenerator.cancel = function () {
        disposeView();
    }

    var cultureSelectionStart = function () {
        var models = {
            pj: pj,
            controller: PcGenerator,
            cultures: Gamedata.cultures
        };
        var viewElement = createView(cultureTemplate, models);
    }

    PcGenerator.cultureClick = function (event, models) {
        var sender = $(this);
        var culture = sender.attr("data-culture");
        $(".cultureSelectionButton").removeClass("selected");
        sender.addClass("selected");
        pj.culture = culture;
        $("#cultureNextButton").show();
    };

    PcGenerator.cultureSelectionNext = function (event, models) {
        wsPackStart();
    };

    var wsPackStart = function () {
        var models = { pj: pj, controller: this, packs: {} };
        var viewElement = createView(wsPackageTemplate, models);
    };

    return PcGenerator;
});