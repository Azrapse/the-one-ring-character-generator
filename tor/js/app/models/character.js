define([], function () {
    var Character = (function () {
        function Character() {
            this.name = "Unnamed";
            this.version = "3";
        }

        Character.prototype.toString = function () {
            return "Character " + this.name;
        };

        Character.prototype.toJson = function () {
            return JSON.stringify(this);
        };

        return Character;
    })();

    return Character;
});