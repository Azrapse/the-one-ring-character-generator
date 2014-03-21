define(["extends", "jquery", "text", "jquery.linq"], function (_extends, $, Text) {
    var Tutorial = (function () {
        function Tutorial() {
            this.slides = {};
            this.name = "";
        }

        return Tutorial;
    })();
    
    var Slide = (function () {
        function Slide() {
            this.name = "";
            this.elements = [];
        }

        return Slide;
    })();

    var SlideElement = (function () {
        function SlideElement() {
            this.classes = "";
        }

        SlideElement.fromElement(element){
            var type = element.attr("class");
            var classes = element.attr("classes");
            var se = null;
            switch(type){
                case "topic":
                    var key = element.attr("key");
                    se =  new TopicSlideElement(key);
                    break;
            }
            se.classes = classes;
        }

        SlideElement.prototype.toString = function () {
            return "(Slide Element)";
        };

        return SlideElement;
    })();

    var TopicSlideElement = (function (_super) {
        _extends(TopicSlideElement, SlideElement);

        function TopicSlideElement(key, classes) {
            _super.call(this);

            this.key = key;
            this.classes = classes;
        }

        TopicSlideElement.prototype.toString = function () {
            return Text.getText(this.key);
        };

    })(SlideElement);

    var ButtonSlideElement = (function (_super) {
        _extends(ButtonSlideElement, SlideElement);

        function ButtonSlideElement(label, verb, target, classes, triggerOverseer, triggerSelector, triggerEvent) {
            _super.call(this);

            this.label = label;
            this.verb = verb;
            this.target = target;
            this.classes = classes;
            this.triggerOverseer = triggerOverseer;
            this.triggerSelector = triggerSelector;
            this.triggerEvent = triggerEvent;
        }

        TopicSlideElement.prototype.toString = function () {
            return Text.getText(this.label);
        };

    })(SlideElement);

    var HighlightSlideElement = (function (_super) {
        _extends(HighlightSlideElement, SlideElement);

        function HighlightSlideElement(target) {
            _super.call(this);
                        
            this.target = target;            
        }
        
    })(SlideElement);
    
    return { Tutorial: Tutorial, Slide: Slide };
});