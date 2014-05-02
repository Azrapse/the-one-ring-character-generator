define(["extends", "character", "gamedata", "json"], function (_extends, Character, Gamedata) {

    var Pj = (function (_super) {
        _extends(Pj, Character);

        function Pj(jsonOrName) {
            _super.call(this);
            try {
                fromJson.call(this, jsonOrName);
            }
            catch (ex) {
                if (jsonOrName && jsonOrName.length && jsonOrName.length <= 100) {
                    this.name = jsonOrName;
                }
            }

        }

        Pj.prototype.toString = function () {
            return "PJ " + this.name;
        };

        // Load functions
        var fromJson = function (json) {
            var data = typeof (json) === "object" ? json : JSON.parse(json);
            switch ("" + data.version) {
                case "2":
                    fromJsonV2.call(this, data);
                    break;

                case "3":
                    fromJsonV3.call(this, data);
                    break;

                default:
                    throw "Unsupported character version";
            }
        }

        var fromJsonV2 = function (data) {
            for (var prop in data) {
                if (!(data.hasOwnProperty(prop))) {
                    continue;
                }

                if (prop === "version") {
                    continue;
                }

                if (prop in Gamedata.attributes) {
                    this.stats = this.stats || {};
                    this.stats.attributes = this.stats.attributes || {};
                    this.stats.attributes.base = this.stats.attributes.base || {};
                    this.stats.attributes.base[prop] = data[prop];
                    continue;
                }

                if (prop in { favouredbody: true, favouredheart: true, favouredwits: true }) {
                    this.stats = this.stats || {};
                    this.stats.attributes = this.stats.attributes || {};
                    this.stats.attributes.favoured = this.stats.attributes.favoured || {};

                    var attribute = prop.replace("favoured", "");
                    this.stats.attributes.favoured[attribute] = data[prop];
                    continue;
                }

                if (prop in Gamedata.skills) {
                    this.skills = this.skills || {};
                    this.skills.common = this.skills.common || {};
                    this.skills.common.scores = this.skills.common.scores || {};
                    this.skills.common.scores[prop] = data[prop];
                    continue;
                }

                if (prop === "favoured") {
                    this.skills = this.skills || {};
                    this.skills.common = this.skills.common || {};
                    this.skills.common.favoured = this.skills.common.favoured || {};
                    for (var i = 0; i < data[prop].length; i++) {
                        this.skills.common.favoured[data[prop][i]] = true;
                    }
                    continue;
                }

                if (prop in Gamedata.skillGroups) {
                    this.skillGroupScores = this.skillGroupScores || {};
                    this.skillGroupScores[prop] = data[prop];
                    continue;
                }

                if (prop in Gamedata.characterTexts) {
                    this.characterTexts = this.characterTexts || {};
                    this.characterTexts[prop] = data[prop];
                    continue;
                }

                if (prop in Gamedata.stats) {
                    this.stats = this.stats || {};
                    this.stats[prop] = data[prop];
                    continue;
                }

                if (prop in Gamedata.status) {
                    this.status = this.status || {};
                    this.status[prop] = data[prop];
                    continue;
                }

                if (prop in Gamedata.progress) {
                    this.progress = this.progress || {};
                    this.progress[prop] = data[prop];
                    continue;
                }

                if (prop in Gamedata.traits) {
                    this.traits = this.traits || {};
                    this.traits[prop] = data[prop];
                    continue;
                }


                if (prop in Gamedata.belongings) {
                    this.belongings = this.belongings || {};
                    if (prop === "weaponGear" || prop == "gear") {
                        for (var i = 0; i < data[prop].length; i++) {
                            var ws = data[prop][i];
                            this.belongings[prop] = this.belongings[prop] || {};
                            this.belongings[prop][ws.id] = ws;
                        }
                    }
                    else {
                        this.belongings[prop] = data[prop];
                    }
                    continue;
                }


                if (prop === "weaponSkills") {
                    this.skills = this.skills || {};
                    this.skills.weapon = this.skills.weapon || {};
                    for (var i = 0; i < data[prop].length; i++) {
                        var ws = data[prop][i];
                        this.skills.weapon[ws.id] = ws;
                    }
                    continue;
                }

                if (prop === "comments") {
                    this[prop] = {};
                    for (var i = 0; i < data[prop].length; i++) {
                        var comm = data[prop][i];
                        this[prop][comm["for"]] = comm.text;
                    }
                    continue;
                }

                if (prop == "carried") {
                    continue;
                }

                this[prop] = data[prop];
            }
        };

        var fromJsonV3 = function (data) {
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    this[prop] = data[prop];
                }
            }
        };
                
        // Accessors

        var itemSearch = function (container) {
            for (var gear in this.belongings.gear) {
                var item = this.belongings.gear[gear];
                if ((gear in container) && item.carried) {
                    return item;
                }
            }
        }
        Pj.prototype.getActiveBodyArmor = function(){
            return itemSearch.call(this, Gamedata.armour.body);
        }
        Pj.prototype.getActiveShield = function () {
            return itemSearch.call(this, Gamedata.armour.shield);
        }
        Pj.prototype.getActiveHeadgear = function () {
            return itemSearch.call(this, Gamedata.armour.head);
        }
                

        return Pj;
    })(Character);
    
    return Pj;
});
