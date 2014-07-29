define(["jquery", "text", "jquery.linq"], function ($, Text) {
    var Gamedata = {};
    var pcTemplate = {
        stats: {
            wisdom: 0,
            valour: 0,
            startingEndurance: 0,
            startingHope: 0,
            standard: "",
            attributes: {
                base: {
                    body: 0,
                    heart: 0,
                    wits: 0
                },
                favoured: {
                    body: 0,
                    heart: 0,
                    wits: 0
                }
            }
        },
        status: {
            armour: 0,
            damage: 0,
            endurance: 0,
            fatigue: 0,
            fatigueTotal: 0,
            fatigueTravel: 0,
            fellowshipPoints: 0,
            headgear: 0,
            hope: 0,
            miserable: false,
            parry: 0,
            permanentShadow: 0,
            ranged: 0,
            shadow: 0,
            shield: 0,
            totalShadow: 0,
            weary: false,
            woundTreated: false,
            wounded: false
        },
        progress: {
            advancementPoints: 0,
            experience: 0,
            standing: 0,
            total: 0
        },
        characterTexts: {
            backgroundText: "",
            comments: [],
            fellowshipFocusText: "",
            fellowshipNotesText: "",
            guideText: "",
            huntsmanText: "",
            lookoutText: "",
            patronText: "",
            taleOfYears: [],
            sanctuariesText: "",
            scoutText: ""
        },
        belongings: {
            inventory: [],
            coins: {
                gold: 0,
                silver: 0,
                copper: 0
            },
            weaponGear: {},
            gear: {},
            rewards: [],
            treasurePoints: 0
        },
        traits: {
            culture: "",
            culturalBlessing: "",
            features: [],
            calling: "",
            shadowWeakness: "",
            specialties: [],
            virtues: []
        },
        skills: {
            common: { favoured: {}, scores: {} },
            weapon: {}
        }
    };
    Gamedata.HtmlToJson = function (selector) {
        var root = $(selector);

        // Cultures
        this.parseCultures(root, data);
        this.parseCallings(root, data);
        this.parseDegenerations(root, data);
        this.parseSkillGroups(root, data);
        this.parseMasteries(root, data);
        this.parseQualities(root, data);
        this.parseWeapons(root, data);
        this.parseWeaponGroups(root, data);
        this.parseShields(root, data);
        this.parseArmours(root, data);
        this.parseStandardsOfLiving(root, data);

        $.extend(Gamedata, pcTemplate);

        return pcTemplate;
    };

    Gamedata.LoadJson = function (data) {
        $.extend(Gamedata, data);
        return data;
    };

    Gamedata.parseCultures = function (root, data) {
        data.cultures = {};
        root.find(".cultures > .culture").each(function () {
            var cultureDiv = $(this);
            var name = cultureDiv.attr("name");
            var culture = { name: name };
            culture.standardOfLiving = cultureDiv.find(".standardOfLiving").html();
            culture.ageMin = cultureDiv.find(".ageMin").html();
            culture.ageMax = cultureDiv.find(".ageMax").html();
            culture.suggestedCallings = $.Enumerable.From(cultureDiv.find(".suggestedCallings div"))
                .Select(function (div) { return $(div).html(); })
                .ToArray();
            culture.unusualCallings = $.Enumerable.From(cultureDiv.find(".unusualCallings div"))
                .Select(function (div) { return $(div).html(); })
                .ToArray();
            culture.culturalBlessing = cultureDiv.find(".culturalBlessing div").html();
            culture.favouredSkill = cultureDiv.find(".favouredSkill").attr("skill");
            culture.startingSkillScores = {};
            culture.startingFavouredSkills = {};
            cultureDiv.find(".startingSkillScores .skillScore").each(function () {
                var div = $(this);
                var skillName = div.attr("skill");
                var score = div.attr("score");
                var favoured = !!div.attr("favoured");
                culture.startingSkillScores[skillName] = score;
                if (favoured) {
                    culture.startingFavouredSkills[skillName] = true;
                }
            });
            culture.weaponSkillPackages = [];
            cultureDiv.find(".weaponSkillsPackages .weaponSkillsPackage").each(function () {
                var packageDiv = $(this);
                var packageSkills = {};
                var packageFavoured = {};
                packageDiv.find(".weaponSkillScore").each(function () {
                    var skillDiv = $(this);
                    var skill = skillDiv.attr("skill");
                    var score = skillDiv.attr("score");
                    var isCultural = !!skillDiv.attr("cultural");
                    var isFavoured = !!skillDiv.attr("favoured");
                    if (isCultural) {
                        skill = "(" + skill + ")";
                    }
                    packageSkills[skill] = score;
                    if (isFavoured && !isCultural) {
                        packageFavoured[skill] = true;
                    }
                });
                culture.weaponSkillPackages.push({ skills: packageSkills, favoured: packageFavoured });
            });
            culture.specialties = $.Enumerable.From(cultureDiv.find(".specialties div"))
                .Select(function (div) { return $(div).html(); })
                .ToArray();
            culture.backgrounds = [];
            cultureDiv.find(".backgrounds .background").each(function () {
                var backgroundDiv = $(this);
                var name = backgroundDiv.attr("localizekey");
                var background = { name: name };
                background.attributeScores = {};
                backgroundDiv.find(".attributeScores .attributeScore").each(function () {
                    var attributeScoreDiv = $(this);
                    var name = attributeScoreDiv.attr("attribute");
                    var score = attributeScoreDiv.attr("score");
                    background.attributeScores[name] = score;
                });

                background.favouredSkill = backgroundDiv.find(".favouredSkill").attr("skill");
                background.distinctiveFeatures = $.Enumerable.From(backgroundDiv.find(".distinctiveFeatures div"))
                    .Select(function (div) { return $(div).html(); })
                    .ToArray();
                culture.backgrounds.push(background);
            });
            culture.enduranceBonus = cultureDiv.find(".enduranceBonus").attr("value");
            culture.hopeBonus = cultureDiv.find(".hopeBonus").attr("value");

            culture.virtues = $.Enumerable.From(cultureDiv.find(".virtues div"))
                .Select(function (div) { return $(div).attr("name"); })
                .ToArray();
            culture.rewards = {};
            cultureDiv.find(".rewards div").each(function () {
                var rewardDiv = $(this);
                var name = rewardDiv.attr("name");
                var type = rewardDiv.attr("type");
                culture.rewards[name] = type;
            });
            data.cultures[name] = culture;
        });

    };

    Gamedata.parseCallings = function (root, data) {
        data.callings = {};
        root.find(".callings > .calling").each(function () {
            var callingDiv = $(this);
            var name = callingDiv.attr("name");
            var favouredSkillGroups = callingDiv.find(".favouredSkillGroups > div").toEnumerable()
                .Select("x=>x.html()")
                .ToArray();
            var additionalTrait = callingDiv.find(".additionalTrait > div").toEnumerable()
                .Select("x=>x.html()")
                .ToArray();
            var shadowWeakness = callingDiv.find(".shadowWeakness > div").toEnumerable()
                .Select("x=>x.html()")
                .ToArray();
            data.callings[name] = {
                name: name,
                favouredSkillGroups: favouredSkillGroups,
                additionalTrait: additionalTrait,
                shadowWeakness: shadowWeakness
            };
        });
    };

    Gamedata.parseDegenerations = function (root, data) {
        data.degenerations = {};
        root.find(".degenerations > .degeneration").each(function () {
            var degenerationDiv = $(this);
            var name = degenerationDiv.attr("name");
            var group = degenerationDiv.attr("group");
            var rank = degenerationDiv.attr("rank");
            data.degenerations[name] = { name: name, group: group, rank: rank };
        });
        data.degenerationGroups = {};
        for (var dname in data.degenerations) {
            var d = data.degenerations[dname];
            if (!(d.group in data.degenerationGroups)) {
                data.degenerationGroups[d.group] = {};
            }
            data.degenerationGroups[d.group][d.rank] = d.name;
        };
    };

    Gamedata.parseSkillGroups = function (root, data) {
        data.skillGroups = {};
        root.find(".skillGroups > .skillGroup").each(function () {
            var skillGroupDiv = $(this);
            var name = skillGroupDiv.attr("name");
            var skillGroupSkills = skillGroupDiv.find("div").toEnumerable()
                .ToObject("x=>x.attr('attribute')", "x=>x.html()");
            data.skillGroups[name] = skillGroupSkills;
        });
        data.skills = {};
        for (var group in data.skillGroups) {
            for (var attribute in data.skillGroups[group]) {
                var skill = data.skillGroups[group][attribute];
                data.skills[skill] = { name: skill, group: group, attribute: attribute };
            }
        }
    };

    Gamedata.parseMasteries = function (root, data) {
        data.masteries = {};
        root.find(".masteries > .mastery").each(function () {
            var masteryDiv = $(this);
            var name = masteryDiv.attr("name");
            data.masteries[name] = { name: name };
        });
    };

    Gamedata.parseQualities = function (root, data) {
        data.qualities = {};
        root.find(".qualities > .quality").each(function () {
            var qualityDiv = $(this);
            var name = qualityDiv.attr("name");
            var targets = qualityDiv.find(".qualityTarget").toEnumerable()
                .Select("x=>x.attr('name')")
                .ToObject("x=>x", "x=>true");
            data.qualities[name] = { name: name, targets: targets };
        });
    };

    Gamedata.parseWeapons = function (root, data) {
        data.weapons = {};
        root.find(".weapons > .weapon").each(function () {
            var weaponDiv = $(this);
            var name = weaponDiv.attr("name");
            var damage = weaponDiv.attr("damage");
            var edge = weaponDiv.attr("edge");
            var injury = weaponDiv.attr("injury");
            var enc = weaponDiv.attr("enc");
            var group = weaponDiv.attr("group");
            data.weapons[name] = { name: name, damage: damage, edge: edge, injury: injury, enc: enc, group: group };
        });
    };

    Gamedata.parseWeaponGroups = function (root, data) {
        data.weaponGroups = {};
        root.find(".weaponGroups > .weaponGroup").each(function () {
            var weaponGroupDiv = $(this);
            var name = weaponGroupDiv.attr("name");
            var cultural = weaponGroupDiv.attr("cultural");
            var weapons = $.Enumerable.From(data.weapons)
                .Where(function (x) { return x.Value.group == name; })
                .Select("x=>x.Key")
                .ToArray();
            data.weaponGroups[name] = { name: name, cultural: cultural, weapons: weapons };
        });
    };

    Gamedata.parseShields = function (root, data) {
        data.shields = {};
        root.find(".shields > .shield").each(function () {
            var shieldDiv = $(this);
            var name = shieldDiv.attr("name");
            var enc = shieldDiv.attr("enc");
            var parry = shieldDiv.attr("parry");
            data.shields[name] = { name: name, enc: enc, parry: parry };
        });
    };

    Gamedata.parseArmours = function (root, data) {
        data.armours = {};
        root.find(".armours > .armour").each(function () {
            var armourDiv = $(this);
            var name = armourDiv.attr("name");
            var enc = armourDiv.attr("enc");
            var protection = armourDiv.attr("protection");
            var type = armourDiv.attr("type");
            data.armours[name] = { name: name, enc: enc, protection: protection, type: type };
        });
    };

    Gamedata.parseStandardsOfLiving = function (root, data) {
        data.standardsOfLiving = {};
        root.find(".standardsOfLiving > .standardOfLiving").each(function () {
            var standardOfLivingDiv = $(this);
            var name = standardOfLivingDiv.attr("name");
            data.standardsOfLiving[name] = { name: name };
        });
    };

    Gamedata.getGearType = function (id) {
        for (var type in Gamedata.armour) {
            if (id in Gamedata.armour[type]) {
                return type;
            }
        }
    }

    Gamedata.getDegenerationsForCalling = function (calling) {
        var shadowWeakness = Gamedata.callings[calling].shadowWeakness;
        var degenerations = Object.keys(Gamedata.degenerations);
        return $.Enumerable.From(degenerations)
            .Select(function (d) { return Gamedata.degenerations[d]; })
            .Where(function (d) { return d.group == shadowWeakness })
            .OrderBy(function (d) { return d.rank; })
            .Select(function (d) { return d.name; })
            .ToArray();
    };

    Gamedata.getFeatures = function () {
        var features = $.Enumerable.From(Gamedata.cultures)
            .SelectMany(function (kvp) { return kvp.Value.backgrounds; })
            .SelectMany(function (b) { return b.distinctiveFeatures; })
            .Distinct()
            .ToArray();
        features.sort(function (a, b) {
            a = Text.getText(a);
            b = Text.getText(b);
            return a.localeCompare(b, {}, { sensitivity: "base" });
        });
        return features;
    };

    Gamedata.getPcTemplate = function () {
        return JSON.parse(JSON.stringify(pcTemplate));
    };
    return Gamedata;
});