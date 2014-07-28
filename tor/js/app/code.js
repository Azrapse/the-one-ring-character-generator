define(["jquery", "rivets", "gamedata", "text", "pj", "pjsheet", "tooltip", "pcgenerator",
"jquery.ui", "jquery.linq", "json", "jquery.cookies", "jquery.migrate", "modernizr", "jquery.slicknav"],
    function ($, Rivets, Gamedata, Text, Pj, PjSheet, Tooltip, PcGenerator) {
        // Aliases
        var localizeOne = Text.localizeOne;
        var localize = Text.localizeAll;
        var _loc_ = Text.write;
        var tooltip;


        // Main function
        $(function () {
            mainInitialize();
        });

        function mainInitialize() {
            $.when(initializeLocale(), initializeGamedata())
                .done(function () {
                    $("#globalmenu").slicknav({ label: '', allowParentLinks: true, closeOnClick: true });
                    PjSheet.build();
                    setClickablesEvents();

                    localize();
                    tooltip = new Tooltip($(document.body), ".localizable");
                    window.tooltip = tooltip;
                    initializeRoller();
                    //                  localizeUI();
                    //                  initializeCookieData();

                    getLocalStorageData();

                    // Test load 
                    $.get("js/data/abredul.json", {})
                    .done(function (response) {
                        var abredul = new Pj(response);
                        PjSheet.bind(abredul);
                        window.abredul = abredul;
                        window.view = PjSheet.view;
                    })
                    .fail(function (response) {
                        alert(response);
                    });
                })
                .fail(function (response) {
                    console.log("Error initializing: " + response);
                });
        }

        // Localization and tooltips 
        var localeDict = {};
        function initializeLocale() {
            return Text.initialize()
                .done(function () {
                    $(".logoContainer img").attr("src", Text.logoFile);
                    localeDict = Text.textDict;
                    Text.localizeAll();
                    $(".characterSheet, .actionMenu, #rollerDiv").show();
                });
        }

        function initializeGamedata() {
            return $.get("/tor/js/data/gamedata.json", {})
                .done(function (response) {
                    Gamedata.LoadJson(response);
                    window.Gamedata = Gamedata;
                })
                .error(function (response) {
                    console.log("Error loading gamedata.json");
                });
        }

        function getLocalStorageData() {
            tooltip.show = localStorage["popups"] || "popupTooltips";
        }

        var mainMenuController = {
            createNew: function () {
                PcGenerator.start({ sheet: PjSheet });
            }
        };

        var backupOfCurrentSheet = null;
        function setClickablesEvents() {
            Rivets.bind($("#globalmenu"), { controller: mainMenuController });

            // moveable action menu
            $(".actionMenu").draggable();

            // set up start button
            $("#startButton").click(function (e) {
                PcGenerator.start({ sheet: PjSheet });
            });

            // toggle font button
            $("#fontToggleButton").click(function (e) {
                alternateFontToggle();
            });

            // toggle volatile
            $("#hideVolatileButton").click(function (e) {
                toggleVolatileCells();
            });


            // set up description toggle button
            $("#descriptionsToggleButton").click(function (e) {
                toggleDescriptions();
            });

            //            // synched toggle button
            //            $("#synchedToggleButton").click(function (e) {
            //                if ($("#synchedToggleButton").hasClass("discouragedButton")) {
            //                    $("#synchedToggleButton").removeClass("discouragedButton");
            //                    $("#synchedToggleButton").addClass("encouragedButton");
            //                    synchCheckService();
            //                } else {
            //                    $("#synchedToggleButton").addClass("discouragedButton");
            //                    $("#synchedToggleButton").removeClass("encouragedButton");
            //                }
            //            });


            //            // set up save button
            //            $("#saveButton").click(function (e) {
            //                serializeCharacter();
            //            });
            //            // set up load button
            //            $("#loadButton").click(function (e) {
            //                deserializeCharacter();
            //            });

            //            // Forum code button
            //            $("#forumCodeButton").click(function (e) {
            //                renderBBCode();
            //            });

            //            // Online button
            //            $("#onlineButton").click(function (e) {
            //                onlineInitialize();
            //            });

            //            // Chat button
            //            $("#chatButton").click(function (e) {
            //                chatInitialize();
            //            });

            //            // Chat History button
            //            $("#chatHistoryButton").click(function (e) {
            //                chatHistoryRecover();
            //            });

            //            // Download Chat History button
            //            $("#downloadChatHistoryButton").click(function (e) {
            //                downloadChatHistory();
            //            });

            // About button
            $("#aboutButton").click(function (e) {
                $("#aboutDiv").show();
                $("#aboutDiv #aboutCloseButton").unbind().click(function () {
                    $("#aboutDiv").hide();
                });
            });

            // changes button
            $("#changesButton").click(function (e) {
                $("#changesButton").removeClass("highlight");
                $.cookie("latestVisited", $("#changesButton").attr("latest"), { expires: 3650 });
                $("#changesDiv").show();
            });
            $("#changesCloseButton").click(function (e) {
                $("#changesDiv").hide();
            });


            $(window).scroll(function () {
                var top = $(window).scrollTop();
                var notification = $(".notification");
                if (notification.length > 0) {
                    notification.css({ top: top });
                }
            });

            //            // Cancel Character Creation with button or ESCAPE. Accept ENTER as Next and BACKSPACE as Previous
            //            $(".wizardWindow").on("click", ".cancel", function () {
            //                if (backupOfCurrentSheet != null) {
            //                    resetCreation();
            //                    objectToSheet(backupOfCurrentSheet);
            //                    backupOfCurrentSheet = null;
            //                    $(this).parents(".wizardWindow").hide();
            //                }
            //            });
            //            var KEYCODE_ENTER = 13;
            //            var KEYCODE_ESC = 27;
            //            var KEYCODE_BACKSPACE = 8;
            //            // We prevent the browser to go back in the history
            //            $(document).keydown(function (e) {
            //                if (e.keyCode == KEYCODE_BACKSPACE) {
            //                    // But don't prevent the user from deleting in an input or textarea!
            //                    if (!$(document.activeElement).is("input, textarea")) {
            //                        e.preventDefault();
            //                    }
            //                }
            //            });
            //            $(document).keyup(function (e) {
            //                if (e.keyCode == KEYCODE_ESC) {
            //                    $('.cancel:not(:hidden)').trigger("click");
            //                }
            //                if (e.keyCode == KEYCODE_ENTER) {
            //                    $('.next:not(:hidden)').trigger("click");
            //                }
            //                if (e.keyCode == KEYCODE_BACKSPACE) {
            //                    $('.previous:not(:hidden)').trigger("click");
            //                }
            //            });
        }

        function toggleDescriptions() {
            if (tooltip.show == "popupButtons") {
                tooltip.show = "popupTooltips";
            }
            else if (tooltip.show == "popupTooltips") {
                tooltip.show = "hidden";
            }
            else {
                tooltip.show = "popupButtons";
            }
            localStorage['popups'] = tooltip.show;
            //            if ($("#descriptionsToggleButton").hasClass("popupButtons")) {
            //                $("#descriptionsToggleButton, #tooltipDiv").removeClass("popupButtons").addClass("popupTooltips");
            //                $("#descriptionsToggleButton").attr("localizeKey", "uiPopupTooltips");
            //                $("#descriptionsToggleButton").html(_loc_("uiPopupTooltips"));
            //                $.cookie('popups', 'tooltips', { expires: 3650 });
            //            } else if ($("#descriptionsToggleButton").hasClass("popupTooltips")) {
            //                $("#descriptionsToggleButton, #tooltipDiv").removeClass("popupTooltips").addClass("popupNothing");
            //                $("#descriptionsToggleButton").attr("localizeKey", "uiNoPopupHelp");
            //                $("#descriptionsToggleButton").html(_loc_("uiNoPopupHelp"));
            //                $.cookie('popups', 'nothing', { expires: 3650 });
            //            } else if ($("#descriptionsToggleButton").hasClass("popupNothing")) {
            //                $("#descriptionsToggleButton, #tooltipDiv").removeClass("popupNothing").addClass("popupButtons");
            //                $("#descriptionsToggleButton").attr("localizeKey", "uiPopupHelpButtons");
            //                $("#descriptionsToggleButton").html(_loc_("uiPopupHelpButtons"));
            //                $.cookie('popups', 'buttons', { expires: 3650 });
            //            }
        }


        function alternateFontToggle() {
            $("body").toggleClass("alternateFont");

            $.cookie('alternateFont', $(".characterSheet label").hasClass("alternateFont"), { expires: 3650 });
        }

        function toggleVolatileCells() {
            $(".roundStatBox, .subRoundStatBox,	.statusBox,	.attributeBox, .favouredAttributeBox, .skillGroupIcon").toggleClass("noPrint");
        }

        /// Inserts a localizable span with that textKey
        function __(text) {
            return '<span class="localizable" data-textKey="' + text + '"></span>';
        }

        function ___(key) {
            return '<span class="localizable" data-textKey="' + key + '">' + Text.getText(key) + '</span>';
        }

        // Localizes the whole page or only one element
        function localizeUI(optionalElement) {
            if (optionalElement) {
                localizeOne(optionalElement);
            } else {
                localizeAll();
            }
        }

        function importCharacterV1(data) {
            // Import from Version 1			
            $("#nameInput").attr("value", data.name).trigger("change");
            $("#cultureInput").html(__(data.culture));
            $("#standardInput").html(__(data.standard));
            $("#culturalBlessingInput").html(__(data.culturalBlessing));
            $("#callingInput").html(__(data.calling));
            $("#shadowWeaknessInput ").html(__(data.shadowWeakness));
            $("#specialtiesInput").empty();
            var array = data.specialties.split(",");
            var i;
            for (i in array) {
                $("#specialtiesInput").append(__(array[i]) + ", ");
            }
            $("#distinctiveFeaturesInput").empty();
            array = data.features.split(",");
            for (i in array) {
                $("#distinctiveFeaturesInput").append(__(array[i]) + ", ");
            }


            $("#internalData .skillGroups .skillGroup div").each(function () {
                var skillId = $(this).html();
                $(".skillNameCell[skill=" + skillId + "]").removeClass("favoured");
            });
            array = data.favoured.split(",");
            for (i in array) {
                $(".skillNameCell[skill=" + array[i] + "]").addClass("favoured");
            }

            $("#internalData .skillGroups .skillGroup div").each(function () {
                var skillId = $(this).html();
                var rank = isNaN(parseInt(data[skillId], 10)) ? 0 : parseInt(data[skillId], 10);
                $(".skillRankIcon[skill=" + skillId + "]").each(function () {
                    if (parseInt($(this).attr("rank"), 10) <= rank) {
                        $(this).attr("filled", "true");
                    } else {
                        $(this).attr("filled", "false");
                    }
                });
            });

            $("#internalData .skillGroups .skillGroup").each(function () {
                var skillId = $(this).attr("name");
                var rank = isNaN(parseInt(data[skillId], 10)) ? 0 : parseInt(data[skillId], 10);
                $(".skillGroupIcon[skillgroup=" + skillId + "]").each(function () {
                    if (parseInt($(this).attr("rank"), 10) <= rank) {
                        $(this).attr("filled", "true");
                    } else {
                        $(this).attr("filled", "false");
                    }
                });
            });

            $(".attributeBox").each(function () {
                $(this).find("input").attr("value", parseInt(data[$(this).attr("attribute")], 10) || 0);
            });
            $(".favouredAttributeBox").each(function () {
                $(this).find("input").attr("value", parseInt(data["favoured" + $(this).attr("attribute")], 10) || 0);
            });
            $(".roundStatBox,.subRoundStatBox").each(function () {
                $(this).find("input").attr("value", data[$(this).attr("stat")] || "");
            });
            $(".statusBox").each(function () {
                $(this).attr("on", data[$(this).attr("stat")] || false);
            });
            $(".virtuesContent div").empty();
            array = data.virtues.split(",");
            if (array.length > 0) {
                for (i in array) {
                    if (array[i].replace(/['"]/g, '') == "") {
                        continue;
                    }

                    $(".virtuesContent div").append(__(array[i]) + ", ");
                }
            }
            $(".rewardsContent div").empty();
            array = data.rewards.split(",");
            if (array.length > 0) {
                for (i in array) {
                    if (array[i].replace(/['"]/g, '') == "") {
                        continue;
                    }
                    $(".rewardsContent div").append(__(array[i]) + ", ");
                }
            }

            // ##Changes made for importing from version 1 to the new layout!!!

            var wsArray = data.weaponSkills.split(";");
            // Make room for the many weapon skills
            // ## n=wsArray.length -> skill count in the character. In the new layout we have to make Math.ceil(n/3) rows to fit them all because every row in the new layout holds 3
            // ## Weapon skills rows
            var neededWSRows = Math.ceil(wsArray.length / 3);
            while ($("#weaponSkillsTable tr").length < neededWSRows) {
                $("#weaponSkillsTable").append($("#weaponSkillsTable tr:eq(0)").clone());
            }
            // ## Weapon gear rows
            while ($("#weaponGearTable tr").length < wsArray.length) {
                $("#weaponGearTable").append($("#weaponGearTable tr:eq(0)").clone());
            }
            renumberWeaponSlots();

            // Empty the rows (## in both skills and gear tables)
            $("#weaponSkillsTable .weaponSkillNameInput, #weaponGearTable .weaponGearNameInput").empty();
            $("#weaponGearTable .weaponGearDamageInput, #weaponGearTable .weaponGearEdgeInput, #weaponGearTable .weaponGearInjuryInput, #weaponGearTable .weaponGearEncInput").val("");

            // Fill the rows
            var ws;
            for (ws in wsArray) {
                array = wsArray[ws].split(",");
                // ## Locate where to fill up in the tables
                // ## Weapon Skills table
                var wsNameInput = $("#weaponSkillsTable .skillNameCell[weaponSkillNo=" + ws + "] .weaponSkillNameInput");

                $(wsNameInput).html(__(array[0]));
                if (array[1] == "true") {
                    $(wsNameInput).addClass("favoured");
                } else {
                    $(wsNameInput).removeClass("favoured");
                }
                $("#weaponSkillsTable .skillRankCell[weaponSkillNo=" + ws + "] .skillRankIcon").each(function () {
                    if (parseInt($(this).attr("rank"), 10) <= array[6]) {
                        $(this).attr("filled", "true");
                    } else {
                        $(this).attr("filled", "false");
                    }
                });
                // ## Weapon Gear table
                // ## Don't if it's a group skill (or if it's empty from a bad saving)
                var tr = $("#weaponGearTable tr[weaponSkillNo=" + ws + "]");
                if ((array[0].indexOf("(") != -1) || !array[0]) {
                    if ($("#weaponGearTable tr").length > 1) {
                        $(tr).remove();
                    }
                    continue;
                }


                $(tr).find(".weaponGearNameInput").html(__(array[0]));
                $(tr).find(".weaponGearDamageInput").attr("value", array[2]);
                $(tr).find(".weaponGearEdgeInput").attr("value", array[3]);
                $(tr).find(".weaponGearInjuryInput").attr("value", array[4]);
                $(tr).find(".weaponGearEncInput").attr("value", array[5]);
            }

            var gearArray = data.gear.split(";");
            // Make room for the many gear rows
            while ($(".gearTable tr").length < gearArray.length) {
                $(".gearTable").append($(".gearTable tr:eq(0)").clone());
            }
            // Empty the rows
            $(".gearTable .gearName").empty();
            $(".gearTable .gearEnc").attr("value", "");
            // Fill the rows
            var g;
            for (g in gearArray) {
                array = gearArray[g].split(",");
                tr = $(".gearTable tr:eq(" + g + ")");
                $(tr).find(".gearName").append(__(array[0]));
                $(tr).find(".gearEnc").attr("value", array[1]);
            }

            // Back sheet
            $("#taleOfYearsTable .yearTale .input").val("");
            $.Enumerable.From(data.taleOfYears)
				.Do(function (value, index) {
				    var toyRow = $("#taleOfYearsTable .yearTale:eq(" + index + ")");
				    $(toyRow).find(".year.input").val(value.year || "");
				    $(toyRow).find(".events.input").val(value.events || "");
				})
				.ToArray();
            $(".bigText[stat=backgroundText] .input").val(data.backgroundText || "");
            $("#guideInput").val(data.guideText || "");
            $("#scoutInput").val(data.scoutText || "");
            $("#huntsmanInput").val(data.huntsmanText || "");
            $("#lookoutInput").val(data.lookoutText || "");
            $("#fellowshipFocusInput").val(data.fellowshipFocusText || "");
            $("#fellowshipNotesInput").val(data.fellowshipNotesText || "");
            $("#sanctuariesInput").val(data.sanctuariesText || "");
            $("#patronInput").val(data.patronText || "");


            iconImageUpdate();
            localize();

            // After localization, all localizables have localizeKey. 
            // Then we can attach the comments.
            var key;
            for (key in data.comments) {
                var element = $(".localizable[localizeKey=" + key + "]");
                if (element.length == 0) {
                    continue;
                }
                $(element).attr("commentText", data.comments[key]);
                localizeOne(element);
            }
        }

        function initializeRoller() {

            $("#rollerControlsDiv .featDiv").click(function () {
                var bonus = $("#rollerBonusInput").attr("value").replace("+", "");
                bonus = (isNaN(parseInt(bonus, 10)) ? 0 : parseInt(bonus, 10));
                var weary = ($("#rollerWearyCheckbox").attr("checked") == "checked");
                roll(0, bonus, weary);
            });

            $("#rollerControlsDiv .successDiv .action").click(function () {
                var bonus = $("#rollerBonusInput").attr("value").replace("+", "");
                bonus = (isNaN(parseInt(bonus, 10)) ? 0 : parseInt(bonus, 10));
                var weary = ($("#rollerWearyCheckbox").attr("checked") == "checked");
                var number = parseInt($(this).attr("number"), 10);
                roll(number, bonus, weary);
            });

            $("#rollerDiv .keepOneOfTwo input[type=checkbox]").click(function () {
                if ($(this).attr("checked") == "checked") {
                    $("#rollerDiv .keepOneOfTwo input[type=checkbox]").attr("checked", false);
                    $(this).attr("checked", true);
                }
            });
        }

        function roll(d6, bonus, weary) {
            var featDie = Math.floor(Math.random() * 12 + 1);
            var successDice = [];
            var i;
            var tengwar = 0;
            var total;
            var keepBest = ($("#rollerDiv .keepOneOfTwo input[type=checkbox][case=best]").attr("checked") == "checked");
            var keepWorst = ($("#rollerDiv .keepOneOfTwo input[type=checkbox][case=worst]").attr("checked") == "checked");
            var secondFeatDie = false;
            // Keep best or worst as featDie. Discarded one will be secondFeatDie
            if (keepBest || keepWorst) {
                secondFeatDie = Math.floor(Math.random() * 12 + 1);
                var die1 = (featDie == 12) ? 0 : featDie;
                var die2 = (secondFeatDie == 12) ? 0 : secondFeatDie;
                if (keepBest) {
                    if (die2 > die1) {
                        var aux = featDie;
                        featDie = secondFeatDie;
                        secondFeatDie = aux;
                    }
                } else {
                    if (die2 < die1) {
                        var aux = featDie;
                        featDie = secondFeatDie;
                        secondFeatDie = aux;
                    }
                }
            }

            if (featDie == 12) {
                total = 0;
            } else {
                total = featDie;
            }

            for (i = 0; i < d6; i++) {
                var d6Roll = Math.floor(Math.random() * 6 + 1);
                successDice.push(d6Roll);
                if (d6Roll == 6) {
                    tengwar++;
                }
                if (d6Roll <= 3 && weary) {
                    total += 0;
                } else {
                    total += d6Roll;
                }
            }
            var bonus = $("#rollerBonusInput").attr("value");
            if (bonus == undefined) {
                bonus = 0;
            } else {
                bonus = parseInt(bonus, 10);
                if (isNaN(bonus)) {
                    bonus = 0;
                }
            }
            total += bonus;

            // Display results: 11 = gandalf, 12 = sauron
            var resultsDiv = $("#rollerResultsDiv").empty();
            if (featDie == 11) {
                $(resultsDiv).append($("<div class='dieDiv d12DieDiv'><img src='css/g.png' /></div>"));
            } else if (featDie == 12) {
                $(resultsDiv).append($("<div class='dieDiv d12DieDiv'><img src='css/s.png' /></div>"));
            } else {
                $(resultsDiv).append($("<div class='dieDiv d12DieDiv'>" + featDie + "</div>"));
            }
            // If keeping best or worst, display the secondFeatDie too
            if (keepBest || keepWorst) {
                if (secondFeatDie == 11) {
                    $(resultsDiv).append($("<div class='dieDiv d12DieDiv discarded'><img src='css/g.png' /></div>"));
                } else if (secondFeatDie == 12) {
                    $(resultsDiv).append($("<div class='dieDiv d12DieDiv discarded'><img src='css/s.png' /></div>"));
                } else {
                    $(resultsDiv).append($("<div class='dieDiv d12DieDiv discarded'>" + secondFeatDie + "</div>"));
                }
            }

            // Success dice
            var d;
            for (d in successDice) {
                if (successDice[d] == 6) {
                    $(resultsDiv).append($("<div class='dieDiv d6DieDiv'><img src='css/6.png' /></div>"));
                } else if (weary && successDice[d] <= 3) {
                    $(resultsDiv).append($("<div class='dieDiv d6DieDiv'>" + 0 + "</div>"));
                } else {
                    $(resultsDiv).append($("<div class='dieDiv d6DieDiv'>" + successDice[d] + "</div>"));
                }
            }

            // Modifier
            if (bonus) {
                $(resultsDiv).append($("<span>" + (bonus > 0 ? ("+" + bonus) : bonus) + "</span>"));
            }

            $(resultsDiv).append($("<br /><span id='rollerTotal'></span>"));
            if (featDie != 11) {
                if (tengwar == 0) {
                    $("#rollerTotal").html(_loc_("uiTotal") + ": " + total);
                } else {
                    $("#rollerTotal").html(_loc_("uiTotal") + ": " + total + " + " + tengwar + "<img src='css/6.png' />");
                }
            } else {
                if (tengwar == 0) {
                    $("#rollerTotal").html(_loc_("uiSimpleSuccess"));
                } else if (tengwar == 1) {
                    $("#rollerTotal").html(_loc_("uiSuperiorSuccess"));
                } else if (tengwar >= 2) {
                    $("#rollerTotal").html(_loc_("uiExtraordinarySuccess"));
                }

            }

            // Copy to chat?
            if ($("#chatDiv").attr("on") == "true") {
                var diceRoll = $("#rollerResultsDiv").clone();
                var alias = $("#chatDiv #chatAliasInput").attr("value");
                chatSendMessage($(diceRoll).html(), alias);
            }

        }

        function forumCommentHelper(element) {
            var commentText = $(element).attr("commentText");
            if (commentText) {
                return " [i](" + commentText.replace(/['"]/g, '') + ")[/i]";
            } else {
                return "";
            }
        }

        function renderBBCode() {
            var text = "";
            //Name
            text += "[b]" + _loc_("uiName") + "[/b] " + $("#nameInput").attr("value").replace(/['"]/g, '');
            text += "\n\n";
            // Culture
            text += "[b]" + _loc_("uiCulture") + "[/b] " + _loc_($("#cultureInput .localizable").attr("localizeKey"));
            // Standard
            text += "  [b]" + _loc_("uiStandardofLiving") + "[/b] " + _loc_($("#standardInput .localizable").attr("localizeKey"));
            text += "\n";
            // Blessing
            text += "[b]" + _loc_("uiCulturalblessing") + "[/b] " + _loc_($("#culturalBlessingInput .localizable").attr("localizeKey"));
            text += forumCommentHelper($("#culturalBlessingInput .localizable"));
            text += "\n";
            // Calling
            text += "  [b]" + _loc_("uiCalling") + "[/b] " + _loc_($("#callingInput .localizable").attr("localizeKey"));
            // Shadow Weakness
            text += "  [b]" + _loc_("uiShadowweakness") + "[/b] " + _loc_($("#shadowWeaknessInput .localizable").attr("localizeKey"));
            text += "\n";
            // Specialties
            text += "[b]" + _loc_("uiSpecialties") + "[/b] ";
            var array = [];
            $("#specialtiesInput .localizable").each(function () {
                array.push(_loc_($(this).attr("localizeKey")) + forumCommentHelper($(this)));
            });
            text += array.join(", ");
            text += "\n";
            // Distinctive features
            text += "[b]" + _loc_("uiDistinctivefeatures") + "[/b] ";
            array = [];
            $("#distinctiveFeaturesInput .localizable").each(function () {
                array.push(_loc_($(this).attr("localizeKey")) + forumCommentHelper($(this)));
            });
            text += array.join(", ");
            text += "\n";
            // Attributes
            $(".attributeBox").each(function () {
                text += " [b]" + _loc_($(this).attr("attribute")) + "[/b]: " + parseInt($(this).find("input").attr("value") || "0", 10);
            });
            text += "\n";
            $(".favouredAttributeBox").each(function () {
                text += " [b]" + _loc_($(this).attr("attribute")) + " (" + _loc_("uiFavoured") + ")[/b]: " + parseInt($(this).find("input").attr("value") || "0", 10);
            });

            text += "\n\n";
            //Favoured skills
            var favouredSkills = [];
            $(".skillNameCell.localizable.favoured").each(function () {
                favouredSkills[$(this).attr("localizeKey")] = true;
            });
            // Skill Ranks
            var skillRanks = [];
            $(".skillRankCell .skillRankIcon[filled=true]").each(function () {
                if (!skillRanks[$(this).attr("skill")] || parseInt(skillRanks[$(this).attr("skill")], 10) < parseInt($(this).attr("rank"), 10)) {
                    skillRanks[$(this).attr("skill")] = parseInt($(this).attr("rank"), 10);
                }
            });
            // Common Skills
            text += "[b]" + _loc_("uiCommonSkills") + "[/b]";
            text += "[list]";
            // Skills
            $("#internalData .skillGroups .skillGroup").each(function () {
                text += "[*]";
                $(this).find("div").each(function () {
                    var skill = $(this).html();

                    if (favouredSkills[skill] == true) {
                        text += "[u][b]" + _loc_(skill) + "[/b][/u]: ";
                    } else {
                        text += "[b]" + _loc_(skill) + "[/b]: ";
                    }

                    if (skillRanks[skill]) {
                        text += skillRanks[skill] + " ";
                    } else {
                        text += "0 ";
                    }
                });
                text += "\n";
            });
            text += "[/list]";

            // Weapon Skills
            text += "[b]" + _loc_("uiWeaponSkills") + "[/b]";
            text += "[list]";
            array = [];
            $("#weaponSkillsTable .skillNameCell").each(function (index) {
                var skill = $(this).find(".localizable").attr("localizeKey");
                if (!skill) {
                    return true;
                }
                skill = _loc_(skill);
                text += "[*]";
                var favoured = ($(this).find(".favoured").length > 0);
                if (favoured) {
                    text += "[u][b]" + skill + "[/b][/u]: ";
                } else {
                    text += "[b]" + skill + "[/b]: ";
                }

                var weaponSkillNo = $(this).attr("weaponSkillNo");
                var rankCollection = $("#weaponSkillsTable .skillRankCell[weaponSkillNo=" + weaponSkillNo + "] .skillRankIcon[filled=true]").toEnumerable()
			.Select("$.attr('rank')");
                var highestRank = 0;
                if (rankCollection.Count() > 0) {
                    highestRank = rankCollection.Last();
                }
                text += highestRank;
                /*
                if (!$(this).find(".weaponSkillDamageInput").attr("value") && !$(this).find(".weaponSkillEdgeInput").attr("value") && !$(this).find(".weaponSkillEdgeInput").attr("value") && !$(this).find(".weaponSkillEncInput").attr("value")){
                text += "\n";
                return true;
                }
                text += " [b]"+_loc_("uiWSDamage")+"[/b]: "+ $(this).find(".weaponSkillDamageInput").attr("value");
                text += " [b]"+_loc_("uiWSEdge")+"[/b]: "+ $(this).find(".weaponSkillEdgeInput").attr("value");
                text += " [b]"+_loc_("uiWSInjury")+"[/b]: "+$(this).find(".weaponSkillInjuryInput").attr("value");
                text += " [b]"+_loc_("uiEnc")+"[/b]: "+$(this).find(".weaponSkillEncInput").attr("value");
                */
            });
            text += "[/list]";

            // Rewards
            text += " [b]" + _loc_("uiRewards") + "[/b]: ";
            array = [];
            $(".rewardsContent div .localizable").each(function () {
                if ($(this).attr("localizeKey").replace(/['"]/g, '') == "") {
                    return true;
                }
                array.push(_loc_($(this).attr("localizeKey")) + forumCommentHelper($(this)));
            });
            text += array.join(", ");
            text += "\n";

            // Virtues
            text += "[b]" + _loc_("uiVirtues") + "[/b]: ";
            array = [];
            $(".virtuesContent div .localizable").each(function () {
                if ($(this).attr("localizeKey").replace(/['"]/g, '') == "") {
                    return true;
                }
                array.push(_loc_($(this).attr("localizeKey")) + forumCommentHelper($(this)));
            });
            text += array.join(", ");
            text += "\n";


            // Gear
            text += "[b]" + _loc_("uiGear") + "[/b]";
            text += "[list]";
            $("#weaponGearTable tr").each(function () {
                var name = $(this).find(".weaponGearNameInput").text();
                var damage = $(this).find(".weaponGearDamageInput").val();
                var edge = $(this).find(".weaponGearEdgeInput").val();
                var injury = $(this).find(".weaponGearInjuryInput").val();
                var enc = $(this).find(".weaponGearEncInput").val();
                var carried = ($(this).find(".weaponGearCarriedStatus").attr("on") == "true") ? "" : " (not carried)";
                if (name) {
                    text += "[*]";
                    text += name;
                    text += " [b]" + _loc_("uiWSDamage") + "[/b]: " + damage;
                    text += " [b]" + _loc_("uiWSEdge") + "[/b]: " + edge;
                    text += " [b]" + _loc_("uiWSInjury") + "[/b]: " + injury;
                    text += " [b]" + _loc_("uiEnc") + "[/b]: " + enc;
                    text += carried;
                    text += "\n";
                }
            });


            $(".gearTable tr").each(function (index) {
                var gear = $(this).find(".gearName .localizable").attr("localizeKey") || "";
                if (gear.replace(/['"]/g, '') == "") {
                    return true;
                }
                text += "[*]";
                text += _loc_(gear) + forumCommentHelper($(this).find(".gearName .localizable"));
                text += " [b]" + _loc_("uiEnc") + "[/b]: " + $(this).find(".gearEnc").attr("value");
                text += ($(this).find(".gearCarriedStatus").attr("on") == "true") ? "" : " (not carried)";
                text += "\n";
            });
            text += "[/list]\n";


            // Round stats
            $(".roundStatBox,.subRoundStatBox").each(function (index) {
                text += "[b]" + _loc_("ui" + $(this).attr("stat")) + "[/b]: " + parseInt($(this).find("input").attr("value") || "0", 10) + " ";
                if ($.inArray(index, [4, 9, 11, 13, 15, 17, 19]) != -1) {
                    text += "\n";
                }
            });
            text += "\n";


            // Show window
            $("#forumCodeDiv").show();
            $("#forumCodeDiv .forumCodeDiv").html(text).select().focus();
            $("#forumCodeDiv #forumCodeCloseButton").unbind().click(function () {
                $("#forumCodeDiv").hide();
            });

        }


        function onlineInitialize() {
            $("#onlineDiv").draggable({ "handle": ".header" });
            $("#onlineDiv").show();
            $("#onlineCloseButton").unbind().click(function () {
                $("#onlineDiv").hide();
            });
            $("#onlineListOwnButton").unbind().click(function () {
                var username = $("#serverUsernameInput").attr("value") || "";
                var password = $("#serverPasswordInput").attr("value") || "";
                serverListOwn(username, password);
            });
            $("#onlineListPublicButton").unbind().click(function () {
                serverListPublic();
            });


            $("#onlineSavePrivateButton").unbind().click(function () {
                var username = $("#serverUsernameInput").val() || "";
                var password = $("#serverPasswordInput").val() || "";
                var characterName = $(".characterSheet #nameInput").val().replace(/['"]/g, '') || "???";
                var culture = $(".characterSheet #cultureInput .localizable").attr("localizeKey");
                var calling = $(".characterSheet #callingInput .localizable").attr("localizeKey");
                serverSave(username, password, characterName, culture, calling, 0);
            });
            $("#onlineSavePublicButton").unbind().click(function () {
                var username = $("#serverUsernameInput").attr("value") || "";
                var password = $("#serverPasswordInput").attr("value") || "";
                var characterName = $(".characterSheet #nameInput").attr("value").replace(/['"]/g, '') || "???";
                var culture = $(".characterSheet #cultureInput .localizable").attr("localizeKey");
                var calling = $(".characterSheet #callingInput .localizable").attr("localizeKey");
                serverSave(username, password, characterName, culture, calling, 1);
            });

            $("#onlineOnlineExplanationButton").unbind().click(function () {
                playTutorial(".tutorial[name=online]");
            });

            $("#onlineRegisterButton").unbind().click(registerUser);

            // First time here? Play the tutorial.
            if ($.cookie('onlineTutorial') != "true") {
                playTutorial(".tutorial[name=online]");
                $.cookie('onlineTutorial', "true", { expires: 3650 });
            }

        }

        function registerUser() {
            var userFullName = "";
            do {
                userFullName = prompt(_loc_("uiOnlineRegisterFullNameText"));
            } while (userFullName == "");

            if (userFullName == null) {
                return;
            }
            var username = "";
            do {
                username = prompt(_loc_("uiOnlineRegisterUsernameText"));
            } while (username == "");
            if (username == null) {
                return;
            }
            var password = "";
            do {
                password = prompt(_loc_("uiOnlineRegisterPasswordText"));
            } while (password == "");
            if (password == null) {
                return;
            }
            $("#onlineCharacterListLoadingIndicator").show();
            $.post("/torserver/users/ajax_register",
		{ "username": username, "password": password, "displayName": userFullName },
		function (response, status, xhr) {
		    $("#onlineCharacterListLoadingIndicator").hide();
		    if (status == "error") {
		        alert("Error: " + xhr.status);
		        return;
		    }
		    $("#onlineMessageBox").html(response);
		    localizeUI();
		}
	);
        }

        function serverListOwn(username, password) {
            $("#onlineCharacterListLoadingIndicator").show();
            $.post("/torserver/characters/ajax_list_own",
		{ "username": username, "password": password },
		function (response, status, xhr) {
		    $("#onlineCharacterListLoadingIndicator").hide();
		    if (status == "error") {
		        alert("Error: " + xhr.status);
		        return;
		    }
		    var characters = $.parseHTML(response);
		    $("#onlineCharacterList").empty();
		    var characterTable = $("<table></table>");
		    $("#onlineCharacterList").append(characterTable);
		    $(characters).filter("div").each(function () {
		        var characterName = $(this).attr("name");
		        var user = $(this).attr("user");
		        var isPublic = $(this).attr("public") == "true";
		        var culture = $(this).attr("culture");
		        var calling = $(this).attr("calling");

		        var row = $("<tr></tr>");
		        var cell = $("<td><b>" + characterName + "</b></td>");
		        $(row).append(cell);

		        cell = $("<td>" + __(culture) + "</td>");
		        $(row).append(cell);
		        cell = $("<td>" + __(calling) + "</td>");
		        $(row).append(cell);
		        cell = $("<td>" + _loc_(isPublic ? "uiPublic" : "uiPrivate") + "</td>");
		        $(row).append(cell);
		        cell = $("<td class='actions'><button class='characterLoadButton'>" + _loc_("uiLoadOnlineCharacter") + "</button><button class='characterDeleteButton'>" + _loc_("uiDeleteOnlineCharacter") + "</button></td>");
		        $(row).append(cell);
		        $(row).find(".characterLoadButton").click(function () {
		            serverLoad(username, password, characterName);
		        });
		        $(row).find(".characterDeleteButton").click(function () {
		            if (confirm(_loc_("uiConfirmDeleteOnlineCharacter"))) {
		                serverDelete(username, password, characterName);
		            }
		        });
		        $(characterTable).append(row);
		    });
		    $("#onlineMessageBox").html($(characters).filter("div").length);
		    localize();
		}
	);
        }

        function serverListPublic() {
            $("#onlineCharacterListLoadingIndicator").show();
            $.get("/torserver/characters/ajax_list_public",
		function (response, status, xhr) {
		    $("#onlineCharacterListLoadingIndicator").hide();
		    if (status == "error") {
		        alert("Error: " + xhr.status);
		        return;
		    }
		    var characters = $.parseHTML(response);
		    $("#onlineCharacterList").empty();
		    var characterTable = $("<table></table>");
		    $("#onlineCharacterList").append(characterTable);
		    $(characters).filter("div").each(function () {
		        var characterName = $(this).attr("name");
		        var user = $(this).attr("user");
		        var isPublic = $(this).attr("public") == "true";
		        var culture = $(this).attr("culture");
		        var calling = $(this).attr("calling");
		        var id = $(this).attr("id");

		        var row = $("<tr></tr>");
		        var cell = $("<td><b>" + characterName + "</b></td>");
		        $(row).append(cell);
		        cell = $("<td>" + user + "</td>");
		        $(row).append(cell);
		        cell = $("<td>" + __(culture) + "</td>");
		        $(row).append(cell);
		        cell = $("<td>" + __(calling) + "</td>");
		        $(row).append(cell);
		        cell = $("<td class='actions'><button class='characterLoadButton'>" + _loc_("uiLoadOnlineCharacter") + "</button></td>");
		        $(row).append(cell);
		        $(row).find(".characterLoadButton").click(function () {
		            serverLoadPublic(characterName, id);
		        });
		        $(characterTable).append(row);
		    });
		    $("#onlineMessageBox").html($(characters).filter("div").length);
		    localize();
		}
	);
        }

        function serverSave(username, password, characterName, culture, calling, isPublic) {
            $("#onlineCharacterListLoadingIndicator").show();
            synchLocalCharacterEdition = sheetToObject();
            synchLocalCharacterEdition.edition = (parseInt(synchLocalCharacterEdition.edition, 10) || 0) + 1;
            $("#edition").val(synchLocalCharacterEdition.edition);
            var data = JSON.stringify(synchLocalCharacterEdition);
            $.post("/torserver/characters/ajax_save",
		{ "username": username, "password": password, "characterName": characterName, "culture": culture, "calling": calling, "isPublic": isPublic, "data": data },
		function (response, status, xhr) {
		    $("#onlineCharacterListLoadingIndicator").hide();
		    if (status == "error") {
		        alert("Error: " + xhr.status);
		        return;
		    }
		    serverListOwn(username, password);
		    $("#onlineMessageBox").html(response);
		    localizeUI();
		}
	);
        }

        function serverDelete(username, password, characterName) {
            $("#onlineCharacterListLoadingIndicator").show();
            $.post("/torserver/characters/ajax_delete",
		{ "username": username, "password": password, "characterName": characterName },
		function (response, status, xhr) {
		    $("#onlineCharacterListLoadingIndicator").hide();
		    if (status == "error") {
		        alert("Error: " + xhr.status);
		        return;
		    }
		    serverListOwn(username, password);
		    $("#onlineMessageBox").html(response);
		    localizeUI();
		}
	);
        }

        function serverLoad(username, password, characterName) {
            $("#onlineCharacterListLoadingIndicator").show();
            $.post("/torserver/characters/ajax_get_character",
		{ "username": username, "password": password, "characterName": characterName },
		function (response, status, xhr) {
		    $("#onlineCharacterListLoadingIndicator").hide();
		    if (status == "error") {
		        alert("Error: " + xhr.status);
		        return;
		    }
		    var characterData = response;
		    characterData = characterData.substring(characterData.indexOf("{"), characterData.lastIndexOf("/// Character Data End"));
		    deserializeData(characterData);
		}
	);
            $("#onlineMessageBox").empty();
        }

        var synchLocalCharacterEdition = null;
        var synchRemoteCharacterEdition = null;
        var synchLoading = false;
        var synchUpdating = false;
        function synchLoad() {
            if (synchSaving || synchLoading || synchUpdating) {
                return;
            } else {
                synchLoading = true;
            }
            var username = $("#serverUsernameInput").val() || "";
            var password = $("#serverPasswordInput").val() || "";
            var characterName = $(".characterSheet #nameInput").val().replace(/['"]/g, '') || "???";

            $.post("/torserver/characters/ajax_get_character",
		{ "username": username, "password": password, "characterName": characterName },
		function (response, status, xhr) {
		    if (status == "error") {
		        return;
		    }
		    var characterData = response;
		    characterData = characterData.substring(characterData.indexOf("{"));
		    synchRemoteCharacterEdition = $.parseJSON(characterData);
		    if (!synchLocalCharacterEdition) {
		        return;
		    }
		    if (!synchLocalCharacterEdition.edition || synchLocalCharacterEdition.edition < synchRemoteCharacterEdition.edition) {
		        var message = _loc_("uiRemotelyChanged", synchLocalCharacterEdition.edition, synchRemoteCharacterEdition.edition);
		        showNotification(message, 3000);
		        synchUpdating = true;
		        synchLocalCharacterEdition = synchRemoteCharacterEdition;
		        objectToSheet(synchLocalCharacterEdition);
		        synchUpdating = false;
		    }
		    synchLoading = false;
		}
	);
        }

        var synchSaving = false;
        var pendingChanges = false;
        function synchSave() {
            if (synchSaving || synchLoading) {
                pendingChanges = true;
                return;
            } else if (synchUpdating) {
                return;
            }
            synchSaving = true;

            var username = $("#serverUsernameInput").val() || "";
            var password = $("#serverPasswordInput").val() || "";
            var characterName = $(".characterSheet #nameInput").val().replace(/['"]/g, '') || "???";
            var culture = $(".characterSheet #cultureInput .localizable").attr("localizeKey");
            var calling = $(".characterSheet #callingInput .localizable").attr("localizeKey");
            synchLocalCharacterEdition = sheetToObject();
            synchLocalCharacterEdition.edition = (parseInt(synchLocalCharacterEdition.edition, 10) || 0) + 1;
            $("#edition").val(synchLocalCharacterEdition.edition);
            var data = JSON.stringify(synchLocalCharacterEdition);
            $.post("/torserver/characters/ajax_save",
		{ "username": username, "password": password, "characterName": characterName, "culture": culture, "calling": calling, "isPublic": 0, "data": data },
		function (response, status, xhr) {
		    synchSaving = false;
		    if (status == "error") {
		        alert("Error: " + xhr.status);
		        return;
		    }
		    if (pendingChanges) {
		        pendingChanges = false;
		        synchSave();
		    }
		}
	);
        }

        function performSynch() {
            if ($("#synchedToggleButton").hasClass("discouragedButton")) {
                return;
            }
            if (synchLocalCharacterEdition == null) {
                return;
            }
            synchSave();
        }

        function synchCheckService() {
            if ($("#synchedToggleButton").hasClass("discouragedButton")) {
                return;
            }
            if (synchLocalCharacterEdition == null) {
                $("#synchedToggleButton").addClass("discouragedButton").removeClass("encouragedButton");
                alert("No online character loaded.");
                return;
            }
            synchLoad();
            setTimeout(synchCheckService, 5000);
        }

        function serverLoadPublic(characterName, id) {
            $("#onlineCharacterListLoadingIndicator").show();
            var parameters;
            if (id != undefined) {
                parameters = { "characterId": id };
            } else {
                paramenters = { "characterName": characterName };
            }
            $.post("/torserver/characters/ajax_get_public_character",
		parameters,
		function (response, status, xhr) {
		    $("#onlineCharacterListLoadingIndicator").hide();
		    if (status == "error") {
		        alert("Error: " + xhr.status);
		        return;
		    }
		    var characterData = response;
		    characterData = characterData.substring(characterData.indexOf("{"), characterData.indexOf("/// Character Data End"));
		    var data = $.parseJSON(characterData);
		    objectToSheet(data);
		    synchLocalCharacterEdition = null;
		}
	);
            $("#onlineMessageBox").empty();
        }

        function showNotification(message, duration) {
            var notificationDiv = $("<div class='notification'></div>");
            notificationDiv.html(message);
            notificationDiv.css({ top: $(window).scrollTop() });
            $(document.body).append(notificationDiv);
            setTimeout(function () { notificationDiv.remove(); }, duration);
        }


        function chatInitialize() {
            $("#chatDiv").show();
            $("#chatDiv").draggable({ "handle": "#chatDragHandle" });
            $("#chatDiv").attr("on", "true");
            $("#chatDiv").resizable({
                "minHeight": 100,
                "minWidth": 200
            });

            // Close Button
            $("#chatDiv #chatCloseButton").unbind().click(function () {
                $("#chatDiv").hide();
                //clearTimeout(chatPollTimeout);
                $("#chatDiv").attr("on", "false");
                $("#onlineDiv #chatButton").unbind().click(function () {
                    chatInitialize();
                });
            });

            // Open chat button behaves exactly the same as close when the chat is open
            $("#onlineDiv #chatButton").unbind().click(function () {
                $("#chatDiv").hide();
                //clearTimeout(chatPollTimeout);
                $("#chatDiv").attr("on", "false");
                $("#onlineDiv #chatButton").unbind().click(function () {
                    chatInitialize();
                });
            });


            // Message Input
            $("#chatDiv #chatMessageInput").unbind().keyup(function (event) {
                if (event.keyCode == '13') {
                    event.preventDefault();
                    chatSendMessage($("#chatDiv #chatMessageInput").attr("value"), $("#chatDiv #chatAliasInput").attr("value"));
                    $("#chatDiv #chatMessageInput").attr("value", "");
                }
            });

            //$("#chatContentsDiv").empty();

            chatPollTimeout = setTimeout(chatGetMessages, 5000);
            chatLastIdWas = "?";
        }

        function chatHistoryRecover() {
            if ($("#chatDiv").attr("on") != "true") {
                chatInitialize();
            }
            $("#chatContentsDiv").empty();
            chatLastIdWas = 0;
            chatPollTimeout = setTimeout(chatGetMessages, 500);
        }

        function chatSendMessage(text, alias) {
            var username = $("#serverUsernameInput").attr("value");
            var password = $("#serverPasswordInput").attr("value");
            var sender_name = alias;
            var sent_date = getDateTime();

            $.post("/torserver/messages/ajax_save",
		{ "username": username, "password": password, "text": text, "sender_name": sender_name, "sent_date": sent_date },
		function (response, status, xhr) {
		    if (status == "error") {
		        //alert("Error: "+xhr.status);
		        return;
		    }
		    clearTimeout(chatPollTimeout);
		    chatPollTimeout = setTimeout(chatGetMessages, 1);
		}
	);
        }

        var chatPollTimeout;
        var chatLastIdWas;

        function chatGetMessages() {
            var username = $("#serverUsernameInput").attr("value");
            var password = $("#serverPasswordInput").attr("value");
            var from = chatLastIdWas;
            // Get messages from the server
            $.post("/torserver/messages/ajax_list_from",
		{ "username": username, "password": password, "from": from },
		function (response, status, xhr) {
		    if (status == "error") {
		        alert("Error: " + xhr.status);
		        return;
		    }
		    // All new messages
		    var messages = $.parseHTML(response);
		    // For each one of them, we add them at the end of the chat
		    $(messages).filter("div").each(function () {
		        // In case we have just logged into the chat, chatLastIdWas is going to be "?". That makes the server
		        // send the last message so that we can note down the messageId for the future. But that makes
		        // us show the message that was last sent before we logged it. That is disturbing. So we don't show any
		        // message if our last id was "?".
		        if (chatLastIdWas == "?") {
		            chatLastIdWas = $(this).find("fieldset").attr("messageId");
		            return true;
		        }

		        // In case two concurrent get requests to the server bring the same message, 
		        // we check that the chatLastIdWas is not the same as the message. If it is, we skip.
		        if (chatLastIdWas == $(this).find("fieldset").attr("messageId")) {
		            return true;
		        }
		        chatLastIdWas = $(this).find("fieldset").attr("messageId");
		        var chatContentsDiv = $("#chatContentsDiv");
		        chatContentsDiv.append($(this));
		        // Scroll div to bottom
		        chatContentsDiv.scrollTop(chatContentsDiv[0].scrollHeight);
		    });

		}
	);

            clearTimeout(chatPollTimeout);
            chatPollTimeout = setTimeout(chatGetMessages, 5000);
        }


        function downloadChatHistory() {
            var username = $("#serverUsernameInput").attr("value");
            var password = $("#serverPasswordInput").attr("value");

            // Get messages from the server
            postwith("/torserver/messages/download_history", { username: username, password: password });
        }

        function postwith(to, p) {
            var myForm = document.createElement("form");
            myForm.method = "post";
            myForm.action = to;
            var k;
            for (k in p) {
                var myInput = document.createElement("input");
                myInput.setAttribute("name", k);
                myInput.setAttribute("value", p[k]);
                myForm.appendChild(myInput);
            }
            document.body.appendChild(myForm);
            myForm.submit();
            document.body.removeChild(myForm);
        }

        function getDateTime() {
            var currentDate = new Date();
            var day = currentDate.getDate();
            if (day < 10) {
                day = "0" + day;
            }
            var month = currentDate.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }
            var year = currentDate.getFullYear();
            var hours = currentDate.getHours();
            if (hours < 10) {
                hours = "0" + hours;
            }
            var minutes = currentDate.getMinutes();
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            var seconds = currentDate.getSeconds();
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        }

        function initializeCookieData() {
            // Get data from cookies
            $("#serverUsernameInput").val($.cookie('username') || "");
            $("#serverPasswordInput").val($.cookie('password') || "");
            $("#chatAliasInput").val($.cookie('alias') || "");
            if (eval($.cookie('alternateFont'))) {
                alternateFontToggle();
            }

            // Popups
            var popups = $.cookie('popups');
            if (popups == "buttons") {

            } else if (popups == "tooltips") {
                toggleDescriptions();
            } else if (popups == "nothing") {
                toggleDescriptions();
                toggleDescriptions();
            }

            // What's new button
            var whatsnewButton = $("#changesButton");
            var latest = parseInt(whatsnewButton.attr("latest"), 10) || 0;
            var latestVisited = parseInt($.cookie('latestVisited'), 10) || 0;
            if (latest > latestVisited) {
                whatsnewButton.addClass("highlight");
            }

            // Set up change events to save the data into the cookies
            $("#serverUsernameInput, #serverPasswordInput, #chatAliasInput").on("change", function (event) {
                $.cookie('username', $("#serverUsernameInput").val(), { expires: 3650 });
                $.cookie('password', $("#serverPasswordInput").val(), { expires: 3650 });
                $.cookie('alias', $("#chatAliasInput").val(), { expires: 3650 });
            });
        }

        function playTutorial(tutorialElement, startSlide) {
            var tutorial = $(tutorialElement), slide = startSlide;
            if (slide === undefined) {
                slide = tutorial.find(".slide[name=start]");
            }
            $(".tutorialSlideWindow").remove();
            createSlide(slide);
        }

        function createSlide(slide) {
            var parentTutorial = slide.parents(".tutorial");
            var slideName = slide.attr("name");
            var slideWindow = $("<fieldset class='tutorialSlideWindow' name=" + slideName + "><legend></legend><div class='text'></div><div class='buttons'></div></fieldset>");
            slideWindow.css({ top: "10px", left: "10px" });
            var elements = slide.find(".elements > *");
            // Highlighters
            elements.filter(".highlight").each(function () {
                var target = $($(this).attr("target"));
                target.addClass("tutorialHighlight");
                blinkHighlight();
                var targetPosition = target.offset() || { top: 0, left: 0 };
                var targetWidth = target.width();
                var targetHeight = target.height();
                slideWindow.css({ top: (targetPosition.top + targetHeight) + "px", left: (targetPosition.left + targetWidth) + "px" });
            });
            // Topic
            elements.filter(".topic").each(function () {
                var key = $(this).attr("key");
                var title = _loc_(key);
                var text = _loc_(key);
                slideWindow.find("legend").html(title);
                slideWindow.find(".text").html(text);
            });
            // Buttons
            elements.filter(".button").each(function () {
                var label = _loc_($(this).attr("label"));
                var verb = $(this).attr("verb");
                var classes = $(this).attr("classes");
                var target = $(this).attr("target") || "";
                var triggerOverseer = $(this).attr("triggerOverseer");
                var triggerSelector = $(this).attr("triggerSelector");
                var triggerEvent = $(this).attr("triggerEvent");
                var newButton = $("<button verb='" + verb + "' class='" + classes + "' target='" + target + "'>" + label + "</button>");
                slideWindow.find(".buttons").append(newButton);

                if (triggerOverseer && triggerSelector && triggerEvent) {
                    $(triggerOverseer).one(triggerEvent + ".tutorial", triggerSelector, function () {
                        newButton.trigger("click");
                    });
                    var newTrigger = $("<input type='hidden' class='trigger' overseer='" + triggerOverseer + "' selector='" + triggerSelector + "' event='" + triggerEvent + "'>");
                    slideWindow.find(".buttons").append(newTrigger);
                }
            });
            $(document.body).append(slideWindow);
            slideWindow.draggable({ handle: "legend" });
            slideWindow.find("button.next").focus();

            $(slideWindow).on("click", "button", function (event) {
                var button = $(this);
                var verb = $(this).attr("verb");
                var target = $(this).attr("target") || "";
                if (verb == "closeTutorial") {
                    // Remove highlights
                    $(".tutorialHighlight").removeClass("tutorialHighlight").removeClass("blink");
                    $(".tutorialSlideWindow .trigger").each(function () {
                        var overseer = $(this).attr("overseer");
                        var event = $(this).attr("event");
                        $(overseer).unbind(event + ".tutorial");
                    });
                    $(".tutorialSlideWindow").remove();

                    return;
                }
                if (verb == "jumpToSlide") {
                    // Remove highlights
                    $(".tutorialHighlight").removeClass("tutorialHighlight").removeClass("blink");
                    $(".tutorialSlideWindow .trigger").each(function () {
                        var overseer = $(this).attr("overseer");
                        var event = $(this).attr("event");
                        $(overseer).unbind(event + ".tutorial");
                    });
                    var targetSlide = parentTutorial.find(".slide[name=" + target + "]");
                    $(".tutorialSlideWindow").remove();
                    createSlide(targetSlide);
                    return;
                }
            });
        }
        var blinkerTimeout = null;
        function blinkHighlight() {
            if (blinkerTimeout != null) {
                clearTimeout(blinkerTimeout);
                blinkerTimeout = null;
            }
            var highlighted = $(".tutorialHighlight")
            if (highlighted.length === 0) {
                return;
            }
            highlighted.toggleClass("blink");
            blinkerTimeout = setTimeout(blinkHighlight, 250);
        }

        return mainInitialize;
    });