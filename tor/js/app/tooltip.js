define(["extends", "jquery", "text", "txt!views/tooltip/helpdiv.html",
    "jquery.linq", "jquery.ui"],
    function (_extends, $, Text, helpdivTemplate) {

    var Tooltip = (function () {

        var tooltipTimeout = null;

        function Tooltip(container, selector, showMode) {
            this.container = container || $("body");
            this.selector = selector || ".localizable";
            this.id = Math.random() * 1000000 | 0;

            this.show = showMode || this.showMode.buttons;

            this.tooltipDiv = $('<div id="tooltipDiv">')
                .addClass("tooltipDiv")
                .hide();
            var html = $.Enumerable.From($.parseHTML(helpdivTemplate))
                .Where(function (x) { return x instanceof HTMLElement;})
                .ToArray();
            this.helpDialog = $(html);
            this.container.append(this.tooltipDiv);
            this.container.append(this.helpDialog);
            this.helpDialog.resizable();
            var self = this;
            
            subscribeEvents.call(this);            
        }

        Tooltip.prototype.showMode = {
            hidden: "hidden",
            buttons: "popupButtons",
            tooltips: "popupTooltips"
        };

        Tooltip.prototype.dispose = function () {
            $(this.container).off("mouseenter mouseout", this.selector);            
        };

        function subscribeEvents(){
            var self = this;
            // When entering selector, show
            $(this.container).on("mouseenter mouseout", this.selector, function (event) {
                tooltipShow.call(self, $(this), event);
            });

            // When entering button, cancel timeout
            this.tooltipDiv.on("mouseenter mouseout", ".helpButton", function (event) {
                // Clear tooltip timeout
                if (tooltipTimeout != null) {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = null;
                }
                if (event.type == "mouseenter") {

                }
                if (event.type == "mouseout") {
                    tooltipTimeout = setTimeout(function () { hideTooltip.call(self) }, 1000);
                }
            });
            // Help Buttons clicked
            this.container.on("click", ".helpButton", function (event) {
                helpButtonClick.call(self, $(this));
            });

            // Close help dialog
            this.helpDialog.on("click", ".closeButton", function (event) {
                self.helpDialog.hide();
            });

            $(window).scroll(function () {
                var top = $(window).scrollTop();                
                self.helpDialog.css({ top: top });
            });

        }
        
        function tooltipShow(sender, event) {
            var tooltip = this.tooltipDiv;
            switch (this.show) {
                case this.showMode.hidden:
                    tooltip.hide();
                    break;
                case this.showMode.buttons:
                    applyTootltipClass.call(this);
                    handlePopupButtons.call(this, sender, event);
                    break;
                case this.showMode.tooltips:
                    applyTootltipClass.call(this);
                    handlePopupTooltips.call(this, sender, event);
                    break;                                
            }            
        }

        function handlePopupButtons(sender, event) {
            var self = this;
            var tooltip = this.tooltipDiv;
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
                tooltipTimeout = setTimeout(function () { hideTooltip.call(self) }, 1000);
            }
        }

        function handlePopupTooltips(sender, event) {
            var self = this;
            var tooltip = this.tooltipDiv;
            if (event.type == "mouseenter") {
                var localizeKey = sender.attr('data-textKey');
                // We get the full name and description
                var fullName = Text.getText(localizeKey);
                if (!fullName) {
                    return;
                }
                var description = Text.getDescription(localizeKey);
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
            this.tooltipDiv.hide();
        }

        function helpButtonClick(sender) {
            var helpTopic = sender.attr("data-helptopic");
            var helpText = Text.getDescription(helpTopic);
            var helpTitle = Text.getText(helpTopic);            
            this.helpDialog.find(".helpTitle").html(helpTitle);
            this.helpDialog.find(".helpText").html(helpText);
            Text.localizeInnerSelector(this.helpDialog, ".uiText");
            this.helpDialog.show();
            this.tooltipDiv.hide();
        }

        function applyTootltipClass() {
            // Remove all tooltip type classes
            this.tooltipDiv.attr("class", "tooltipDiv");
            // Apply the right one
            this.tooltipDiv.addClass(this.show);
        }

        return Tooltip;
    } ());


    return Tooltip;
});