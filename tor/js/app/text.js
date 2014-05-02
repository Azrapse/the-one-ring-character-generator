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
            return this.fullname || this.contents;
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
    var textDict = {};

    Text.languageFiles = languageFiles;
    
    
    Text.initialize = function () {
        var language = window.navigator.userLanguage || window.navigator.language;

        // Select preferred language
        for (var lang in languageFiles) {
            var index = language.indexOf(lang);
            if (index != -1) {
                languageFiles[lang].index = index;
            }
        }
        try {
            var preferred = $.Enumerable.From(languageFiles)
                .Where(function (kvp) { return "index" in languageFiles[kvp.Key]; })
                .OrderByDescending(function (kvp) { return kvp.Value.index; })
                .Select(function (kvp) { return kvp.Key; })
                .First() || "en";
        }
        catch (ex) {
            preferred = "en";
        }
        Text.locale = preferred;

        localeFile = languageFiles[preferred].text;
        logoFile = languageFiles[preferred].logo;
        Text.textFile = localeFile;
        Text.logoFile = logoFile;
        Text.textDict = textDict;
        return Text.load();
    }

    Text.load = function () {
        var promise = $.get(Text.textFile, {});
        promise.done(function (response) {
            var localeDiv = $.parseHTML(response);
            localeDiv = $(localeDiv);
            localeDiv.find("div").each(function () {
                var name = $(this).attr("name");
                var fullname = $(this).attr("fullname");
                var contents = $(this).html();
                Text.textDict[name] = new LocalizedText(name, fullname, contents);
            });
            if ("" in Text.textDict) {
                delete Text.textDict[""];
            }
        });
        return promise;
    };

    Text.getText = function (key) {
        if (key in Text.textDict) {
            return Text.textDict[key].getText();
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

    Text.localizeAll = function () {
        $(".localizable, .uiText").each(function () {
            Text.localizeOne($(this));
        });
    }

    Text.localizeOne = function(element) {
        var textKey = $(element).attr('data-textKey');
        
        if (!textKey) {
            return;
        }

        var locale = textDict[textKey];
        if (!locale) {
            return;
        }
        // We get the full name 
        var fullName = locale.getText();
        // If there is a commentText, we get it;
        var commentText = $(element).attr("commentText");
        if (!commentText) {
            commentText = "";
        } else {
            commentText = " <span class='commentText'>(" + commentText + ")</span>";
        }

        $(element).html(fullName + commentText);
    }

    /// Returns a localized text, replacing appearances of {0}, {1}, ... with the second, third, ... arguments.
    function write() {
        var textKey = write.arguments[0];
        if (!textKey) {
            return textKey;
        }
        var localizedText = Text.getText(textKey);
        // We substitute rest of parameters into the text            
        for (var i = 1; i < arguments.length; i++) {
            localizedText = localizedText.replace("{" + (i - 1) + "}", args[i].toString());
        }

        return localizedText;
    }

    Text.write = write;

    return Text;
});