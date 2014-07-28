define(["pj", "pjsheet", "gamedata", "text", "rivets", "jquery",
    "txt!views/generator/culture.html",
    "txt!views/generator/wspackage.html",
    "txt!views/generator/specialties.html",
    "txt!views/generator/background.html",
    "txt!views/generator/calling.html",
    "txt!views/generator/additionaltrait.html",
    "txt!views/generator/favouredskillgroups.html",
    "txt!views/generator/favouredattribute.html",
    "txt!views/generator/valorwisdom.html",
    "txt!views/generator/rewards.html",
    "txt!views/generator/virtues.html",
    "txt!views/generator/previousxp.html",
    "txt!views/generator/finish.html",
    "jquery.linq", "jquery.ui"],
function (Pj, PjSheet, Gamedata, Text, Rivets, $) {
    var Reward = Pj.Reward;

    var PcGenerator = {};
    var pj = null;
    var sheet = null;
    var container = document.body;
    var view = null;
    var element = null;

    var creationSteps = [
        { start: cultureSelectionStart, template: "views/generator/culture.html" },
        { start: wsPackStart, template: "views/generator/wspackage.html" },
        { start: specialtiesStart, finish: specialtiesFinish, template: "views/generator/specialties.html" },
        { start: backgroundStart, finish: backgroundFinish, template: "views/generator/background.html" },
        { start: callingStart, finish: callingFinish, template: "views/generator/calling.html" },
        { start: additionalTraitStart, finish: additionalTraitFinish, template: "views/generator/additionaltrait.html" },
        { start: favouredSkillsStart, finish: favouredSkillsFinish, template: "views/generator/favouredskillgroups.html" },
        { start: favouredAttributeStart, template: "views/generator/favouredattribute.html" },
        { start: valourWisdomStart, finish: valourWisdomFinish, template: "views/generator/valorwisdom.html" },
        { start: rewardStart, template: "views/generator/rewards.html" },
        { start: virtueStart, template: "views/generator/virtues.html" },
        { start: xpStart, finish: xpFinish, template: "views/generator/previousxp.html" },
        { start: endStart, template: "views/generator/finish.html" }
    ];

    function getTemplate(stepIndex) {
        var path = creationSteps[stepIndex].template;
        var result = require("txt!" + path);
        return result;
    }

    function startStep(stepIndex) {
        var template = getTemplate(stepIndex);
        var models = creationSteps[stepIndex].start();
        models._stepIndex = stepIndex;
        return createView(template, models);
    }

    function finishStep(event, models) {
        var stepIndex = models._stepIndex;
        if (creationSteps[stepIndex].finish) {
            creationSteps[stepIndex].finish(event, models);
        }
    }

    PcGenerator.start = function (initializer) {
        pj = new Pj("???");
        sheet = initializer.sheet;
        container = $(initializer.container || container);
        sheet.setPc(pj);
        startStep(0);
    };

    PcGenerator.goNext = function (event, models) {
        var stepIndex = models._stepIndex;
        finishStep(event, models);
        if (stepIndex < creationSteps.length - 1) {
            startStep(stepIndex + 1);
        }
    };

    PcGenerator.goNextSkipOne = function (event, models) {
        var stepIndex = models._stepIndex;
        finishStep(event, models);
        if (stepIndex < creationSteps.length - 2) {
            startStep(stepIndex + 2);
        }
    };

    PcGenerator.goPrevious = function (event, models) {
        var stepIndex = models._stepIndex;
        finishStep(event, models);
        if (stepIndex > 0) {
            startStep(stepIndex - 1);
        }
    };

    PcGenerator.goPreviousSkipOne = function (event, models) {
        var stepIndex = models._stepIndex;
        finishStep(event, models);
        if (stepIndex > 1) {
            startStep(stepIndex - 2);
        }
    };


    function createView(template, models) {
        disposeView();
        var template = $.parseHTML(template)
            .filter(function (e) { return e instanceof HTMLElement; })[0];
        element = $(template);
        container.append(element);
        element.draggable();
        view = Rivets.bind(element, models);
        Text.localizeAll(element);
        return { view: view, element: element };
    }

    function disposeView() {
        if (view) {
            view.unbind();
            view = null;
        }
        if (element) {
            element.remove();
            element = null;
        }
    }

    PcGenerator.cancel = function () {
        disposeView();
    }

    // Culture Selection
    function cultureSelectionStart() {
        var models = {
            pj: pj,
            controller: PcGenerator,
            cultures: Object.keys(Gamedata.cultures)
                .map(function (c) {
                    c = Gamedata.cultures[c];
                    return $.extend({ selected: false }, c);
                })
        };
        return models;
    }

    PcGenerator.cultureClick = function (event, models) {
        models.cultures.forEach(function (c) {
            c.selected = (c === models.culture);
        });
        pj.traits.culture = models.culture.name;
        pj.traits.culturalBlessing = new Pj.Trait(pj, models.culture.culturalBlessing);
        pj.status.endurance = pj.stats.startingEndurance = models.culture.enduranceBonus;
        pj.status.hope = pj.stats.startingHope = models.culture.hopeBonus;
        pj.stats.standard = models.culture.standardOfLiving;
        // Favoured skills
        pj.skills.common.favoured = {};
        pj.skills.common.favoured[models.culture.favouredSkill] = true;
        // Skill scores
        Object.keys(Gamedata.skills)
            .forEach(function (s) {
                pj.skills.common.scores[s] = (models.culture.startingSkillScores[s] | 0) || 0;
            });
        $("#cultureNextButton").show();
    };

    // Weapon Pack selection

    function wsPackStart() {
        var packs = Gamedata.cultures[pj.traits.culture].weaponSkillPackages
            .map(function (p, i) {
                return {
                    index: i,
                    skills: Object.keys(p.skills)
                        .map(function (s) {
                            return { name: s, favoured: !!p.favoured[s], score: p.skills[s] | 0 };
                        }),
                    selected: false
                };
            });
        pj.skills.weapon = pj.skills.weapon || {};
        var models = { pj: pj, controller: PcGenerator, packs: packs, nextStatus: { show: false} };
        return models;
    };

    PcGenerator.wsPackClick = function (event, models) {
        var pack = models.pack;
        models.packs.forEach(function (p) {
            p.selected = (p === models.pack);
        });

        // Empty the weapon skills table (without destroying the whole object)
        Object.keys(pj.skills.weapon)
            .forEach(function (ws) {
                delete pj.skills.weapon[ws];
            });

        pack.skills
            .forEach(function (s) {
                pj.skills.weapon[s.name] = { id: s.name, favoured: !!s.favoured, rank: s.score | 0 };
            });
        models.nextStatus.show = true;

    };

    // Specialties
    function specialtiesStart() {
        var specialties = Gamedata.cultures[pj.traits.culture].specialties;
        pj.traits.specialties = pj.traits.specialties || [];
        PcGenerator.specialtiesDep = pj.traits.specialties;
        var models = { pj: pj, controller: PcGenerator, specialties: specialties };
        return models
    }

    PcGenerator.specialtiesDep = [];

    PcGenerator.specialtiesIsReady = function () {
        return $("#wizardSpecialtiesButtonsDiv .specialtyButton.selected").length === 2;
    }

    PcGenerator.specialtyClick = function (event, models) {
        $(this).toggleClass("selected");
        pj.traits.specialties = [];
        $("#wizardSpecialtiesButtonsDiv .specialtyButton.selected").each(function () {
            var specialty = $(this).attr("data-specialty");
            pj.traits.specialties.push(specialty);
        });
        PcGenerator.specialtiesDep = pj.traits.specialties;
    }

    function specialtiesFinish(event, models) {
        pj.traits.specialties = PcGenerator.specialtiesDep
            .slice(0, PcGenerator.specialtiesDep.length)
            .map(function (s) { return new Pj.Trait(pj, s); });
    };

    // Background Selection

    function backgroundStart() {
        var backgrounds = Gamedata.cultures[pj.traits.culture].backgrounds
            .map(function (b, index) {
                return {
                    name: b.name,
                    attributeScores: b.attributeScores,
                    favouredSkill: b.favouredSkill,
                    index: index,
                    selected: false,
                    distinctiveFeatures: b.distinctiveFeatures
                        .map(function (f) {
                            return { name: f, selected: false };
                        })
                };
            });
        PcGenerator.backgrounds = backgrounds;
        var models = { pj: pj, controller: PcGenerator, backgrounds: backgrounds };
        return models;
    }
    PcGenerator.selectedBackground = null;
    PcGenerator.featureClick = function (event, models) {
        var background = models.background;
        var feature = models.feature;
        feature.selected = !feature.selected;
        PcGenerator.selectedBackground = null;
        models.backgrounds.forEach(function (b) {
            if (b !== background) {
                b.selected = false;
                b.distinctiveFeatures.forEach(function (f) {
                    f.selected = false;
                });
            }
            b.selected = b.distinctiveFeatures
            .filter(function (f) { return f.selected; })
            .length === 2;
            if (b.selected) {
                PcGenerator.selectedBackground = b;
            }
        });
    };

    function backgroundFinish() {
        pj.characterTexts.backgroundText = Text.getDescription(PcGenerator.selectedBackground.name)
            .replace(/\s\s/ig, " ");
        pj.traits.features = PcGenerator.selectedBackground.distinctiveFeatures
            .filter(function (f) { return f.selected; })
            .map(function (f) { return f.name; })
            .map(function (f) { return new Pj.Trait(pj, f); });
        pj.skills.common.favoured[PcGenerator.selectedBackground.favouredSkill] = true;
        pj.stats.attributes.base.body = PcGenerator.selectedBackground.attributeScores.body | 0;
        pj.stats.attributes.base.heart = PcGenerator.selectedBackground.attributeScores.heart | 0;
        pj.stats.attributes.base.wits = PcGenerator.selectedBackground.attributeScores.wits | 0;
    };

    // Calling selection
    function callingStart() {
        var callings = Object.keys(Gamedata.callings)
            .map(function (c) {
                var calling = Gamedata.callings[c];
                return {
                    name: calling.name,
                    favouredSkillGroups: calling.favouredSkillGroups,
                    additionalTrait: calling.additionalTrait,
                    shadowWeakness: calling.shadowWeakness
                        .map(function (w) {
                            return {
                                name: w,
                                degenerations: Object.keys(Gamedata.degenerationGroups[w])
                                    .map(function (d) {
                                        return { rank: d, name: Gamedata.degenerationGroups[w][d] };
                                    })
                            };
                        }),
                    unusual: Gamedata.cultures[pj.traits.culture].unusualCallings.indexOf(calling.name) !== -1,
                    suggested: Gamedata.cultures[pj.traits.culture].suggestedCallings.indexOf(calling.name) !== -1,
                    selected: pj.traits.calling == calling.name
                };

            });
        PcGenerator.selectedCalling = pj.traits.calling;
        // Remove from the character all Calling-given traits
        pj.traits.specialties = pj.traits.specialties
            .filter(function (s) {
                return callings.every(function (c) {
                    return c.additionalTrait.indexOf(s) === -1;
                });
            });

        var models = { pj: pj, controller: PcGenerator, callings: callings, selection: { calling: null} };
        return models;
    }

    PcGenerator.callingClick = function (event, models) {
        models.calling.selected = true;
        models.callings.forEach(function (c) {
            c.selected = (c === models.calling);
        });
        pj.traits.calling = models.calling.name;
        pj.traits.shadowWeakness = models.calling.shadowWeakness[0].name;
        PcGenerator.selectedCalling = pj.traits.calling;
        models.selection.calling = models.calling;
    };

    PcGenerator.readyForNext = function () {
        return pj.traits.calling && (pj.traits.calling !== "slayer");
    };
    PcGenerator.selectedCalling = null;
    PcGenerator.readyForSlayerTraitSelect = function () {
        return pj.traits.calling === "slayer";
    };

    function callingFinish(event, models) {
        if (models.selection.calling.name !== "slayer") {
            var trait = models.selection.calling.additionalTrait[0];
            pj.traits.specialties.push(new Pj.Trait(pj, trait));
        }
    }


    // Slayer Addtional Trait selection
    PcGenerator.selectedAdditionalTrait = null;
    function additionalTraitStart() {
        PcGenerator.selectedAdditionalTrait = null;
        var traits = Gamedata.callings[pj.traits.calling].additionalTrait
            .map(function (t) {
                var selected = pj.traits.specialties.indexOf(t) !== -1;
                var trait = { name: t, selected: selected };
                if (selected) {
                    PcGenerator.selectedAdditionalTrait = trait;
                }
                return trait;
            });
        var models = { pj: pj, controller: PcGenerator, traits: traits };
        return models;
    }

    PcGenerator.additionalTraitClick = function (event, models) {
        models.traits.forEach(function (t) {
            t.selected = (t === models.trait);
            if (t.selected) {
                PcGenerator.selectedAdditionalTrait = t;
            }
        });
    };

    function additionalTraitFinish() {
        pj.traits.specialties.push(new Pj.Trait(pj, PcGenerator.selectedAdditionalTrait.name));
    }

    // Favoured Skill Groups Selection
    function favouredSkillsStart() {
        var skills = Gamedata.callings[pj.traits.calling].favouredSkillGroups
        // Get skill groups' skills
            .map(function (sg) {
                return [Gamedata.skillGroups[sg].body, Gamedata.skillGroups[sg].heart, Gamedata.skillGroups[sg].wits];
            })
        // Join both lists in one
            .reduce(function (a, b) {
                return a.concat(b);
            })
        // Ignore skills the character already have as favoured that come from the culture and the background
            .filter(function (s) {
                return PcGenerator.selectedBackground.favouredSkill !== s && Gamedata.cultures[pj.traits.culture].favouredSkill !== s;
            })
            .map(function (s) {
                return { name: s, selected: false };
            });
        // In case we are here coming back from a later step, undo this step first by removing 'favoured' from skills other than background and cultural one
        Object.keys(pj.skills.common.favoured)
            .filter(function (s) {
                return PcGenerator.selectedBackground.favouredSkill !== s && Gamedata.cultures[pj.traits.culture].favouredSkill !== s;
            })
            .forEach(function (s) {
                pj.skills.common.favoured[s] = false;
            });

        var models = { pj: pj, controller: PcGenerator, skills: skills };
        return models;
    }
    PcGenerator.selectedFavouredSkills = [];

    function favouredSkillsFinish() {
        PcGenerator.selectedFavouredSkills.forEach(function (s) {
            pj.skills.common.favoured[s.name] = true;
        });
    }

    PcGenerator.favouredSkillClick = function (event, models) {
        var skill = models.skill;
        skill.selected = !skill.selected;
        PcGenerator.selectedFavouredSkills = models.skills
            .filter(function (s) {
                return s.selected;
            });
    };
    PcGenerator.favouredSkillReady = function () {
        return PcGenerator.selectedFavouredSkills.length === 2;
    };

    // Favoured Attribute Selection
    function favouredAttributeStart() {
        var attributes = ["body", "heart", "wits"];
        PcGenerator.favouredAttributes = attributes;
        updateFavouredAttributes(attributes);
        var models = { pj: pj, controller: PcGenerator, attributes: attributes };
        return models;
    }

    PcGenerator.shiftAttributeLeft = function (event, models) {
        var attributes = PcGenerator.favouredAttributes;
        var index = attributes.indexOf(models.attribute);
        if (index > 0) {
            var aux = attributes[index - 1];
            attributes[index - 1] = attributes[index];
            attributes[index] = aux;
        }
        updateFavouredAttributes(attributes);
        view.sync();
    };

    PcGenerator.shiftAttributeRight = function (event, models) {
        var attributes = PcGenerator.favouredAttributes;
        var index = attributes.indexOf(models.attribute);
        if (index < attributes.length - 1) {
            var aux = attributes[index + 1];
            attributes[index + 1] = attributes[index];
            attributes[index] = aux;
        }
        updateFavouredAttributes(attributes);
        view.sync();
    };

    function updateFavouredAttributes(attributes) {
        attributes.forEach(function (a, i) {
            var bonus = 3 - i;
            pj.stats.attributes.favoured[a] = (pj.stats.attributes.base[a] | 0) + (bonus | 0);
        });
    }

    // Valor/Wisdom selection
    function valourWisdomStart() {
        var selections = [
        {
            key: "uiVWValour2",
            valour: 2,
            wisdom: 1,
            reward: true,
            selected: false
        },
        {
            key: "uiVWWisdom2",
            wisdom: 2,
            valour: 1,
            virtue: true,
            selected: false
        }];
        PcGenerator.valourWisdomSelection = null;
        var models = { pj: pj, controller: PcGenerator, selections: selections };
        return models;
    }

    PcGenerator.valourWisdomClick = function (event, models) {
        models.selections.forEach(function (s) {
            s.selected = (models.selection === s);
            if (s.selected) {
                PcGenerator.valourWisdomSelection = s;
                pj.stats.wisdom = PcGenerator.valourWisdomSelection.wisdom;
                pj.stats.valour = PcGenerator.valourWisdomSelection.valour;
            }
        });
    };

    PcGenerator.showToValor = function () {
        return PcGenerator.valourWisdomSelection && (PcGenerator.valourWisdomSelection.valour === 2);
    };
    PcGenerator.showToWisdom = function () {
        return PcGenerator.valourWisdomSelection && (PcGenerator.valourWisdomSelection.wisdom === 2);
    };

    function valourWisdomFinish(event, models) {
        pj.stats.wisdom = PcGenerator.valourWisdomSelection.wisdom;
        pj.stats.valour = PcGenerator.valourWisdomSelection.valour;
    };

    // Reward selection
    function rewardStart() {
        var rewards = Object.keys(Gamedata.cultures[pj.traits.culture].rewards)
            .map(function (r) { return { name: r, selected: false }; })
            .concat(Object.keys(Gamedata.qualities)
                .map(function (q) { return { name: q, selected: false }; })
            );
        var models = { pj: pj, controller: PcGenerator, rewards: rewards };
        return models;
    }
    PcGenerator.selectedReward = null;
    PcGenerator.rewardClick = function (event, models) {
        pj.belongings.rewards = [new Reward(pj, models.reward.name)];
        pj.traits.virtues = [];
        PcGenerator.selectedReward = models.reward;
        models.rewards.forEach(function (r) {
            r.selected = (r == models.reward);
        });
    };

    // Virtue Selection
    function virtueStart() {
        var virtues = Gamedata.cultures[pj.traits.culture].virtues
            .map(function (v) {
                return { name: v, selected: false };
            })
            .concat(Object.keys(Gamedata.masteries)
                .map(function (m) {
                    return { name: m, selected: false };
                }));
        var models = { pj: pj, controller: PcGenerator, virtues: virtues };
        return models;
    }
    PcGenerator.selectedVirtue = null;
    PcGenerator.virtueClick = function (event, models) {
        pj.traits.virtues = [models.virtue.name];
        pj.belongings.rewards = [];
        PcGenerator.selectedVirtue = models.virtue;
        models.virtues.forEach(function (v) {
            v.selected = (v == models.virtue);
        });
    };

    // Previous XP Selection

    var RankUpButton = (function () {

        function RankUpButton(ini, models) {
            this.name = ini.name;
            this.score = ini.score;
            this.type = ini.type;
            this.favoured = ini.favoured;
            this.models = models;
        }

        RankUpButton.prototype.cost = function () {
            return this.type === "common"
                ? (this.score | 0) + 1
                : ((this.score | 0) + 1) * 2;
        };

        RankUpButton.prototype.unaffordable = function () {
            return this.models.spendings.left < this.cost();
        };

        return RankUpButton;
    })();

    function generateRankButtonInis() {
        var sss = Gamedata.cultures[pj.traits.culture].startingSkillScores;
        // Common Skills with starting scores
        var commonNonZero = Object.keys(sss)
            .sort(function (a, b) { return a.localeCompare(b); })
            .map(function (skill) {
                return { name: skill, score: sss[skill], type: "common", favoured: !!pj.skills.common.favoured[skill] };
            });
        // Other common skills at zero
        var commonZero = Object.keys(Gamedata.skills)
            .sort(function (a, b) { return a.localeCompare(b); })
            .filter(function (skill) {
                return !(skill in sss);
            })
            .map(function (skill) {
                return { name: skill, score: 0, type: "common", favoured: !!pj.skills.common.favoured[skill] };
            });
        var weaponNonZero = Object.keys(pj.skills.weapon)
            .sort(function (a, b) { return a.localeCompare(b); })
            .map(function (skill) {
                var ws = pj.skills.weapon[skill];
                return { name: skill, score: ws.rank, type: "weapon", favoured: pj.skills.weapon[skill] && !!pj.skills.weapon[skill].favoured };
            });
        var weaponZero = Object.keys(Gamedata.weapons)
            .sort(function (a, b) { return a.localeCompare(b); })
            .concat(Object.keys(Gamedata.weaponGroups).map(function (wg) { return "(" + wg + ")"; }))
            .filter(function (skill) {
                return !(skill in pj.skills.weapon);
            })
            .map(function (skill) {
                return { name: skill, score: 0, type: "weapon", favoured: pj.skills.weapon[skill] && !!pj.skills.weapon[skill].favoured };
            });
        return commonNonZero
            .concat(commonZero)
            .concat(weaponNonZero)
            .concat(weaponZero);
    };

    function xpStart() {

        var spendings = { left: 10 };
        var models = { pj: pj, controller: PcGenerator, spendings: spendings };
        var rankbuttons = generateRankButtonInis()
            .map(function (ini) {
                return new RankUpButton(ini, models);
            });
        models.rankbuttons = rankbuttons;
        return models;
    }

    PcGenerator.rankbuttonClick = function (event, models) {
        var cost = models.rankbutton.cost();
        if (cost <= models.spendings.left) {
            models.spendings.left -= cost;
            models.rankbutton.score++;
        }
    };

    PcGenerator.resetXp = function (event, models) {
        models.spendings.left = 10;
        models.rankbuttons = generateRankButtonInis()
        .map(function (ini) {
            return new RankUpButton(ini, models);
        });
        disposeView();
        startStep(models._stepIndex);
    };

    function xpFinish(event, models) {
        var rankbuttons = models.rankbuttons;
        rankbuttons.forEach(function (rb) {
            if (rb.score !== 0) {
                if (rb.type === "common") {
                    pj.skills.common.scores[rb.name] = rb.score | 0;
                } else {
                    if (rb.name in pj.skills.weapon) {
                        pj.skills.weapon[rb.name].rank = rb.score | 0;
                    } else {
                        pj.skills.weapon[rb.name] = { id: rb.name, favoured: !!rb.favoured, rank: rb.score | 0 };
                    }

                    // Give also a free weapon of this kind
                    var stats = Gamedata.weapons[rb.name];
                    if (stats) {
                        pj.belongings.weaponGear[rb.name] = {
                            id: rb.name,
                            carried: true,
                            stats: {
                                damage: stats.damage | 0,
                                edge: stats.edge,
                                injury: stats.injury | 0,
                                enc: stats.enc | 0
                            }
                        };
                    }
                }
            }
        });
    }

    // Completion
    function endStart() {
        var models = { pj: pj, controller: PcGenerator };
        return models;
    }

    PcGenerator.finishClick = function (event, models) {
        disposeView();
        //        var generatedPjJson = pj.toJson();
        //        var generatedPj = new Pj(generatedPjJson);
        sheet.view.unbind();
        sheet.view.models.pj = pj; // generatedPj;
        sheet.view.bind();
    };

    return PcGenerator;
});