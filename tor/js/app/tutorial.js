define(["extends", "jquery", "text", "jquery.linq"], function (_extends, $, Text) {
    var Tutorial = (function () {
        function Tutorial(name) {
            this.slides = {};
            this.name = name;
        }

        Tutorial.fromElement = function(tutorialElement){
            var tutorialElement = $(tutorialElement);
            var name = tutorialElement.attr("name");
            var tutorial = new Tutorial(name);
            // Slides
            tutorialElement.find("div.slide").each(function(){
                var slideElement = $(this);
                var slide = Slide.fromElement(slideElement);
                this.slides[slide.name] = slide;
            });
        };

        return Tutorial;
    })();
    
    var Slide = (function () {
        function Slide(name) {
            this.name = name;
            this.elements = [];
        }

        Slide.fromElement = function(slideElement){
                slideElement = $(slideElement);
                var name = slideElement.attr("name");
                var slide = new Slide(name);
                slideElement.find("div.elements > hr").each(function(){
                    var elementElement = $(this);
                    var element = SlideElement.fromElement(elementElement);
                    this.elements.push(element);
                });
        };

        return Slide;
    })();

    var SlideElement = (function () {
        function SlideElement() {
            this.classes = "";
        }

        SlideElement.fromElement = function(element){
            var type = element.attr("class");
            var classes = element.attr("classes");
            var se = null;
            switch(type){
                case "topic":
                    var key = element.attr("key");
                    se = new TopicSlideElement(key, classes);
                    break;
                case "button":
                    var label = element.attr("label");
                    var verb = element.attr("verb");
                    var target = element.attr("target");
                    var triggerOverseer = element.attr("triggerOverseer");
                    var triggerSelector = element.attr("triggerSelector");
                    var triggerEvent = element.attr("triggerEvent");
                    se = new ButtonSlideElement(label, verb, target, classes, triggerOverseer, triggerSelector, triggerEvent);
                    break;

                case "highlight":
                    var target = element.attr("target");
                    se = new HighlightSlideElement(target);
                    break;
            }
            return se;
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