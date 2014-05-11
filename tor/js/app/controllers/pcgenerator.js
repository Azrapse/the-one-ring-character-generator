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
    "jquery.linq"],
function (Pj, PjSheet, Gamedata, Text, Rivets, $,
    cultureTemplate, wsPackageTemplate, specialtiesTemplate, backgroundTemplate, callingTemplate, additionalTraitTemplate,
    favouredSkillTemplate, favouredAttributeTemplate, valourWisdomTemplate, rewardsTemplate, virtuesTemplate, xpTemplate) {
    var PcGenerator = {};
    var pj = null;
    var sheet = null;
    var container = document.body;
    var view = null;
    var element = null;

    var creationSteps = [
        { start: cultureSelectionStart },
        { start: wsPackStart },
        { start: specialtiesStart, finish: specialtiesFinish },
        { start: backgroundStart, finish: backgroundFinish },
        { start: callingStart },
        { start: additionalTraitStart },
        { start: favouredSkillsStart, finish: favouredSkillsFinish },
        { start: favouredAttributeStart },
        { start: valourWisdomStart, finish: valourWisdomFinish },
        { start: rewardStart },
        { start: virtueStart },
        { start: xpStart, finish: xpFinish }
    ];
    var creationStepIndex = 0;

    PcGenerator.start = function (initializer) {
        pj = new Pj("???");
        sheet = initializer.sheet;
        container = $(initializer.container || container);
        sheet.pj = pj;
        creationStepIndex = 0;
        creationSteps[creationStepIndex].start();
    };

    PcGenerator.goNext = function (event, models) {
        if (creationSteps[creationStepIndex].finish) {
            creationSteps[creationStepIndex].finish(event, models);
        }
        if (creationStepIndex < creationSteps.length - 1) {
            creationStepIndex++;
            creationSteps[creationStepIndex].start();
        }
    };

    PcGenerator.goNextSkipOne = function (event, models) {
        if (creationSteps[creationStepIndex].finish) {
            creationSteps[creationStepIndex].finish(event, models);
        }
        if (creationStepIndex < creationSteps.length - 2) {
            creationStepIndex += 2;
            creationSteps[creationStepIndex].start();
        }
    };

    PcGenerator.goPrevious = function (event, models) {
        if (creationSteps[creationStepIndex].finish) {
            creationSteps[creationStepIndex].finish(event, models);
        }

        if (creationStepIndex > 0) {
            creationStepIndex--;
            creationSteps[creationStepIndex].start();
        }
    };

    PcGenerator.goPreviousSkipOne = function (event, models) {
        if (creationSteps[creationStepIndex].finish) {
            creationSteps[creationStepIndex].finish(event, models);
        }

        if (creationStepIndex > 1) {
            creationStepIndex -= 2;
            creationSteps[creationStepIndex].start();
        }
    };


    function createView(template, models) {
        disposeView();
        var template = $.parseHTML(template)
            .filter(function (e) { return e instanceof HTMLElement; })[0];
        element = $(template);
        container.append(element);
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
            cultures: Gamedata.cultures
        };
        var viewElement = createView(cultureTemplate, models);
    }

    PcGenerator.cultureClick = function (event, models) {
        var sender = $(this);
        var culture = sender.attr("data-culture");
        $(".cultureSelectionButton").removeClass("selected");
        sender.addClass("selected");
        pj.traits.culture = culture;
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
                    })
                };
            });
        pj.skills.weapon = pj.skills.weapon || {};
        var models = { pj: pj, controller: PcGenerator, packs: packs };
        var viewElement = createView(wsPackageTemplate, models);
    };

    PcGenerator.wsPackClick = function (event, models) {
        var index = $(this).attr("data-index") | 0;
        $(".weaponSkillsPackageSelectionButton").removeClass("selected");
        $(this).addClass("selected");
        $("#weaponSkillsPackageNextButton").show();
        var pack = Gamedata.cultures[pj.traits.culture].weaponSkillPackages[index];
        pj.skills.weapon = {};
        Object.keys(pack.skills)
            .forEach(function (s) {
                pj.skills.weapon[s] = { id: s, favoured: !!pack.favoured[s], rank: pack.skills[s] | 0 };
            });
    };

    // Specialties
    function specialtiesStart() {
        var specialties = Gamedata.cultures[pj.traits.culture].specialties;
        pj.traits.specialties = pj.traits.specialties || [];
        PcGenerator.specialtiesDep = pj.traits.specialties;
        var models = { pj: pj, controller: PcGenerator, specialties: specialties };
        var viewElement = createView(specialtiesTemplate, models);
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
            .slice(0, PcGenerator.specialtiesDep.length);
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
        var viewElement = createView(backgroundTemplate, models);
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
        pj.characterTexts.backgroundText = Text.getDescription(PcGenerator.selectedBackground.name);
        pj.traits.features = PcGenerator.selectedBackground.distinctiveFeatures
            .filter(function (f) { return f.selected; })
            .map(function (f) { return f.name; });
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
        var models = { pj: pj, controller: PcGenerator, callings: callings };
        var viewElement = createView(callingTemplate, models);
    }

    PcGenerator.callingClick = function (event, models) {
        models.calling.selected = true;
        models.callings.forEach(function (c) {
            c.selected = (c === models.calling);
        });
        pj.traits.calling = models.calling.name;
        PcGenerator.selectedCalling = pj.traits.calling;
    };

    PcGenerator.readyForNext = function () {
        return pj.traits.calling && (pj.traits.calling !== "slayer");
    };
    PcGenerator.selectedCalling = null;
    PcGenerator.readyForSlayerTraitSelect = function () {
        return pj.traits.calling === "slayer";
    };

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
        var viewElement = createView(additionalTraitTemplate, models);
    }

    PcGenerator.additionalTraitClick = function (event, models) {
        models.traits.forEach(function (t) {
            t.selected = (t === models.trait);
            if (t.selected) {
                PcGenerator.selectedAdditionalTrait = t;
            }
        });
    };

    // Favoured Skill Groups Selection
    function favouredSkillsStart() {
        PcGenerator.selectedAdditionalTrait = [];
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

        var models = { pj: pj, controller: PcGenerator, skills: skills };
        var viewElement = createView(favouredSkillTemplate, models);
    }
    PcGenerator.selectedFavouredSkills = [];

    function favouredSkillsFinish() {
        PcGenerator.selectedFavouredSkills.forEach(function (s) {
            pj.skills.common.favoured[s] = true;
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
        var viewElement = createView(favouredAttributeTemplate, models);
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
        var viewElement = createView(valourWisdomTemplate, models);
    }

    PcGenerator.valourWisdomClick = function (event, models) {
        models.selections.forEach(function (s) {
            s.selected = (models.selection === s);
            if (s.selected) {
                PcGenerator.valourWisdomSelection = s;
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
            .map(function (r) {
                return { name: r, selected: false };
            })
            .concat(Object.keys(Gamedata.qualities)
                .map(function (q) {
                    return { name: q, selected: false };
                }));
        var models = { pj: pj, controller: PcGenerator, rewards: rewards };
        var viewElement = createView(rewardsTemplate, models);
    }
    PcGenerator.selectedReward = null;
    PcGenerator.rewardClick = function (event, models) {
        pj.belongings.rewards = [models.reward];
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
        var viewElement = createView(virtuesTemplate, models);
    }
    PcGenerator.selectedVirtue = null;
    PcGenerator.virtueClick = function (event, models) {
        pj.traits.virtues = [models.virtue];
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

        RankUpButton.prototype.visible = function () {
            return this.models.spendings.left >= this.cost();
        };

        return RankUpButton;
    })();

    function xpStart() {
        var sss = Gamedata.cultures[pj.traits.culture].startingSkillScores;
        // Common Skills with starting scores
        var commonNonZero = Object.keys(sss)
            .map(function (skill) {
                return { name: skill, score: sss[skill], type: "common", favoured: pj.skills.common.favoured[skill] };
            });
        // Other common skills at zero
        var commonZero = Object.keys(Gamedata.skills)
            .filter(function (skill) {
                return !(skill in sss);
            })
            .map(function (skill) {
                return { name: skill, score: 0, type: "common", favoured: pj.skills.common.favoured[skill] };
            });
        var weaponNonZero = Object.keys(pj.skills.weapon)
            .map(function (skill) {
                var ws = pj.skills.weapon[skill];
                return { name: skill, score: ws.rank, type: "weapon", favoured: pj.skills.weapon[skill] && pj.skills.weapon[skill].favoured };
            });
        var weaponZero = Object.keys(Gamedata.weapons)
            .concat(Object.keys(Gamedata.weaponGroups).map(function (wg) { return "(" + wg + ")"; }))
            .filter(function (skill) {
                return !(skill in pj.skills.weapon);
            })
            .map(function (skill) {
                return { name: skill, score: 0, type: "weapon", favoured: pj.skills.weapon[skill] && pj.skills.weapon[skill].favoured };
            });
        var spendings = { left: 10 };
        var models = { pj: pj, controller: PcGenerator, spendings: spendings };
        var rankbuttons = commonNonZero
            .concat(commonZero)
            .concat(weaponNonZero)
            .concat(weaponZero)
            .map(function (ini) {
                return new RankUpButton(ini, models);
            });
        models.rankbuttons = rankbuttons;
        var viewElement = createView(xpTemplate, models);
    }

    PcGenerator.rankbuttonClick = function (event, models) {
        var cost = models.rankbutton.cost();
        models.spendings.left -= cost;
        models.rankbutton.score++;
    };

    PcGenerator.resetXp = function (event, models) {
        
    };
    function xpFinish() {

    }

    return PcGenerator;
});