define(["jquery", "gamedata", "text", "popupMenu"],
    function ($, Gamedata, Text, popupMenu) {

        var PjContextMenuManager = (function () {
            // Private variables (for closure, easier than dealing with this for the 
            var Pj = null;
            var Sheet = null;
            // Constructor            
            function PjContextMenuManager(pj, sheet) {
                Pj = this.pj = pj;
                Sheet = sheet;
            }

            function databind() {
                Sheet.view.bind();
            }

            var nevermindOption = {
                callback: function () { this.menu.close(); },
                cssClass: "nevermind"
            };

            function addCommentMenuOption(context) {
                var currentText = Pj.getComment(context.key);

                if (currentText === undefined) {
                    currentText = "";
                }
                var commentText = prompt("Please insert the comment text", currentText);
                if (commentText !== null) {
                    Pj.setComment(context.key, commentText);
                }
                this.menu.close();
            }

            var showMenu = function (m, e) {
                m.show(e.pageX + 1, e.pageY + 1);
            };

            function commonSkillMenu(e) {
                // showMenu
                e.stopPropagation();
                var menu = $(".contextMenu");
                var sender = $(this);
                var skill = sender.attr("data-skill");

                var m = new popupMenu({
                    container: menu,
                    items: {
                        uiMenuNotFavoured: {
                            callback: function (context) {
                                context.pj.skills.common.favoured[context.skill] = false;
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
                    context: { skill: skill, pj: Pj }
                });

                showMenu(m, e);
            }

            function virtuesMenu(e) {
                if (e.target != this) {
                    return true;
                }
                e.stopPropagation();
                // showMenu
                var menu = $(".contextMenu");
                var sender = $(this);

                // Add virtue options
                var showAddOptionsSubmenu = function (context) {
                    this.menu.close();

                    var virtues = Gamedata.cultures[context.pj.traits.culture].virtues.slice(0); // Copy the array
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
                            var entry = {
                                callback: function (context) {
                                    context.pj.traits.virtues.push(virtue);
                                    this.menu.close();
                                },
                                condition: function (context) {
                                    var current = context.pj.traits.virtues;
                                    return current.indexOf(this.key) == -1;
                                }
                            };
                            entries[virtue] = entry;
                        })();
                    }

                    var m = new popupMenu({
                        container: menu,
                        items: entries,
                        context: { pj: Pj }
                    });
                    showMenu(m, e);
                };

                // Virtue Box Options (Add or Nevermind)	
                var m = new popupMenu({
                    container: menu,
                    items: {
                        uiMenuAdd: showAddOptionsSubmenu,
                        uiMenuNevermind: nevermindOption
                    },
                    context: { pj: Pj }
                });

                showMenu(m, e);
            }

            function oneVirtueRewardMenu(e) {
                e.stopPropagation();
                // showMenu                
                var sender = $(this);

                var m = new popupMenu({
                    container: $(".contextMenu"),
                    items: {
                        uiMenuRemove: function (context) {
                            var index = Pj.traits.virtues.indexOf(context.key);
                            if (index != -1) {
                                Pj.traits.virtues.splice(index, 1);
                            } else {
                                index = Pj.belongings.rewards.indexOf(context.key);
                                if (index != -1) {
                                    Pj.belongings.rewards.splice(index, 1);
                                }
                            }
                            this.menu.close();
                        },
                        uiMenuSetComment: addCommentMenuOption,
                        uiMenuNevermind: nevermindOption
                    },
                    context: { key: sender.attr("data-textKey") }
                })
                .show(e.pageX + 1, e.pageY + 1);
            }

            function rewardsMenu(e) {
                if (e.target != this) {
                    return true;
                }
                e.stopPropagation();

                var sender = $(this);

                // Add rewards options
                var showAddOptionsSubmenu = function (context) {
                    this.menu.close();

                    var rewards = Object.keys(Gamedata.cultures[Pj.traits.culture].rewards);
                    rewards = rewards.concat(Object.keys(Gamedata.qualities));

                    var entries = {
                        uiMenuNevermind: nevermindOption
                    };
                    for (var i = 0; i < rewards.length; i++) {
                        (function () {
                            var reward = rewards[i];
                            var entry = {
                                callback: function (context) {
                                    Pj.belongings.rewards.push(reward);
                                    this.menu.close();
                                },
                                condition: function (context) {
                                    var current = Pj.belongings.rewards;
                                    return current.indexOf(this.key) == -1;
                                }
                            };
                            entries[reward] = entry;
                        })();
                    }

                    var m = new popupMenu({
                        container: $(".contextMenu"),
                        items: entries,
                        context: { pj: Pj }
                    });
                    showMenu(m, e);
                };

                // Virtue Box Options (Add or Nevermind)	
                var m = new popupMenu({
                    container: $(".contextMenu"),
                    items: {
                        uiMenuAdd: showAddOptionsSubmenu,
                        uiMenuNevermind: nevermindOption
                    },
                    context: { pj: Pj }
                })
                .show(e.pageX + 1, e.pageY + 1);
            }

            function weaponSkillMenu(e) {
                var menu = $(".contextMenu");
                var sender = $(this);
                var key = sender.attr("data-textKey");

                var notFavouredOption = {
                    callback: function (context) {
                        Pj.skills.weapon[context.key].favoured = false;
                        this.menu.close();
                    },
                    condition: function (context) {
                        return Pj.skills.weapon[context.key].favoured;
                    }
                };
                var favouredOption = {
                    callback: function (context) {
                        Pj.skills.weapon[context.key].favoured = true;
                        this.menu.close();
                    },
                    condition: function (context) {
                        return !(Pj.skills.weapon[context.key].favoured || (context.key.replace(/[()]/ig, "") in Gamedata.weaponGroups));
                    }
                };

                var selectWeaponSkillOption = function (context) {
                    this.menu.close();

                    var entries = { uiMenuNevermind: nevermindOption };
                    for (var wK in Gamedata.weapons) {
                        (function () { //Block for closure
                            var weaponKey = wK;

                            entries[weaponKey] = {
                                callback: function () {
                                    this.menu.close();

                                    Pj.skills.weapon[weaponKey] = Pj.skills.weapon[key];
                                    delete Pj.skills.weapon[key];
                                    Pj.skills.weapon[weaponKey].id = weaponKey;
                                },
                                condition: function () {
                                    return !(weaponKey in Pj.skills.weapon) && (weaponKey != key);
                                }
                            };

                        })();
                    }

                    var m = new popupMenu({
                        container: menu,
                        items: entries
                    })
                    .show(e.pageX + 1, e.pageY + 1);
                };

                var selectWeaponGroupOption = function (context) {
                    this.menu.close();

                    var entries = { uiMenuNevermind: nevermindOption };
                    for (var wK in Gamedata.weaponGroups) {
                        (function () { //Block for closure
                            var weaponKey = wK;
                            var cultural = Gamedata.weaponGroups[wK].cultural;

                            entries[cultural] = {
                                callback: function () {
                                    this.menu.close();

                                    Pj.skills.weapon[cultural] = Pj.skills.weapon[key];
                                    delete Pj.skills.weapon[key];
                                    Pj.skills.weapon[cultural].id = cultural;
                                    Pj.skills.weapon[cultural].favoured = false;
                                },
                                condition: function () {
                                    return !(cultural in Pj.skills.weapon) && (cultural != key);
                                }
                            };

                        })();
                    }

                    var m = new popupMenu({
                        container: menu,
                        items: entries
                    })
                    .show(e.pageX + 1, e.pageY + 1);
                };

                var removeWeaponSkillOption = {
                    callback: function (context) {
                        this.menu.close();

                        delete Pj.skills.weapon[context.key];
                        databind();
                    },
                    condition: function (context) {
                        return Object.keys(Pj.skills.weapon).length > 1;
                    }
                };

                var addWeaponSkillOption = function (context) {
                    this.menu.close();
                    var newWeaponSkill = { id: "uiATChooseone", rank: 0, favoured: false };

                    Pj.skills.weapon["uiATChooseone"] = newWeaponSkill;
                    databind();
                };

                var m = new popupMenu({
                    context: { key: key },
                    container: menu,
                    items: {
                        uiMenuNotFavoured: notFavouredOption,
                        uiMenuFavoured: favouredOption,
                        uiMenuSelectWSkill: selectWeaponSkillOption,
                        uiMenuSelectWGroup: selectWeaponGroupOption,
                        uiMenuRemove: removeWeaponSkillOption,
                        uiMenuAddRow: addWeaponSkillOption,
                        uiMenuNevermind: nevermindOption
                    }
                })
                .show(e.pageX + 1, e.pageY + 1);
            }

            function weaponGearMenu(e) {
                var menu = $(".contextMenu");
                var sender = $(this);
                var key = sender.attr("data-textKey");

                var selectWeaponGearOption = function (context) {
                    this.menu.close();

                    var entries = { uiMenuNevermind: nevermindOption };
                    for (var wK in Gamedata.weapons) {
                        (function () { //Block for closure
                            var weaponKey = wK;

                            entries[weaponKey] = {
                                callback: function () {
                                    this.menu.close();

                                    Pj.belongings.weaponGear[weaponKey] = Pj.belongings.weaponGear[key];
                                    delete Pj.belongings.weaponGear[key];
                                    Pj.belongings.weaponGear[weaponKey].id = weaponKey;
                                    var normalstats = Gamedata.weapons[weaponKey];
                                    Pj.belongings.weaponGear[weaponKey].stats.enc = normalstats.enc;
                                    Pj.belongings.weaponGear[weaponKey].stats.damage = normalstats.damage;
                                    Pj.belongings.weaponGear[weaponKey].stats.injury = normalstats.injury;
                                    Pj.belongings.weaponGear[weaponKey].stats.edge = normalstats.edge;
                                    Pj.updateEncFatigue();
                                    Pj.updateTotalFatigue();
                                },
                                condition: function () {
                                    return !(weaponKey in Pj.belongings.weaponGear) && (weaponKey != key);
                                }
                            };

                        })();
                    }

                    var m = new popupMenu({
                        container: menu,
                        items: entries
                    })
                    .show(e.pageX + 1, e.pageY + 1);
                };
                var removeWeaponGearOption = {
                    callback: function (context) {
                        this.menu.close();

                        delete Pj.belongings.weaponGear[context.key];
                        databind();
                        Pj.updateEncFatigue();
                        Pj.updateTotalFatigue();
                    },
                    condition: function (context) {
                        return Object.keys(Pj.belongings.weaponGear).length > 1;
                    }
                };
                var addWeaponGearOption = function (context) {
                    this.menu.close();
                    var newWeaponGear = { id: "uiATChooseone", carried: false, stats: { damage: 0, edge: "G", injury: 0, enc: 0} };

                    Pj.belongings.weaponGear["uiATChooseone"] = newWeaponGear;
                    databind();
                };

                var m = new popupMenu({
                    context: { key: key },
                    container: menu,
                    items: {
                        uiMenuSelectWeapon: selectWeaponGearOption,
                        uiMenuRemove: removeWeaponGearOption,
                        uiMenuAddRow: addWeaponGearOption,
                        uiMenuNevermind: nevermindOption
                    }
                })
                .show(e.pageX + 1, e.pageY + 1);
            }

            function gearMenu(e) {
                var menu = $(".contextMenu");
                var sender = $(this);
                var key = sender.attr("data-textKey");

                var selectGearOption = function (context) {
                    this.menu.close();

                    var entries = { uiMenuNevermind: nevermindOption };
                    var gears = {};
                    Object.keys(Gamedata.armour.body).forEach(function (g) {
                        gears[g] = Gamedata.armour.body;
                    });
                    Object.keys(Gamedata.armour.head).forEach(function (g) {
                        gears[g] = Gamedata.armour.head;
                    });
                    Object.keys(Gamedata.armour.shield).forEach(function (g) {
                        gears[g] = Gamedata.armour.shield;
                    });
                    for (var wK in gears) {
                        (function () { //Block for closure
                            var weaponKey = wK;
                            var gearGroup = gears[weaponKey];

                            entries[weaponKey] = {
                                callback: function () {
                                    this.menu.close();

                                    Pj.belongings.gear[weaponKey] = Pj.belongings.gear[key];
                                    delete Pj.belongings.gear[key];
                                    Pj.belongings.gear[weaponKey].id = weaponKey;
                                    var normalstats = gearGroup[weaponKey];
                                    Pj.belongings.gear[weaponKey].enc = normalstats.enc;

                                    Pj.updateEncFatigue();
                                    Pj.updateTotalFatigue();
                                },
                                condition: function () {
                                    return !(weaponKey in Pj.belongings.gear) && (weaponKey != key);
                                }
                            };

                        })();
                    }

                    var m = new popupMenu({
                        container: menu,
                        items: entries
                    })
                    .show(e.pageX + 1, e.pageY + 1);
                };
                var removeGearOption = {
                    callback: function (context) {
                        this.menu.close();

                        delete Pj.belongings.gear[context.key];
                        databind();
                        Pj.updateEncFatigue();
                        Pj.updateTotalFatigue();
                    },
                    condition: function (context) {
                        return Object.keys(Pj.belongings.weaponGear).length > 1;
                    }
                };
                var addGearOption = function (context) {
                    this.menu.close();
                    var newGear = { id: "uiATChooseone", enc: 0 };

                    Pj.belongings.gear["uiATChooseone"] = newGear;
                    databind();
                };


                var m = new popupMenu({
                    context: { key: key },
                    container: menu,
                    items: {
                        uiMenuSelectGear: selectGearOption,
                        uiMenuRemove: removeGearOption,
                        uiMenuAddRow: addGearOption,
                        uiMenuSetComment: addCommentMenuOption,
                        uiMenuNevermind: nevermindOption
                    }
                })
                .show(e.pageX + 1, e.pageY + 1);
            }

            function featuresMenu(e) {
                if (e.target != this) {
                    return true;
                }
                var menu = $(".contextMenu");
                var sender = $(this);

                var addDegenerationOption = function (context) {
                    this.menu.close();

                    var shadowWeakness = Gamedata.cultures[Pj.traits.culture].shadowWeakness;
                    /// TODO
                    Pj.belongings.gear["uiATChooseone"] = newGear;
                    databind();
                };

                var m = new popupMenu({
                    container: menu,
                    items: {
                        uiMenuAddDegeneration: addDegenerationOption,
                        uiMenuNevermind: nevermindOption
                    }
                })
                .show(e.pageX + 1, e.pageY + 1);

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
                var m = new popupMenu({
                    container: menu,
                    items: entries,
                    context: { pj: Pj }
                });
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



            PjContextMenuManager.prototype.commonSkillMenu = commonSkillMenu;
            PjContextMenuManager.prototype.standardOfLivingMenu = standardOfLivingMenu;
            PjContextMenuManager.prototype.virtuesMenu = virtuesMenu;
            PjContextMenuManager.prototype.rewardsMenu = rewardsMenu;
            PjContextMenuManager.prototype.oneVirtueRewardMenu = oneVirtueRewardMenu;
            PjContextMenuManager.prototype.weaponSkillMenu = weaponSkillMenu;
            PjContextMenuManager.prototype.weaponGearMenu = weaponGearMenu;
            PjContextMenuManager.prototype.gearMenu = gearMenu;
            PjContextMenuManager.prototype.featuresMenu = featuresMenu;
            PjContextMenuManager.prototype.changeFeatureMenu = changeFeatureMenu;

            return PjContextMenuManager;
        })();

        return PjContextMenuManager;
    });