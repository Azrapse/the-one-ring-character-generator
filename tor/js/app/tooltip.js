define(["extends", "jquery", "text", "txt!views/tooltip/helpdiv.html"], function (_extends, $, Text, helpdivTemplate) {

    var Tooltip = (function () {

        function Tooltip(container, selector) {
            this.container = container || $("body");
            this.selector = selector || ".localizable";
            this.id = Math.random() * 1000000 | 0;
            this.holder = $('<div id="tooltipDiv">')
                .addClass("popupButtons")
                .hide();
            var html = $.parseHTML(helpdivTemplate.substr(helpdivTemplate.indexOf("<")));
            this.helpTemplate = $(html);
            this.container.append(this.holder);
            this.container.append(this.helpTemplate);
            var self = this;
            $(this.container).on("mouseenter mouseout", this.selector, function (event) {
                handlePopupButtons.call(self, $(this), event);
            });

            // Help Buttons
            this.container.on("click", ".helpButton", function (event) {
                helpButtonClick.call(self, $(this));
            });
        }

        Tooltip.prototype.dispose = function () {
            $(this.container).off("mouseenter mouseout", this.selector);
        };

        var tooltipTimeout = null;
        function tooltipShow() {
            var tooltip = $("#tooltipDiv");
            $(document.body).on("mouseenter mouseout", ".localizable", function (event) {
                if ($("#descriptionsToggleButton").hasClass("popupNothing")) {
                    tooltip.hide();
                    return;
                }
                if ($("#descriptionsToggleButton").hasClass("popupButtons")) {
                    handlePopupButtons($(this), event);
                    return;
                } if ($("#descriptionsToggleButton").hasClass("popupTooltips")) {
                    handlePopupTooltips($(this), event);
                    return;
                }

            });
            $("#tooltipDiv").on("mouseenter mouseout", ".helpButton", function (event) {
                // Clear tooltip timeout
                if (tooltipTimeout != null) {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = null;
                }
                if (event.type == "mouseenter") {

                }
                if (event.type == "mouseout") {
                    tooltipTimeout = setTimeout(hideTooltip, 1000);
                }
            });
        }

        function handlePopupButtons(sender, event) {
            var tooltip = this.holder;
            // Clear tooltip timeout
            if (tooltipTimeout != null) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }

            var localizeKey = sender.attr('data-textKey');
            if (event.type == "mouseenter") {
                // We show the tooltip		
                var helpButton = $("<div class='floating helpButton' data-helptopic='" + localizeKey + "'>?</div>");
                tooltip.empty();
                tooltip.append(helpButton);

                var position = sender.offset();
                tooltip.css("top", position.top).css("left", position.left + sender.width());
                tooltip.show();
            }
            if (event.type == "mouseout") {
                // Start tooltip timeout
                var self = this;
                tooltipTimeout = setTimeout(function () { hideTooltip.call(self) }, 1000);
            }
        }

        function handlePopupTooltips(sender, event) {
            var tooltip = this.holder;
            if (event.type == "mouseenter") {
                var localizeKey = sender.attr('localizeKey');
                // We get the localization for the element

                var locale = localeDict[localizeKey];
                if (!locale) {
                    return;
                }
                // We get the full name and description
                var fullName = locale.fullname;
                var description = locale.contents;
                // We show the tooltip			
                tooltip.html("<b>" + fullName + "</b><br />" + description);
                Text.localizeInnerSelector(tooltip, ".uiText");
                // if it's too high, we make it wider instead.
                var windowWidth = $(window).width();
                var windowHeight = $(window).height();
                var margin = 20;
                var position = tooltip.offset();
                // Overflowing to the right? Put it in the other side
                if (event.pageX + tooltip.width() + margin > windowWidth) {
                    position.left = event.pageX - margin * 2 - tooltip.width();
                } else {
                    position.left = event.pageX + margin;
                }
                // We place it so that the mouse is halfway down to it.			
                position.top = event.pageY - (tooltip.height() / 2);

                // Overflowing to the top? Put it at the top			
                if (position.top < 0) {
                    position.top = 0;
                }
                // Overflowing to the left? Put it at the left			
                if (position.left < 0) {
                    position.left = 0;
                }

                // Overflowing to the bottom? Put it at the bottom
                if (position.top + $(tooltip).height() > windowHeight) {
                    position.top = windowHeight - $(tooltip).height() - margin * 2;
                }
                tooltip.css("top", position.top).css("left", position.left);

                tooltip.show();
            } else {
                tooltip.hide();
            }

        }

        function hideTooltip() {
            this.holder.hide();
        }

        function helpButtonClick(sender) {
            var helpTopic = sender.attr("data-helptopic");
            var helpText = Text.getDescription(helpTopic);
            var helpTitle = Text.getText(helpTopic);
            if (helpTitle) {
                helpText = "<legend>" + helpTitle + "</legend><br/><div class='helpText'>" + helpText + "</div>";
            }
            var helpTextContainer = this.helpTemplate.find("fieldset .helpTextContainer").html(helpText);
            Text.localizeInnerSelector(helpTextContainer, ".uiText");
            this.helpTemplate.show();
            this.holder.hide();
        }


        return Tooltip;
    } ());


    return Tooltip;
});