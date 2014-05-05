define(["jquery", "gamedata", "text", "popupMenu", "pjsheet"],
    function ($, Gamedata, Text, popupMenu, PjSheet) {

        var nevermindOption = {
            callback: function () { this.menu.close(); },
            cssClass: "nevermind"
        };
        var showMenu = function (m, e) {
            m.show(e.pageX + 1, e.pageY + 1);
        };

        function commonSkillMenu(e) {
            // showMenu
            var menu = $(".contextMenu");
            var sender = $(this);
            var skill = sender.attr("data-skill");

            var m = new popupMenu(menu,
                {
                    uiMenuNotFavoured: {
                        callback: function (context) {
                            pj.skills.common.favoured[context.skill] = false;
                            this.menu.close();
                        },
                        condition: function (context) { return context.pj.skills.common.favoured[context.skill]; }
                    },
                    uiMenuFavoured: {
                        callback: function (context) {
                            context.pj.skills.common.favoured[context.skill] = true;
                            this.menu.close();
                        },
                        condition: function (context) { return !(context.pj.skills.common.favoured[context.skill]); }
                    },
                    uiMenuNevermind: nevermindOption
                },
                { skill: skill, pj: PjSheet.pj });

            showMenu(m, e);
        }

        
        function virtuesMenu(e) {
            if (e.target != this) {
                return true;
            }
            // showMenu
            var menu = $(".contextMenu");
            var sender = $(this);

            // Add virtue	
            var m = new popupMenu(menu,
            {
                uiMenuAdd: function (context) {
                    this.menu.close();

                    var virtues = Gamedata.cultures[context.pj.traits.culture].virtues;
                    var current = context.pj.traits.virtues;
                    var masteries = Gamedata.masteries;
                    for (var m in masteries) {
                        virtues.push(m);
                    }
                    var entries = {
                        uiMenuNevermind: nevermindOption
                    };
                    for (var i = 0; i < virtues.length; i++) {
                        (function () {
                            var virtue = virtues[i];
                            var entry = function (context) {
                                context.pj.traits.virtues.push(virtue);
                                this.menu.close();
                            };
                            entries[virtue] = entry;
                        })();
                    }
                    for (var i = 0; i < current.length; i++) {
                        delete entries[current[i]];
                    }
                    var m = new popupMenu(menu,
                    entries,
                    { pj: PjSheet.pj });
                    showMenu(m, e);
                },
                uiMenuNevermind: nevermindOption
            },
            { pj: PjSheet.pj });

            showMenu(m, e);
        }

        function oneVirtueRewardMenu(e) {
            // showMenu
            var menu = $(".contextMenu");
            $(menu).empty();
            var sender = $(this);

            // remove virtue	
            var button = $("<div class='action'>" + _loc_("uiMenuRemove") + "</div>").click(function () {
                closeContextMenu();
                $(sender).remove();
                performSynch();
            });
            $(menu).append(button);

            // Add comment
            addCommentMenuOption(sender);

            // nevermind button
            menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

            localize();
            showContextMenu(e);
        }

        function rewardsMenu(e) {
            if (e.target != this) {
                return true;
            }
            // showMenu
            var menu = $(".contextMenu");
            $(menu).empty();
            var sender = $(this);

            // Add reward	
            var button = $("<div class='action'>" + _loc_("uiMenuAdd") + "</div>").click(function () {
                closeContextMenu();
                menu.empty();
                // get culture
                var culture = $("#cultureInput .localizable").attr("localizeKey");
                // get current rewards
                var currentRewards = [];
                $(".rewardsContent div .localizable").each(function () {
                    currentRewards[$(this).attr("localizeKey")] = true;
                });
                // get general rewarsd that aren't current
                var rewards = [];
                $("#internalData .quality").each(function () {
                    if (currentRewards[$(this).attr("name")] != true) {
                        rewards.push($(this).attr("name"));
                    }
                });
                // get culture rewards that aren't current
                $("#internalData .culture[name=" + culture + "] .rewards .reward").each(function () {
                    if (currentRewards[$(this).attr("name")] != true) {
                        rewards.push($(this).attr("name"));
                    }
                });

                // make the buttons
                for (v in rewards) {
                    var rewardName = rewards[v];
                    var button = $("<div class='action'>" + __(rewardName) + "</div>");
                    $(button).click({ n: rewardName }, function (ea) {
                        closeContextMenu();
                        // add the reward
                        $(".rewardsContent > div").append(__(ea.data.n) + ", ");
                        localize();
                        performSynch();
                    });
                    menu.append(button);
                }
                // nevermind button
                menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

                localize();
                showContextMenu(e);
            });
            $(menu).append(button);

            // nevermind button
            menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

            localize();
            showContextMenu(e);
        }

        function weaponSkillMenu(e) {
            // showMenu
            var menu = $(".contextMenu");
            $(menu).empty();
            var sender = $(this);

            // favoured
            if (sender.hasClass("favoured")) {
                var button = $("<div class='action'>" + _loc_("uiMenuNotFavoured") + "</div>").click(function () {
                    sender.removeClass("favoured");
                    closeContextMenu();
                    performSynch();
                });
                $(menu).append(button);
            }
            if (!sender.hasClass("favoured")) {
                var button = $("<div class='action'>" + _loc_("uiMenuFavoured") + "</div>").click(function () {
                    sender.addClass("favoured");
                    closeContextMenu();
                    performSynch();
                });
                $(menu).append(button);
            }

            // Select weapon skill
            var button = $("<div class='action'>" + _loc_("uiMenuSelectWSkill") + "</div>").click(function () {
                closeContextMenu();
                $(menu).empty();

                // get all weapons
                $("#internalData .weapons .weapon").each(function () {
                    var wsId = $(this).attr("name");

                    var button = $("<div class='action'>" + __(wsId) + "</div>");

                    // Add the skill and the other stats
                    $(button).click({ id: wsId }, function (ed) {
                        closeContextMenu();
                        // get the skill cell
                        var row = sender.parents(".skillNameCell");
                        // set the name
                        $(row).find(".weaponSkillNameInput").empty().append(__(ed.data.id));
                        localize();
                        performSynch();
                    });
                    $(menu).append(button);
                });

                // nevermind button
                menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

                localize();
                showContextMenu(e);
            });
            $(menu).append(button);

            // Select cultural weapon skill
            button = $("<div class='action'>" + _loc_("uiMenuSelectWGroup") + "</div>").click(function () {
                closeContextMenu();
                $(menu).empty();

                // get all weapons groups
                $("#internalData .weaponGroups .weaponGroup").each(function () {
                    var wsId = $(this).attr("name");
                    var wsCulturalId = $(this).attr("cultural");

                    var button = $("<div class='action'>" + __(wsCulturalId) + "</div>");

                    // Add the skill and the other stats
                    $(button).click({ id: wsId, cultural: wsCulturalId }, function (ed) {
                        closeContextMenu();

                        // get the parent row
                        var row = sender.parents("#weaponSkillsTable .skillNameCell");
                        // set the name
                        $(row).find(".weaponSkillNameInput").empty().append(__(ed.data.cultural));
                        localize();
                        performSynch();
                    });
                    $(menu).append(button);
                });


                // nevermind button
                menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

                localize();
                showContextMenu(e);

            });
            $(menu).append(button);

            // Remove weapon skill	
            button = $("<div class='action'>" + _loc_("uiMenuRemove") + "</div>").click(function () {
                closeContextMenu();
                var namecell = sender.parents("#weaponSkillsTable .skillNameCell");
                var row = namecell.parents("#weaponSkillsTable tr");
                var weaponSkillNo = namecell.attr("weaponskillno");
                // empty skill cells
                $(namecell).find(".input").empty();
                $(row).find(".skillRankCell[weaponskillno=" + weaponSkillNo + "] .skillRankIcon").attr("filled", "false");
                iconImageUpdate();
                performSynch();
            });
            $(menu).append(button);


            // Add row
            button = $("<div class='action'>" + _loc_("uiMenuAddRow") + "</div>").click(function () {
                closeContextMenu();
                var row = sender.parents("#weaponSkillsTable tr");
                var table = sender.parents("#weaponSkillsTable");
                var newRow = $(row).clone();
                $(newRow).find(".weaponSkillNameInput").empty();
                $(newRow).find(".skillRankIcon").attr("filled", "false");
                $(table).append(newRow);
                renumberWeaponSlots();
                performSynch();
                iconImageUpdate();
            });
            $(menu).append(button);

            // Remove row - only if at least 3 rows left
            if ($("#weaponSkillsTable tr").length > 2) {
                button = $("<div class='action'>" + _loc_("uiMenuRemoveRow") + "</div>").click(function () {
                    closeContextMenu();
                    var row = sender.parents("#weaponSkillsTable tr");
                    $(row).remove();
                    renumberWeaponSlots();
                    performSynch();
                });
                $(menu).append(button);
            }


            // nevermind button
            menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

            localize();
            showContextMenu(e);
        }

        function weaponGearMenu(e) {
            // showMenu
            var menu = $(".contextMenu");
            $(menu).empty();
            var sender = $(this);

            // Select weapon 
            var button = $("<div class='action'>" + _loc_("uiMenuSelectWeapon") + "</div>").click(function () {
                closeContextMenu();
                $(menu).empty();

                // get all weapons
                $("#internalData .weapons .weapon").each(function () {
                    var wsId = $(this).attr("name");
                    var wsDamage = $(this).attr("damage");
                    var wsEdge = $(this).attr("edge");
                    var wsInjury = $(this).attr("injury");
                    var wsEnc = $(this).attr("enc");

                    var button = $("<div class='action'>" + __(wsId) + "</div>");

                    // Add the skill and the other stats
                    $(button).click({ id: wsId, damage: wsDamage, edge: wsEdge, injury: wsInjury, enc: wsEnc }, function (ed) {
                        closeContextMenu();

                        // get the parent row
                        var row = sender.parents("#weaponGearTable tr");
                        // set the name
                        $(row).find(".weaponGearNameInput").empty().append(__(ed.data.id));
                        // set the damage
                        $(row).find(".weaponGearDamageInput").val(ed.data.damage);
                        // set the edge
                        $(row).find(".weaponGearEdgeInput").val(ed.data.edge);
                        // set the injury
                        $(row).find(".weaponGearInjuryInput").val(ed.data.injury);
                        // set the enc
                        $(row).find(".weaponGearEncInput").val(ed.data.enc);
                        localize();
                        computeFatigue();
                    });
                    $(menu).append(button);
                });

                // nevermind button
                menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

                localize();
                showContextMenu(e);
            });
            $(menu).append(button);

            // Add row
            button = $("<div class='action'>" + _loc_("uiMenuAddRow") + "</div>").click(function () {
                closeContextMenu();
                var row = sender.parents("#weaponGearTable tr");
                var table = sender.parents("#weaponGearTable");
                var newRow = $(row).clone();
                $(newRow).find(".weaponGearNameInput").empty();
                $(newRow).find(".weaponGearDamageInput").val("");
                $(newRow).find(".weaponGearEdgeInput").val("");
                $(newRow).find(".weaponGearInjuryInput").val("");
                $(newRow).find(".weaponGearEncInput").val("");
                $(table).append(newRow);
                renumberWeaponSlots();
                performSynch();
            });
            $(menu).append(button);

            // Remove row - only if at least 2 rows left 
            if ($("#weaponGearTable tr").length >= 2) {
                button = $("<div class='action'>" + _loc_("uiMenuRemoveRow") + "</div>").click(function () {
                    closeContextMenu();
                    var row = sender.parents("#weaponGearTable tr");
                    $(row).remove();
                    renumberWeaponSlots();
                    performSynch();
                });
                $(menu).append(button);
            }

            // nevermind button
            menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

            localize();
            showContextMenu(e);
        }

        function gearMenu(e) {
            // showMenu
            var menu = $(".contextMenu");
            $(menu).empty();
            var sender = $(this);

            // Select gear
            button = $("<div class='action'>" + _loc_("uiMenuSelectGear") + "</div>").click(function () {
                closeContextMenu();
                $(menu).empty();

                // Get all gear or only the one specific to the special row we are.
                var filteredGear;
                if (sender.parents(".gearTable tr").index() == 0) {
                    // Only armour
                    filteredGear = $("#internalData .armours .armour[type!=headgear]");
                } else if (sender.parents(".gearTable tr").index() == 1) {
                    // Only headgear
                    filteredGear = $("#internalData .armours .armour[type=headgear]");
                } else if (sender.parents(".gearTable tr").index() == 2) {
                    // Only Shields
                    filteredGear = $("#internalData .shields .shield");
                } else {
                    // All kind of gear
                    filteredGear = $("#internalData .shields .shield, #internalData .armours .armour");
                }
                $(filteredGear).each(function () {
                    var gId = $(this).attr("name");
                    var gClass = $(this).attr("class");
                    var gEnc = $(this).attr("enc");

                    var button = $("<div class='action'>" + __(gId) + "</div>");

                    // Add the gear and the other stats
                    $(button).click({ id: gId, type: gClass, enc: gEnc }, function (ed) {
                        closeContextMenu();

                        // get the parent row
                        var row = sender.parents(".gearTable tr");
                        // set the name
                        $(row).find(".gearName").empty().append(__(ed.data.id));
                        // set the enc
                        $(row).find(".gearEnc").attr("value", ed.data.enc);
                        localize();
                        computeFatigue();
                        computeArmours();
                    });
                    $(menu).append(button);
                });



                // nevermind button
                menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

                localize();
                showContextMenu(e);

            });
            $(menu).append(button);

            // Remove gear	
            button = $("<div class='action'>" + _loc_("uiMenuRemove") + "</div>").click(function () {
                closeContextMenu();
                var row = sender.parents(".gearTable tr");
                // empty row
                $(row).find(".gearName").empty();
                $(row).find(".gearEnc").attr("value", "");
                computeFatigue();
                computeArmours();
            });
            $(menu).append(button);

            // Add row
            button = $("<div class='action'>" + _loc_("uiMenuAddRow") + "</div>").click(function () {
                closeContextMenu();
                var row = sender.parents(".gearTable tr");
                var table = sender.parents(".gearTable");
                var newRow = $(row).clone();
                $(newRow).find(".gearName").empty();
                $(newRow).find(".gearEnc").attr("value", "");
                $(newRow).find("td").each(function () {
                    if ($(this).index() == 0) {
                        $(this).empty();
                    }
                });
                $(table).append(newRow);
                performSynch();
            });
            $(menu).append(button);

            // Remove row - only if at least 5 rows left and it isn't one of the first 3
            if ($(".gearTable tr").length > 4 && sender.parents(".gearTable tr").index() > 2) {
                button = $("<div class='action'>" + _loc_("uiMenuRemoveRow") + "</div>").click(function () {
                    closeContextMenu();
                    var row = sender.parents(".gearTable tr");
                    $(row).remove();
                    computeFatigue();
                    computeArmours();
                });
                $(menu).append(button);
            }

            // Add comment option
            button = $("<div class='action'>" + _loc_("uiMenuSetComment") + "</div>").click(function () {
                closeContextMenu();
                var currentText = $(sender).find(".localizable").attr("commentText");
                if (currentText == undefined) {
                    currentText = "";
                }
                var commentText = prompt(_loc_("uiSetCommentText"), currentText);
                $(sender).find(".localizable").attr("commentText", commentText);

                localizeOne($(sender).find(".localizable"));
                performSynch();
            });
            $(menu).append(button);



            // nevermind button
            menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

            localize();
            showContextMenu(e);
        }

        function featuresMenu(e) {
            if (e.target != this) {
                return true;
            }
            // showMenu
            var menu = $(".contextMenu");
            $(menu).empty();
            var sender = $(this);

            // Add degeneration	
            var button = $("<div class='action'>" + _loc_("uiMenuAddDegeneration") + "</div>").click(function () {
                closeContextMenu();
                menu.empty();
                // get shadow weakness
                var shadowWeakness = $("#shadowWeaknessInput .localizable").attr("localizeKey");
                // get current features
                var current = [];
                $("#distinctiveFeaturesInput .localizable").each(function () {
                    current[$(this).attr("localizeKey")] = true;
                });

                // get degenerations that aren't current and belong to the right shadow weakness
                var degenerations = [];
                $("#internalData .degeneration").each(function () {
                    if (current[$(this).attr("name")] != true && $(this).attr("group") == shadowWeakness) {
                        // if we find one, we add it and stop
                        degenerations.push($(this).attr("name"));
                        return false;
                    }
                });
                // if there are none left, alert and stop
                if (degenerations.length == 0) {
                    alert(_loc_("uiErrorNoMoreDeg"));
                    return;
                }

                // make the buttons
                for (v in degenerations) {
                    var degenerationName = degenerations[v];
                    var button = $("<div class='action'>" + __(degenerationName) + "</div>");
                    $(button).click({ n: degenerationName }, function (ea) {
                        closeContextMenu();
                        // add the degeneration
                        $("#distinctiveFeaturesInput").append(__(ea.data.n) + ", ");
                        localize();
                        performSynch();
                    });
                    menu.append(button);
                }
                // nevermind button
                menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

                localize();
                showContextMenu(e);
            });
            $(menu).append(button);

            // nevermind button
            menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

            localize();
            showContextMenu(e);
        }

        function changeFeatureMenu(e) {
            // showMenu
            var menu = $(".contextMenu");
            $(menu).empty();
            var sender = $(this);

            // Exchange Feature (only for non-degenerations)
            var thisFeatureKey = $(sender).attr("localizeKey");
            if (!$("#internalData .degeneration").toEnumerable().Select('$.attr("name")').Contains(thisFeatureKey)) {
                // get current features
                var currentFeatureKeys = $("#distinctiveFeaturesInput .localizable").toEnumerable()
			.Select('$.attr("localizeKey")')
			.ToArray();
                // get features that aren't selected already. Order by their translation string
                var nonCurrentFeatureKeys = $("#internalData .cultures .culture .backgrounds .background .distinctiveFeatures div").toEnumerable()
			.Select("$.html()")
			.Distinct()
			.Except(currentFeatureKeys)
			.OrderBy("_loc_($)")
			.ToArray();

                var button = $("<div class='action'>" + _loc_("uiMenuExchangeFeature") + "</div>").click(function () {
                    closeContextMenu();
                    menu.empty();
                    // make the buttons
                    for (v in nonCurrentFeatureKeys) {
                        var featureName = nonCurrentFeatureKeys[v];
                        var featureButton = $("<div class='action'>" + __(featureName) + "</div>");
                        $(featureButton).click({ n: featureName }, function (ea) {
                            closeContextMenu();
                            // replace the feature
                            $(sender).replaceWith(__(ea.data.n));
                            localize();
                            performSynch();
                        });
                        menu.append(featureButton);
                    }
                    // nevermind button
                    menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

                    localize();
                    showContextMenu(e);
                });
                menu.append(button);
            };
            // Add comment
            addCommentMenuOption(sender);

            // nevermind button
            menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

            localize();
            showContextMenu(e);
        }

        function addCommentMenuOption(sender) {
            var menu = $(".contextMenu");
            var button = $("<div class='action'>" + _loc_("uiMenuSetComment") + "</div>").click(function () {
                closeContextMenu();
                var currentText = $(sender).attr("commentText");
                if (currentText == undefined) {
                    currentText = "";
                }
                var commentText = prompt("Please insert the comment text", currentText);
                $(sender).attr("commentText", commentText);

                localizeOne($(sender));
                performSynch();
            });
            $(menu).append(button);

        }

        function standardOfLivingMenu(e) {
            // showMenu
            var menu = $(".contextMenu");
            var sender = $(this);

            // Select standard of living
            var entries = {}
            for (var s in Gamedata.standardsOfLiving) {
                (function () { // Just a block for the closure

                    var entry = {};
                    var standard = s;
                    entry.condition = function (context) {
                        return context.pj.stats.standard != standard;
                    };
                    entry.callback = function (context) {
                        context.pj.stats.standard = standard;
                        this.menu.close();
                    };
                    entries[s] = entry;

                })();
            }
            entries.uiMenuNevermind = nevermindOption;
            var m = new popupMenu(menu,
            entries,
            { pj: PjSheet.pj });
            showMenu(m, e);
        }

        function simpleCommentMenu(e) {
            // showMenu
            var menu = $(".contextMenu");
            $(menu).empty();
            var sender = $(this);

            // Add comment
            addCommentMenuOption(sender);

            // nevermind button
            menu.append($("<div class='action'><b>" + _loc_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

            localize();
            showContextMenu(e);
        }

        return {
            commonSkillMenu: commonSkillMenu,
            standardOfLivingMenu: standardOfLivingMenu,
            virtuesMenu: virtuesMenu
        };
    });