define(["extends", "character", "gamedata", "json"], function (_extends, Character, Gamedata) {

    var PcAttribute = (function () {
        function PcAttribute(ownerPc) {
            Object.defineProperty(this, "_id", { writable: true });
            Object.defineProperty(this, "_ownerPc", { value: ownerPc });
        }

        PcAttribute.prototype.toString = function () {
            return this._id;
        };

        return PcAttribute;
    })();

    var Commentable = (function (_super) {
        _extends(Commentable, _super);
        function Commentable(ownerPc) {
            _super.call(this, ownerPc);

            Object.defineProperty(this, "_comment", {
                configurable: true,
                enumerable: false,
                get: function () {
                    return this._ownerPc.getComment(this._id);
                },
                set: function (value) {
                    this._ownerPc.setComment(this._id, value);
                }
            });
        }
        return Commentable;
    })(PcAttribute);

    var Reward = (function (_super) {
        _extends(Reward, _super);

        function Reward(ownerPc, reward) {
            _super.call(this, ownerPc);
            Object.defineProperty(this, "name", {
                configurable: true,
                get: function () { return this._id; },
                set: function (value) { this._id = value; },
                enumerable: true
            });
            if (typeof reward === "string") {
                this.name = reward;
            } else {
                this.name = reward.name;
                this.target = reward.target;
            }
        }

        return Reward;
    })(Commentable);

    var Trait = (function (_super) {
        _extends(Trait, _super);

        function Trait(ownerPc, trait) {
            _super.call(this, ownerPc);
            Object.defineProperty(this, "name", {
                configurable: true,
                get: function () { return this._id; },
                set: function (value) { this._id = value; },
                enumerable: true
            });
            if (typeof trait === "string") {
                this.name = trait;
            } else {
                this.name = trait.name;
                this._comment = trait.comment;
            }
        };
        return Trait;
    })(Commentable);

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

            // Initialize collection accessors
            this.belongings = this.belongings || {};
            this.traits = this.traits || {};

            Object.defineProperty(this, "rewards", {
                configurable: true,
                enumerable: false,
                get: function () {
                    this.belongings.rewards = this.belongings.rewards || [];
                    return this.belongings.rewards;
                },
                set: function (value) {
                    this.belongings.rewards = value;
                }
            });
            Object.defineProperty(this, "virtues", {
                configurable: true,
                enumerable: false,
                get: function () {
                    this.traits.virtues = this.traits.virtues || [];
                    return this.traits.virtues;
                },
                set: function (value) {
                    this.traits.virtues = value;
                }
            });
            Object.defineProperty(this, "specialties", {
                configurable: true,
                enumerable: false,
                get: function () {
                    this.traits.specialties = this.traits.specialties || [];
                    return this.traits.specialties;
                },
                set: function (value) {
                    this.traits.specialties = value;
                }
            });
            Object.defineProperty(this, "features", {
                configurable: true,
                enumerable: false,
                get: function () {
                    this.traits.features = this.traits.features || [];
                    return this.traits.features;
                },
                set: function (value) {
                    this.traits.features = value;
                }
            });

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
                            break; //                        
                        default:
                            this.belongings[prop] = data[prop];
                            break;
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
                    return new Reward(self, r);
                });
            this.traits.virtues = this.traits.virtues
                .map(function (v) {
                    return new Trait(self, v);
                });
            this.traits.specialties = this.traits.specialties
                .map(function (s) {
                    return new Trait(self, s);
                });
            this.traits.features = this.traits.features
                .map(function (f) {
                    return new Trait(self, f);
                });
            this.traits.culturalBlessing = new Trait(self, this.traits.culturalBlessing);
        };

        // Attributes       
        var collectionPropertyByType = {
            "reward": "rewards",
            "virtue": "virtues",
            "specialty": "specialties",
            "feature": "features"
        };
        Pj.prototype.addAttribute = function (type, attribute) {
            switch (type) {
                case "reward":
                    this.rewards.push(new Reward(this, attribute));
                    break;
                case "virtue":
                case "specialty":
                case "feature":
                    var collection = collectionPropertyByType[type];
                    this[collection].push(new Trait(this, attribute));
                    break;
            }
        };

        Pj.prototype.removeAttribute = function (type, attribute) {
            var collection = collectionPropertyByType[type];
            this[collection] = this[collection]
                .filter(function (a) {
                    var first = a._id || a;
                    var second = attribute._id || attribute;
                    return first !== second;
                });
        };

        Pj.prototype.add = function (adding) {
            for (var type in adding) {
                this.addAttribute(type, adding[type]);
            }
        };

        Pj.prototype.remove = function (removing) {
            for (var type in removing) {
                this.removeAttribute(type, removing[type]);
            }
        };

        Pj.prototype.setAttribute = function (type, attribute) {
            switch (type) {
                case "blessing":
                    this.traits.culturalBlessing = new Trait(this, attribute);
                    break;
                case "culture":
                    this.traits.culture = attribute;
                    break;
                case "endurance":
                    this.status.endurance = attribute;
                    break;
                case "hope":
                    this.status.hope = attribute;
                    break;
                case "standard":
                    this.stats.standard = attribute;
                    break;
            }
        };

        Pj.prototype.setFavoured = function (type, skill) {
            switch (type) {
                case "common":
                    this.skills.common.favoured = this.skills.common.favoured || {};
                    this.skills.common.favoured[skill] = true;
                    break;
                case "weapon":
                    break;
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

        // Comments
        Pj.prototype.getComment = function (key) {
            return this.characterTexts.comments && this.characterTexts.comments.filter && this.characterTexts.comments
                .filter(function (c) {
                    return c["for"] === key;
                })
                .map(function (c) {
                    return c.text;
                })
                .reduce(function (a, b) {
                    return b;
                }, null);
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
            this.publishComment(key, text);
        };
        Pj.prototype.getCommentObject = function (key) {
            return this.characterTexts.comments && this.characterTexts.comments
                .filter(function (c) {
                    return c["for"] === key;
                })
                .reduce(function (a, b) {
                    return b;
                }, null);
        }

        // Comment helpers
        var commentSubscriptions = {};
        Pj.prototype.subscribeComment = function (key, callback) {
            commentSubscriptions[key] = commentSubscriptions[key] || [];
            commentSubscriptions[key].push(callback);
        }
        Pj.prototype.unsubscribeComment = function (key, callback) {
            if (key in commentSubscriptions) {
                var pos = commentSubscriptions[key].indexOf(callback);
                if (pos > -1) {
                    commentSubscriptions[key] = commentSubscriptions[key].splice(pos, 1);
                }
            }
        }
        Pj.prototype.publishComment = function (key, comment) {
            if (key in commentSubscriptions) {
                for (var i = 0; i < commentSubscriptions[key].length; i++) {
                    commentSubscriptions[key][i](comment);
                }
            }
        }
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

    Pj.PcAttribute = PcAttribute;
    Pj.Commentable = Commentable;
    Pj.Reward = Reward;
    Pj.Trait = Trait;

    return Pj;
});
