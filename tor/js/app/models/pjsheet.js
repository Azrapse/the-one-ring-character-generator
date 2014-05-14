define(["jquery", "gamedata", "text", "pj", "txt!views/charactersheet/_charactersheetfront.html", "txt!views/charactersheet/_charactersheetback.html",
    "rivets", "pjcontextmenus", "jquery.ui", "jquery.linq", "json", "jquery.cookies", "jquery.migrate", "modernizr"],
    function ($, Gamedata, Text, Pj, frontTemplate, backTemplate, Rivets, PjContextMenus) {
        // Aliases
        var localizeOne = Text.localizeOne;
        var _ui_ = Text.write;


        var PjSheet = {
            rankEmptyUrl: "css/skillrankempty.png",
            rankFullUrl: "css/skillrankfull.png",
            groupEmptyUrl: "css/skillgroupempty.png",
            groupFullUrl: "css/skillgroupfull.png",
            container: null,
            view: null,
            setPc: function (pc) {
                PjSheet.pj = pc;
                PjSheet.view.models.pj = pc;
            },
            getPc: function () {
                return PjSheet.pj;
            }
        };


        PjSheet.build = function (container) {
            if (!container) {
                container = $("body");
            }
            PjSheet.container = container;
            insertTemplate(container);
            fillSkillTable();
            PjSheet.configRivets();
        };

        PjSheet.configRivets = function () {
            Rivets.formatters.localize = function (value) {
                return Text.getText(value);
            };
            Rivets.formatters.write = function (value, textKey) {
                return Text.write(textKey, value);
            };
            Rivets.formatters.gt = function (value, arg) {
                return value > arg;
            };
            Rivets.formatters.lt = function (value, arg) {
                return value < arg;
            };
            Rivets.formatters.test = function (value, symbol, arg, first, second) {
                return eval(value + " " + symbol + " " + arg)
                    ? first
                    : second;
            };
            Rivets.formatters.geartype = function (value) {
                var textMatch = {
                    body: "uiGArmour",
                    head: "uiGHeadgear",
                    shield: "uiGShield"
                };
                var type = Gamedata.getGearType(value);
                var textKey = textMatch[type];

                return textKey
                    ? Text.getText(textKey)
                    : "";
            };
            Rivets.formatters.urlEncode = {
                read: function (value) {
                    return unescape(value);
                },
                publish: function (value) {
                    return escape(value);
                }
            };
            // Binders for skill rank icons
            Rivets.binders.skillrank = {
                publishes: true,
                bind: function (el) {
                    var model = this.view.models.pj;
                    this.clickHandler = function () {
                        var rankIcon = $(this);
                        var rank = rankIcon.attr("data-rank");
                        var skill = rankIcon.attr("data-skill");
                        var currentRank = model.skills.common.scores[skill];
                        if (currentRank == rank) {
                            model.skills.common.scores[skill] = rank - 1;
                        } else {
                            model.skills.common.scores[skill] = +rank;
                        }
                    };
                    $(el).on("click", ".skillRankIcon", this.clickHandler);
                    return Rivets._.Util.bindEvent(el, 'change', this.publish);
                },
                unbind: function (el) {
                    $(el).off("click", ".skillRankIcon", this.clickHandler);
                    return Rivets._.Util.unbindEvent(el, 'change', this.publish);
                },

                routine: function (el, value) {
                    value = value || 0;
                    $(el).find(".skillRankIcon").each(function () {
                        var image = $(this).find("img");
                        var rank = parseInt($(this).attr("data-rank") || 0);
                        var url = (rank <= value)
                                    ? PjSheet.rankFullUrl
                                    : PjSheet.rankEmptyUrl;
                        if (image.attr("src") != url) {
                            image.attr("src", url);
                        }
                    });
                }
            };
            Rivets.binders.skillgrouprank = {
                publishes: true,
                bind: function (el) {
                    var model = this.view.models.pj;
                    this.clickHandler = function () {
                        var rankIcon = $(this);
                        var rank = rankIcon.attr("data-rank");
                        var group = rankIcon.attr("data-skillGroup");
                        var currentRank = model.skillGroupScores[group];
                        if (currentRank == rank) {
                            model.skillGroupScores[group] = rank - 1;
                        } else {
                            model.skillGroupScores[group] = +rank;
                        }
                    };
                    $(el).on("click", ".skillGroupIcon", this.clickHandler);
                    return Rivets._.Util.bindEvent(el, 'change', this.publish);
                },
                unbind: function (el) {
                    $(el).off("click", ".skillGroupIcon", this.clickHandler);
                    return Rivets._.Util.unbindEvent(el, 'change', this.publish);
                },

                routine: function (el, value) {
                    value = value || 0;
                    $(el).find(".skillGroupIcon").each(function () {
                        var image = $(this).find("img");
                        var rank = parseInt($(this).attr("data-rank") || 0);
                        var url = (rank <= value)
                                    ? PjSheet.groupFullUrl
                                    : PjSheet.groupEmptyUrl;
                        if (image.attr("src") != url) {
                            image.attr("src", url);
                        }
                    });
                }
            };
            Rivets.binders.weaponskillrank = {
                publishes: true,
                bind: function (el) {
                    var model = this.view.models.pj;
                    this.clickHandler = function () {
                        var rankIcon = $(this);
                        var rank = rankIcon.attr("data-rank");
                        var skill = rankIcon.attr("data-weaponskill");
                        var currentRank = model.skills.weapon[skill].rank;
                        var favoured = model.skills.weapon[skill].favoured;
                        if (currentRank == rank) {
                            model.skills.weapon[skill].rank = (rank | 0) - 1;
                        } else {
                            model.skills.weapon[skill].rank = rank | 0;
                        }
                    };
                    $(el).on("click", ".skillRankIcon", this.clickHandler);
                    return Rivets._.Util.bindEvent(el, 'change', this.publish);
                },
                unbind: function (el) {
                    $(el).off("click", ".skillRankIcon", this.clickHandler);
                    return Rivets._.Util.unbindEvent(el, 'change', this.publish);
                },

                routine: function (el, value) {
                    value = value || 0;
                    $(el).find(".skillRankIcon").each(function () {
                        var image = $(this).find("img");
                        var rank = parseInt($(this).attr("data-rank") || 0);
                        var url = (rank <= value)
                                    ? PjSheet.rankFullUrl
                                    : PjSheet.rankEmptyUrl;
                        if (image.attr("src") != url) {
                            image.attr("src", url);
                        }
                    });
                }
            };
            /// Patches the rv-each-* binder.
            /// If the datasource is an object instead of an array, it creates an array with the values of each key in the object, and uses that instead.
            Rivets.binders['each-*'].baseroutine = Rivets.binders['each-*'].baseroutine || Rivets.binders['each-*'].routine;
            Rivets.binders['each-*'].routine = function (el, collection) {
                if ($.isArray(collection)) {
                    Rivets.binders['each-*'].baseroutine.call(this, el, collection);
                } else {
                    var array = $.map(collection, function (value, index) {
                        return [value];
                    });
                    Rivets.binders['each-*'].baseroutine.call(this, el, array);
                }
            };
            Rivets.binders['each-keyvalue-*'] = {
                block: Rivets.binders['each-*'].block,
                bind: Rivets.binders['each-*'].bind,
                unbind: Rivets.binders['each-*'].unbind,
                update: Rivets.binders['each-*'].update,
                baseroutine: Rivets.binders['each-*'].routine,
                routine: function (el, dict) {
                    var array = $.map(dict, function (value, index) {
                        return [{ key: index, value: value}];
                    });
                    Rivets.binders['each-*'].baseroutine.call(this, el, array);
                }
            };            
        }
        PjSheet.pj = null;
        PjSheet.bind = function (pj) {
            if (PjSheet.view) {
                view.unbind();
            };
            PjSheet.pj = pj;
            PjSheet.menuManager = new PjContextMenus($(".contextMenu"), this);
            PjSheet.view = Rivets.bind($(".characterSheet"), {
                pj: pj,
                controller: PjSheet,
                gamedata: Gamedata,
                menus: PjSheet.menuManager
            });
        };

        PjSheet.onEncChanged = function () {
            PjSheet.pj.updateEncFatigue();
            PjSheet.pj.updateTotalFatigue();
        }

        PjSheet.onShadowChanged = function () {
            PjSheet.pj.updateShadow();
        }

        PjSheet.databind = function () {
            if (PjSheet.view) {
                PjSheet.view.bind();
            }
        }

        Object.defineProperty(PjSheet, "pc", {
            get: PjSheet.getPc,
            set: PjSheet.setPc
        });
        // Character Sheet building functions
        function insertTemplate() {
            var front = $.parseHTML(frontTemplate);
            var back = $.parseHTML(backTemplate);
            PjSheet.container.append(front);
            PjSheet.container.append(back);
        }

        function fillSkillTable() {
            var skillTable = $(PjSheet.container).find(".skillTable");

            for (var skillGroupName in Gamedata.skillGroups) {
                var skillGroup = Gamedata.skillGroups[skillGroupName];
                var bodySkillName = skillGroup.body;
                var heartSkillName = skillGroup.heart;
                var witsSkillName = skillGroup.wits;

                var newTr = $("<tr></tr>");
                // Body skill
                var td = $("<td></td>");
                td.attr("class", bodySkillName + "Skill skillNameCell localizable");
                td.attr("data-skill", bodySkillName);
                td.attr("data-textKey", bodySkillName);
                td.attr("rv-class-favoured", "pj.skills.common.favoured." + bodySkillName);
                td.attr("rv-on-click", "menus.commonSkillMenu");
                localizeOne(td);
                newTr.append(td);
                td = $("<td></td>");
                td.attr("class", bodySkillName + "Skill skillRankCell");
                td.attr("data-skill", bodySkillName);
                newTr.append(td);
                // Heart skill
                td = $("<td></td>");
                td.attr("class", heartSkillName + "Skill skillNameCell  localizable");
                td.attr("data-skill", heartSkillName);
                td.attr("data-textKey", heartSkillName);
                td.attr("rv-class-favoured", "pj.skills.common.favoured." + heartSkillName);
                td.attr("rv-on-click", "menus.commonSkillMenu");
                localizeOne(td);
                newTr.append(td);
                td = $("<td></td>");
                td.attr("class", heartSkillName + "Skill skillRankCell");
                td.attr("data-skill", heartSkillName);
                newTr.append(td);
                // Wits skill
                td = $("<td></td>");
                td.attr("class", witsSkillName + "Skill skillNameCell  localizable");
                td.attr("data-skill", witsSkillName);
                td.attr("data-textKey", witsSkillName);
                td.attr("rv-class-favoured", "pj.skills.common.favoured." + witsSkillName);
                td.attr("rv-on-click", "menus.commonSkillMenu");
                localizeOne(td);
                newTr.append(td);
                td = $("<td></td>");
                td.attr("class", witsSkillName + "Skill skillRankCell");
                td.attr("data-skill", witsSkillName);
                newTr.append(td);
                // Skill group
                td = $("<td></td>");
                td.attr("class", skillGroupName + "SkillGroup skillGroupNameCell  localizable");
                td.attr("data-skillGroup", skillGroupName);
                td.attr("data-textKey", skillGroupName);
                localizeOne(td);
                newTr.append(td);
                td = $("<td></td>");
                td.attr("class", skillGroupName + "SkillGroup skillGroupAdvancementCell");
                td.attr("data-skillGroup", skillGroupName);
                newTr.append(td);

                $(skillTable).append(newTr);
            }

            // Rank cells
            $(".skillsBox .skillRankCell").each(function () {
                var skill = $(this).attr("data-skill");
                $(this).attr("rv-skillrank", "pj.skills.common.scores." + skill);
                for (var i = 1; i <= 6; i++) {
                    var iconDiv = $("<div><img /></div>")
                        .attr("class", skill + "Skill skillRankIcon")
                        .attr("data-skill", skill)
                        .attr("data-rank", i);

                    $(this).append(iconDiv);
                }
            });
            // Advancement cells
            $(".skillGroupAdvancementCell").each(function () {
                var group = $(this).attr("data-skillGroup");
                $(this).attr("rv-skillgrouprank", "pj.skillGroupScores." + group);
                for (var i = 1; i <= 3; i++) {
                    var iconDiv = $("<div><img /></div>")
                        .attr("class", group + "SkillGroup skillGroupIcon")
                        .attr("data-skillGroup", group)
                        .attr("data-rank", i);
                    $(this).append(iconDiv);
                }
            });

        }

        PjSheet.getComment = function(arg1, arg2, arg3){
            return "TAtaTA";
        };

        return PjSheet;
    }
);