define(["jquery", "jquery.linq"], function ($) {
    var Text = {};

    var LocalizedText = (function () {
        function LocalizedText(key, name, description) {
            this.fullname = name;
            this.key = key;
            this.contents = description;
        }

        LocalizedText.prototype.toString = function () {
            return (this.fullname || "") + (this.contents || "");
        };

        LocalizedText.prototype.getText = function () {
            return this.fullname;
        };

        LocalizedText.prototype.getDescription = function () {
            return this.contents;
        };
        return LocalizedText;
    })();
    Text.LocalizedText = LocalizedText;

    var languageFiles = {
        "es": { text: "localization-es.html", logo: "css/TorLogoEs.jpg" },
        "en": { text: "localization-en.html", logo: "css/TorLogoEn.jpg" }
    };
    Text.languageFiles = languageFiles;

    Text.initialize = function (callback) {
        var language = window.navigator.userLanguage || window.navigator.language;

        // Select preferred language
        for (var lang in languageFiles) {
            var index = language.indexOf(lang);
            if (index != -1) {
                languageFiles[lang].index = index;
            }
        }

        var preferred = $.Enumerable.From(languageFiles)
            .Where(function (kvp) { return "index" in languageFiles[kvp.Key]; })
            .OrderByDescending(function (kvp) { return kvp.Value.index; })
            .Select(function (kvp) { return kvp.Key; })
            .First() || "en";

        Text.locale = preferred;

        localeFile = languageFiles[preferred].text;
        logoFile = languageFiles[preferred].logo;
        Text.textFile = localeFile;
        Text.logoFile = logoFile;
        Text.textDict = {};
        Text.load(callback);
    }

    Text.load = function (callback) {
        $.get(Text.textFile, {}, function (response) {
            var localeDiv = $.parseHTML(response);
            localeDiv = $(localeDiv);
            localeDiv.find("div").each(function () {
                var name = $(this).attr("name");
                var fullname = $(this).attr("fullname");
                var contents = $(this).html();
                Text.textDict[name] = new LocalizedText(name, fullname, contents);
            });
            callback();
        });

    };

    Text.getText = function (key) {
        if (key in Text.textDict) {
            return Text.textDict(key).getText();
        }
        else {
            return "Missing:" + key;
        }
    };

    Text.getDescription = function (key) {
        if (key in Text.textDict) {
            return Text.textDict(key).getDescription();
        }
        else {
            return "Missing:" + key;
        }
    };


    return Text;
});