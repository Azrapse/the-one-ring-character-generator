define(["extends", "character", "gamedata", "json"], function (_extends, Character, Gamedata) {

    var PcItem = (function () {
        var _owner;
        var _id;
        function PcItem(ownerPc, id, value) {
            _owner = ownerPc;
            _id = id;
            for (var p in value) if (value.hasOwnProperty(p)) this[p] = value[p];
        }
        PcItem.prototype.getComment = function () {
            return ownerPc.getComment(_id);
        };
        return PcItem;
    })();

    var Reward = (function () {

        function Reward(ownerPc, reward) {
            this.name = reward.name;
            this.target = reward.target;
            this._ownerPc = ownerPc;
        }

        Reward.prototype.getComment = function () {
            return this._ownerPc.getComment(this.name);
        };

        return Reward;
    })();

    var Pj = (function (_super) {
        _extends(Pj, Character);

        function Pj(jsonOrName) {
            _super.call(this);
            try {
                fromJson.call(this, jsonOrName);
            }
            catch (ex) {
                if (jsonOrName && jsonOrName.length && jsonOrName.length <= 100) {
                    var template = Gamedata.getPcTemplate();
                    for (var prop in template) {
                        this[prop] = template[prop];
                    }
                    this.name = jsonOrName;
                }
            }
            finalTouches.call(this);
        }

        Pj.prototype.toString = function () {
            return "PJ " + this.name;
        };

        Pj.prototype.toJson = function () {
            return JSON.stringify(this);
        };

        // Load functions
        var fromJson = function (json) {
            var data = typeof (json) === "object" ? json : JSON.parse(json);
            switch (data.version | 0) {
                case 2:
                    fromJsonV2.call(this, data);
                    break;

                case 3:
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
                    switch (prop) {
                        case "weaponGear":
                        case "gear":
                            for (var i = 0; i < data[prop].length; i++) {
                                var ws = data[prop][i];
                                this.belongings[prop] = this.belongings[prop] || {};
                                this.belongings[prop][ws.id] = ws;
                            }
                            break;
                        case "rewards":
                            this.belongings.rewards = data.rewards
                                .map(function (r) {
                                    return { name: r, target: null };
                                });
                            break;
                        default:
                            this.belongings[prop] = data[prop];
                            break;
                    }
                    //                    if (prop === "weaponGear" || prop == "gear") {
                    //                        for (var i = 0; i < data[prop].length; i++) {
                    //                            var ws = data[prop][i];
                    //                            this.belongings[prop] = this.belongings[prop] || {};
                    //                            this.belongings[prop][ws.id] = ws;
                    //                        }
                    //                    }
                    //                    else {
                    //                        this.belongings[prop] = data[prop];
                    //                    }
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

        var finalTouches = function () {
            while (this.belongings.inventory.length < 10) {
                this.belongings.inventory.push("");
            }
            while (this.characterTexts.taleOfYears.length < 13) {
                this.characterTexts.taleOfYears.push({ year: "", events: "" });
            }
            var self = this;
            this.belongings.rewards = this.belongings.rewards
                .map(function (r) {
                    return new Reward(self, { name: r, target: null });
                });
        };

        // Accessors

        var itemSearch = function (container) {
            for (var gear in this.belongings.gear) {
                var item = this.belongings.gear[gear];
                if ((gear in container) && item.carried) {
                    return item;
                }
            }
        };
        Pj.prototype.getActiveBodyArmor = function () {
            return itemSearch.call(this, Gamedata.armour.body);
        };
        Pj.prototype.getActiveShield = function () {
            return itemSearch.call(this, Gamedata.armour.shield);
        };
        Pj.prototype.getActiveHeadgear = function () {
            return itemSearch.call(this, Gamedata.armour.head);
        };

        // Computed Properties
        Pj.prototype.updateEncFatigue = function () {
            var total = 0;
            var pools = [this.belongings.weaponGear, this.belongings.gear];
            for (var i = 0; i < pools.length; i++) {
                var pool = pools[i];
                for (var gear in pool) {
                    var gearObj = pool[gear];
                    if (gearObj.carried) {
                        total += +(gearObj.enc || gearObj.stats.enc);
                    }
                }
            }
            this.status.fatigue = total;
        };

        Pj.prototype.updateTotalFatigue = function () {
            this.status.fatigueTotal = (+this.status.fatigue || 0) + (+this.status.fatigueTravel || 0);
        };

        Pj.prototype.updateShadow = function () {
            this.status.totalShadow = (+this.status.shadow || 0) + (+this.status.permanentShadow || 0);
        };

        Pj.prototype.getComment = function (key) {
            if (this.characterTexts.comments) {
                for (var i = 0; i < this.characterTexts.comments.length; i++) {
                    if (this.characterTexts.comments[i]["for"] === key) {
                        return this.characterTexts.comments[i].text;
                    }
                }
            }
        };
        Pj.prototype.setComment = function (key, text) {
            // If no comment section, add it.
            if (!this.characterTexts.comments) {
                this.characterTexts.comments = [];
            }
            // Find the comment            
            var comment = this.characterTexts.comments
                .filter(function (c) { return c["for"] === key; })
                [0];
            // If no previous comment
            if (!comment) {
                // If text provided, add it
                if (text) {
                    this.characterTexts.comments.push({ "for": key, text: text });
                }
            } else {
                // If there was previous comment
                // If text provided, change it.
                if (text) {
                    comment.text = text;
                } else {
                    // If no text provided, delete it
                    var index = this.characterTexts.comments.indexOf(comment);
                    this.characterTexts.comments.splice(index, 1);
                }
            }
        };

        Pj.prototype.getNextDegeneration = function () {
            var features = this.traits.features;
            var degenerations = Gamedata.getDegenerationsForCalling(this.traits.calling);
            // Get the first degeneration not already in the character            
            return degenerations
                .filter(function (d) { return features.indexOf(d) == -1; })
                .splice(0, 1)[0];
        };

        return Pj;
    })(Character);

    return Pj;
});
