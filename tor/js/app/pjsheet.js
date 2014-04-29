define(["jquery", "gamedata", "text", "pj", "jquery.ui", "jquery.linq", "json", "jquery.cookies", "jquery.migrate", "modernizr"],
    function ($, Gamedata, Text, Pj) {
        // Aliases
        var localizeOne = Text.localizeOne;
        var _ui_ = Text.write;

        var PjSheet = {};
        

        PjSheet.build = function () {
            fillSkillTable();
            fillWeaponSkillTable();
            fillWeaponGearTable();
            fillGearTable();
            fillInventoryTable();
            fillTaleOfYearsTable();
            iconImageUpdate();
        };

        // Character Sheet building functions
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
                var i;
                for (i = 1; i <= 6; i++) {
                    var iconDiv = $("<div><img /></div>");
                    iconDiv.attr("class", $(this).attr("skill") + "Skill skillRankIcon");
                    iconDiv.attr("skill", $(this).attr("skill"));
                    iconDiv.attr("rank", i);
                    $(this).append(iconDiv);
                }
            });
            // Advancement cells
            $(".skillGroupAdvancementCell").each(function () {
                var i;
                for (i = 1; i <= 3; i++) {
                    var iconDiv = $("<div><img /></div>");
                    iconDiv.attr("class", $(this).attr("skillGroup") + "SkillGroup skillGroupIcon");
                    iconDiv.attr("skillGroup", $(this).attr("skillGroup"));
                    iconDiv.attr("rank", i);
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
            for (i = 0; i < (rows || 4) ; i++) {
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