define(["jquery", "gamedata", "text", "pj", "txt!views/charactersheet/_charactersheetfront.html", "txt!views/charactersheet/_charactersheetback.html",
    "rivets", "jquery.ui", "jquery.linq", "json", "jquery.cookies", "jquery.migrate", "modernizr"],
    function ($, Gamedata, Text, Pj, frontTemplate, backTemplate, Rivets) {
        // Aliases
        var localizeOne = Text.localizeOne;
        var _ui_ = Text.write;


        var PjSheet = {
            rankEmptyUrl: "css/skillrankempty.png",
            rankFullUrl: "css/skillrankfull.png",
            groupEmptyUrl: "css/skillgroupempty.png",
            groupFullUrl: "css/skillgroupfull.png"
        };


        PjSheet.build = function () {
            insertTemplate();
            fillSkillTable();
            //fillWeaponSkillTable();
            fillWeaponGearTable();
            fillGearTable();
            fillInventoryTable();
            fillTaleOfYearsTable();
            PjSheet.configRivets();
        };

        PjSheet.configRivets = function () {
            Rivets.formatters.localize = function (value) {
                return Text.getText(value);
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
                            model.skills.weapon[skill].rank = rank - 1;
                        } else {
                            model.skills.weapon[skill].rank = +rank;
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

        }

        PjSheet.bind = function (pj) {
            Rivets.bind($(".characterSheet"), { pj: pj, controller: this });
        };

        // Character Sheet building functions
        function insertTemplate() {
            var front = $.parseHTML(frontTemplate);
            var back = $.parseHTML(backTemplate);
            $("body").append(front);
            $("body").append(back);
        }

        function fillSkillTable() {
            var skillTable = $(".skillTable");

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
                td.attr("rv-class-favoured", "pj.skills.common.favoured."+bodySkillName);
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

        function fillWeaponSkillTable(rows) {
            var weaponSkillTable = $("#weaponSkillsTable").empty();
            var i, j, rowCount = (rows || 2), columnCount = 3;
            var tr = $("<tr></tr>");
            for (i = 0; i < rowCount; i++) {
                tr = $("<tr></tr>");
                for (j = 0; j < columnCount; j++) {
                    // Name
                    var td = $("<td></td>");
                    td.attr("class", "skillNameCell");
                    td.attr("weaponSkillNo", i + j * rowCount);
                    var nameInput = $("<div class='input weaponSkillNameInput' ></div>");
                    td.append(nameInput);
                    tr.append(td);
                    // Rank
                    td = $("<td></td>");
                    td.attr("class", "skillRankCell");
                    td.attr("weaponSkillNo", i + j * rowCount);
                    tr.append(td);
                }
                weaponSkillTable.append(tr);
            }

            // Rank cells
            $(".weaponSkillsBox .skillRankCell").each(function () {
                for (i = 1; i <= 6; i++) {
                    var iconDiv = $("<div><img /></div>");
                    iconDiv.attr("class", "skillRankIcon");
                    iconDiv.attr("weaponSkillNo", $(this).attr("weaponSkillNo"));
                    iconDiv.attr("rank", i);
                    $(this).append(iconDiv);
                }
            });
        }

        function fillWeaponGearTable(rows) {
            var weaponGearTable = $("#weaponGearTable").empty();
            var i;
            for (i = 0; i < (rows || 4); i++) {
                var tr = $("<tr></tr>");
                tr.attr("weaponSkillNo", i);
                // Carried status box
                td = $("<td></td>");
                td.attr("class", "weaponGearStatCell");
                var carriedStatus = $("<div class='weaponGearCarriedStatus statusBox' stat='carried' on='true' />");
                td.append(carriedStatus);
                tr.append(td);
                // Name
                var td = $("<td></td>");
                td.attr("class", "weaponGearNameCell");
                var nameInput = $("<div class='input weaponGearNameInput' ></div>");
                td.append(nameInput);
                tr.append(td);
                // Damage label
                td = $("<td></td>");
                td.attr("class", "statNameCell");
                td.html(_ui_("uiWSDamage"));
                tr.append(td);
                // Damage input
                td = $("<td></td>");
                td.attr("class", "weaponGearStatCell");
                var damageInput = $("<input type='text' class='weaponGearDamageInput' stat='damage' />");
                td.append(damageInput);
                tr.append(td);
                // Edge label
                td = $("<td></td>");
                td.attr("class", "statNameCell");
                td.html(_ui_("uiWSEdge"));
                tr.append(td);
                // Edge input
                td = $("<td></td>");
                td.attr("class", "weaponGearStatCell");
                var edgeInput = $("<input type='text' class='weaponGearEdgeInput' stat='edge' />");
                td.append(edgeInput);
                tr.append(td);
                // Injury label
                td = $("<td></td>");
                td.attr("class", "statNameCell");
                td.html(_ui_("uiWSInjury"));
                tr.append(td);
                // Injury input
                td = $("<td></td>");
                td.attr("class", "weaponGearStatCell");
                var injuryInput = $("<input type='text' class='weaponGearInjuryInput' stat='injury' />");
                td.append(injuryInput);
                tr.append(td);
                // Enc label
                td = $("<td></td>");
                td.attr("class", "statNameCell");
                td.html(_ui_("uiEnc"));
                tr.append(td);
                // Enc input
                td = $("<td></td>");
                td.attr("class", "weaponGearStatCell");
                var encInput = $("<input type='text' class='weaponGearEncInput' stat='enc' />");
                td.append(encInput);
                tr.append(td);

                weaponGearTable.append(tr);
            }

        }

        function fillGearTable() {
            var gearTable = $(".gearTable");
            // Labeled three
            var labels = $("<div>" + _ui_("uiGArmour") + "</div><div>" + _ui_("uiGHeadgear") + "</div><div>" + _ui_("uiGShield") + "</div>");
            // For each label we create a row with label
            labels.each(function () {
                var tr = $("<tr></tr>");
                // Carried status box
                var td = $("<td></td>");
                td.attr("class", "gearCarried");
                var carriedStatus = $("<div class='gearCarriedStatus statusBox' stat='carried' on='true' />");
                td.append(carriedStatus);
                tr.append(td);
                // The label
                var labelText = $(this).html();
                td = $("<td><label>" + labelText + "</label></td>");
                tr.append(td);
                // The input
                td = $("<td><div gearType='" + labelText + "' class='gearName input' ></div></td>");
                tr.append(td);
                // The enc label
                td = $("<td><label>" + _ui_("uiEnc") + "</label></td>");
                tr.append(td);
                // The enc input
                td = $("<td><input type='text' gearType='" + labelText + "' class='gearEnc' /></td>");
                tr.append(td);

                gearTable.append(tr);
            });
            // We create a couple more, blank
            var i;
            for (i = 1; i <= 2; i++) {
                var tr = $("<tr></tr>");

                // Carried status box
                var td = $("<td></td>");
                td.attr("class", "gearCarried");
                var carriedStatus = $("<div class='gearCarriedStatus statusBox' stat='carried' on='true' />");
                td.append(carriedStatus);
                tr.append(td);

                // No label		
                td = $("<td>&nbsp;</td>");
                tr.append(td);
                // The input
                td = $("<td><div gearType='other' class='gearName input' ></div></td>");
                tr.append(td);
                // The enc label
                td = $("<td><label>" + _ui_("uiEnc") + "</label></td>");
                tr.append(td);
                // The enc input
                td = $("<td><input type='text' gearType='other' class='gearEnc' /></td>");
                tr.append(td);

                gearTable.append(tr);
            }
        }

        function fillInventoryTable() {
            var inventoryTable = $("#inventoryTable");
            // Clone the existing row several times
            var modelRow = $(inventoryTable).find("tr");
            var i;
            for (i = 1; i <= 10; i++) {
                var clone = $(modelRow).clone();
                $(inventoryTable).append(clone);
            }
            // Number the cells
            $("#inventoryTable td").each(function (index) {
                $(this).attr("slotNo", index + 1);
            });
        }

        function fillTaleOfYearsTable() {
            var gearTable = $("#taleOfYearsTable");
            // Clone the existing row several times
            var modelRow = $(gearTable).find("tr");
            var i;
            for (i = 1; i < 13; i++) {
                var clone = $(modelRow).clone();
                $(clone).attr("number", i);
                $(gearTable).append(clone);
            }
        }

        function iconImageUpdate() {
            $(".skillRankIcon").each(function () {
                if ($(this).attr("filled") == "true") {
                    $(this).find("img").attr("src", "css/skillrankfull.png");
                } else {
                    $(this).find("img").attr("src", "css/skillrankempty.png");
                }
            });
            $(".skillGroupIcon").each(function () {
                if ($(this).attr("filled") == "true") {
                    $(this).find("img").attr("src", "css/skillgroupfull.png");
                } else {
                    $(this).find("img").attr("src", "css/skillgroupempty.png");
                }
            });
            $(".statusBox").each(function () {
                if ($(this).attr("on") == "true") {
                    $(this).find("img").remove();
                    $(this).append($("<img src='css/checked.png' />"));
                } else {
                    $(this).find("img").remove();
                }
            });
        }

        return PjSheet;
    }
);