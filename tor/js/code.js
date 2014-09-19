/// <reference path="jquery-1.7.min.js" />
/// <reference path="jquery.linq.min.js" />

// Main function
$(function () {
    initializeInternalData();
});

function mainInitialize() {

    fillSkillTable();
    fillWeaponSkillTable();
    fillWeaponGearTable();
    fillGearTable();
	fillInventoryTable();
    fillTaleOfYearsTable();
    setClickablesEvents();
    updateCharacterSheetAfterInputs();
    iconImageUpdate();
    localize();
    tooltipShow();
    initializeRoller();
    localizeUI();

    initializeCookieData();
}

// Localization and tooltips 
var localeDict = {};
function initializeLocale() {
    var language = window.navigator.userLanguage || window.navigator.language;
    // spanish
    var localeFile;
    if (language.indexOf("es") != -1) {
        localeFile = "localization-es.html";
        $(".logoContainer img").attr("src", "css/TorLogoEs.jpg");
    } else {
        localeFile = "localization-en.html";
    }
    $.get(localeFile, {}, function(response){
		var responseElements = $(response);
		$(responseElements).find("div").each(function(){
			var name = $(this).attr("name");
			var fullname = $(this).attr("fullname");
			var contents = $(this).html();			
			localeDict[name] = {fullname: fullname, contents: contents};
		});
		mainInitialize();
	});
	
    $(".characterSheet, .actionMenu, #rollerDiv").show();
}

function initializeInternalData() {
    $("#internalDataContainer").load("internalData.html #internalData", initializeLocale);
}

function localize() {
    $(".localizable").each(function () {
        localizeOne($(this));
    });
}

function localizeOne(element) {
    var localizeKey = $(element).attr('localizeKey');
    if (localizeKey == undefined) {
        localizeKey = $(element).html();
        $(element).attr('localizeKey', localizeKey);
    }
    
    var locale = localeDict[localizeKey];
    if (!locale) {
        return;
    }
    // We get the full name 
    var fullName = locale.fullname;
    // If there is a commentText, we get it;
    var commentText = $(element).attr("commentText");
    if (!commentText) {
        commentText = "";
    } else {
        commentText = " <span class='commentText'>(" + commentText + ")</span>";
    }

    $(element).html(fullName + commentText);
}

var tooltipTimeout = null;
function tooltipShow() {
    var tooltip = $("#tooltipDiv");
    $(document.body).on("mouseenter mouseout", ".localizable", function (event) {
        if ($("#descriptionsToggleButton").hasClass("popupNothing")) {
            tooltip.hide();
            return;
        }
        if ($("#descriptionsToggleButton").hasClass("popupButtons")) {
            handlePopupButtons($(this), event);
            return;
        } if ($("#descriptionsToggleButton").hasClass("popupTooltips")) {
            handlePopupTooltips($(this), event);
            return;
        }

    });
    $("#tooltipDiv").on("mouseenter mouseout", ".helpButton", function (event) {
        // Clear tooltip timeout
        if (tooltipTimeout != null) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
        }
        if (event.type == "mouseenter") {

        }
        if (event.type == "mouseout") {
            tooltipTimeout = setTimeout(hideTooltip, 1000);
        }
    });
}

function handlePopupButtons(sender, event) {
    var tooltip = $("#tooltipDiv");
    // Clear tooltip timeout
    if (tooltipTimeout != null) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
    }

    var localizeKey = sender.attr('localizeKey');
    if (event.type == "mouseenter") {
        // We show the tooltip		
        var helpButton = $("<div class='floating helpButton' helptopic='" + localizeKey + "'>?</div>");
        tooltip.empty();
        tooltip.append(helpButton);		

        var position = sender.offset();
        tooltip.css("top", position.top).css("left", position.left + sender.width());
        tooltip.show();

    }
    if (event.type == "mouseout") {
        // Start tooltip timeout
        tooltipTimeout = setTimeout(hideTooltip, 1000);
    }
}

function handlePopupTooltips(sender, event) {
    var tooltip = $("#tooltipDiv");
    if (event.type == "mouseenter") {
        var localizeKey = sender.attr('localizeKey');
        // We get the localization for the element

        var locale = localeDict[localizeKey];
        if (!locale) {
            return;
        }
        // We get the full name and description
        var fullName = locale.fullname;
        var description = locale.contents;
        // We show the tooltip			
        tooltip.html("<b>" + fullName + "</b><br />" + description);
		localizeUI(tooltip);
        // if it's too high, we make it wider instead.
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var margin = 20;
        var position = tooltip.offset();
        // Overflowing to the right? Put it in the other side
        if (event.pageX + tooltip.width() + margin > windowWidth) {
            position.left = event.pageX - margin * 2 - tooltip.width();
        } else {
            position.left = event.pageX + margin;
        }
        // We place it so that the mouse is halfway down to it.			
        position.top = event.pageY - (tooltip.height() / 2);

        // Overflowing to the top? Put it at the top			
        if (position.top < 0) {
            position.top = 0;
        }
        // Overflowing to the left? Put it at the left			
        if (position.left < 0) {
            position.left = 0;
        }

        // Overflowing to the bottom? Put it at the bottom
        if (position.top + $(tooltip).height() > windowHeight) {
            position.top = windowHeight - $(tooltip).height() - margin * 2;
        }
        tooltip.css("top", position.top).css("left", position.left);

        tooltip.show();
    } else {
        tooltip.hide();
    }

}

function hideTooltip() {
    $("#tooltipDiv").hide();
}

// Character Sheet building functions
function fillSkillTable() {
    var skillTable = $(".skillTable");
    $("#internalData .skillGroups .skillGroup").each(function () {
        var skillGroup = $(this);
        var skillGroupName = $(this).attr("name");
        var bodySkill = skillGroup.find("div[attribute=body]");
        var heartSkill = skillGroup.find("div[attribute=heart]");
        var witsSkill = skillGroup.find("div[attribute=wits]");
        var bodySkillName = $(bodySkill).html();
        var heartSkillName = $(heartSkill).html();
        var witsSkillName = $(witsSkill).html();
        var newTr = $("<tr></tr>");
        // Body skill
        var td = $("<td></td>");
        td.attr("class", bodySkillName + "Skill skillNameCell localizable");
        td.attr("skill", bodySkillName);
        td.html(bodySkillName);
        newTr.append(td);
        td = $("<td></td>");
        td.attr("class", bodySkillName + "Skill skillRankCell");
        td.attr("skill", bodySkillName);
        newTr.append(td);
        // Heart skill
        td = $("<td></td>");
        td.attr("class", heartSkillName + "Skill skillNameCell  localizable");
        td.attr("skill", heartSkillName);
        td.html(heartSkillName);
        newTr.append(td);
        td = $("<td></td>");
        td.attr("class", heartSkillName + "Skill skillRankCell");
        td.attr("skill", heartSkillName);
        newTr.append(td);
        // Wits skill
        td = $("<td></td>");
        td.attr("class", witsSkillName + "Skill skillNameCell  localizable");
        td.attr("skill", witsSkillName);
        td.html(witsSkillName);
        newTr.append(td);
        td = $("<td></td>");
        td.attr("class", witsSkillName + "Skill skillRankCell");
        td.attr("skill", witsSkillName);
        newTr.append(td);
        // Skill group
        td = $("<td></td>");
        td.attr("class", skillGroupName + "SkillGroup skillGroupNameCell  localizable");
        td.attr("skillGroup", skillGroupName);
        td.html(skillGroupName);
        newTr.append(td);
        td = $("<td></td>");
        td.attr("class", skillGroupName + "SkillGroup skillGroupAdvancementCell");
        td.attr("skillGroup", skillGroupName);
        newTr.append(td);

        $(skillTable).append(newTr);
    });

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
	$("#inventoryTable td").each(function(index){
		$(this).attr("slotNo", index+1);
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

var backupOfCurrentSheet = null;
function setClickablesEvents() {
    // moveable action menu
    $(".actionMenu").draggable();

    // resizable Character Sheet
    $(".characterSheet").resizable({
        "maxWidth": 620,
        "minHeight": 840,
        "minWidth": 620,
        "handles": "s"
    });

    // Wizard windows	
    $(".wizardWindow:not(.noDraggable)").draggable();

    // set up start button
    $("#startButton").click(function (e) {
        backupOfCurrentSheet = sheetToObject();
        resetCreation();
        initializeCultureSelection();
        $("#wizardCultureDiv").show();
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

    // synched toggle button
    $("#synchedToggleButton").click(function (e) {
        if ($("#synchedToggleButton").hasClass("discouragedButton")) {
            $("#synchedToggleButton").removeClass("discouragedButton");
            $("#synchedToggleButton").addClass("encouragedButton");
            synchCheckService();
        } else {
            $("#synchedToggleButton").addClass("discouragedButton");
            $("#synchedToggleButton").removeClass("encouragedButton");
        }
    });


    // set up save button
    $("#saveButton").click(function (e) {
        serializeCharacter();
    });
    // set up load button
    $("#loadButton").click(function (e) {
        deserializeCharacter();
    });

    // Forum code button
    $("#forumCodeButton").click(function (e) {
        renderBBCode();
    });

    // Online button
    $("#onlineButton").click(function (e) {
        onlineInitialize();
    });

    // Chat button
    $("#chatButton").click(function (e) {
        chatInitialize();
    });

    // Chat History button
    $("#chatHistoryButton").click(function (e) {
        chatHistoryRecover();
    });

    // Download Chat History button
    $("#downloadChatHistoryButton").click(function (e) {
        downloadChatHistory();
    });

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

    // Skill ranks
    $(".skillRankIcon").live("click", function (e) {
        if ($(this).attr("filled") != "true") {
            $(this).attr("filled", "true");
        } else {
            $(this).attr("filled", "false");
        }
        // Update Siblings
        var thisRank = parseInt($(this).attr("rank"), 10);
        $(this).siblings().each(function () {
            var siblingRank = parseInt($(this).attr("rank"), 10);
            if (siblingRank < thisRank) {
                $(this).attr("filled", "true");
            } else {
                $(this).attr("filled", "false");
            }
        });
        iconImageUpdate();
        performSynch();
    });
    // Skillgroups ranks
    $(".skillGroupIcon").click(function (e) {
        if ($(this).attr("filled") != "true") {
            $(this).attr("filled", "true");
        } else {
            $(this).attr("filled", "false");
        }
        // Update Siblings
        var thisRank = parseInt($(this).attr("rank"), 10);
        $(this).siblings().each(function () {
            var siblingRank = parseInt($(this).attr("rank"), 10);
            if (siblingRank < thisRank) {
                $(this).attr("filled", "true");
            } else {
                $(this).attr("filled", "false");
            }
        });
        iconImageUpdate();
        performSynch();
    });
    // Status boxes
    $(".characterSheet").on("click", ".statusBox", function (e) {
        if ($(this).attr("on") != "true") {
            $(this).attr("on", "true");
        } else {
            $(this).attr("on", "false");
        }
        iconImageUpdate();
        // If they are weapon gear or gear carried statuses, recompute Fatigue.
        if ($(this).hasClass("weaponGearCarriedStatus") || $(this).hasClass("gearCarriedStatus")) {
            computeFatigue();
        }

        performSynch();
    });

    // Common Skill names
    $(".skillNameCell.localizable").live("click", commonSkillMenu);

    // Virtues box
    $(".virtuesContent > div").live("click", virtuesMenu);

    // Rewards box
    $(".rewardsContent > div").live("click", rewardsMenu);

    // Virtues and Rewards themselves
    $(".virtuesContent > div .localizable, .rewardsContent > div .localizable").live("click", oneVirtueRewardMenu);

    // Weapon skills
    $("#weaponSkillsTable td.skillNameCell .weaponSkillNameInput").live("click", weaponSkillMenu);

    // Weapon gear
    $("#weaponGearTable .weaponGearNameInput").live("click", weaponGearMenu);

    // Gear
    $(".gearTable .gearName").live("click", gearMenu);

    // Degenerations
    $("#distinctiveFeaturesInput").live("click", featuresMenu);

    // Standard of living
    $("#standardInput").live("click", standardOfLivingMenu);

    // Cultural Blessing
    $("#culturalBlessingInput .localizable").live("click", simpleCommentMenu);
    // Specialties
    $("#specialtiesInput .localizable").live("click", simpleCommentMenu);
    // Distinctive features
    $("#distinctiveFeaturesInput").on("click", ".localizable", changeFeatureMenu);

    $("#helpDiv").resizable();
    // Help Buttons
    $(document.body).on("click", ".helpButton", function (event) {
        helpButtonClick($(this));
    });

    // Help Close Button
    $("#helpDiv").on("click", ".closeButton", function (event) {
        var parentDiv = $(this).parent();
        parentDiv.find(".helpText").empty();
        $("#helpDiv").hide();
    });

    $(window).scroll(function () {
        var top = $(window).scrollTop();
        var notification = $(".notification");
        if (notification.length > 0) {
            notification.css({ top: top });
        }
        $("#helpDiv").css({ top: top });
    });

    // Cancel Character Creation with button or ESCAPE. Accept ENTER as Next and BACKSPACE as Previous
    $(".wizardWindow").on("click", ".cancel", function () {
        if (backupOfCurrentSheet != null) {
            resetCreation();
            objectToSheet(backupOfCurrentSheet);
            backupOfCurrentSheet = null;
            $(this).parents(".wizardWindow").hide();
        }
    });
    var KEYCODE_ENTER = 13;
    var KEYCODE_ESC = 27;
    var KEYCODE_BACKSPACE = 8;
    // We prevent the browser to go back in the history
    $(document).keydown(function (e) {
        if (e.keyCode == KEYCODE_BACKSPACE) {
            // But don't prevent the user from deleting in an input or textarea!
            if (!$(document.activeElement).is("input, textarea")) {
                e.preventDefault();
            }
        }
    });
    $(document).keyup(function (e) {
        if (e.keyCode == KEYCODE_ESC) {
            $('.cancel:not(:hidden)').trigger("click");
        }
        if (e.keyCode == KEYCODE_ENTER) {
            $('.next:not(:hidden)').trigger("click");
        }
        if (e.keyCode == KEYCODE_BACKSPACE) {
            $('.previous:not(:hidden)').trigger("click");
        }
    });
}

function toggleDescriptions() {
    if ($("#descriptionsToggleButton").hasClass("popupButtons")) {
        $("#descriptionsToggleButton, #tooltipDiv").removeClass("popupButtons").addClass("popupTooltips");
        $("#descriptionsToggleButton").attr("localizeKey", "uiPopupTooltips");
        $("#descriptionsToggleButton").html(_ui_("uiPopupTooltips"));
        $.cookie('popups', 'tooltips', { expires: 3650 });
    } else if ($("#descriptionsToggleButton").hasClass("popupTooltips")) {
        $("#descriptionsToggleButton, #tooltipDiv").removeClass("popupTooltips").addClass("popupNothing");
        $("#descriptionsToggleButton").attr("localizeKey", "uiNoPopupHelp");
        $("#descriptionsToggleButton").html(_ui_("uiNoPopupHelp"));
        $.cookie('popups', 'nothing', { expires: 3650 });
    } else if ($("#descriptionsToggleButton").hasClass("popupNothing")) {
        $("#descriptionsToggleButton, #tooltipDiv").removeClass("popupNothing").addClass("popupButtons");
        $("#descriptionsToggleButton").attr("localizeKey", "uiPopupHelpButtons");
        $("#descriptionsToggleButton").html(_ui_("uiPopupHelpButtons"));
        $.cookie('popups', 'buttons', { expires: 3650 });
    }
}

function helpButtonClick(sender) {
    var helpTopic = sender.attr("helptopic");
    var helpText = _ui_(helpTopic);
    var helpTitle = _loc_(helpTopic);
    if (helpTitle) {
        helpText = "<legend>" + helpTitle + "</legend><br/><div class='helpText'>" + helpText + "</div>";
    }
    var helpTextContainer = $("#helpDiv fieldset .helpTextContainer").html(helpText);
	localizeUI(helpTextContainer);
    $("#helpDiv").show();
    $("#tooltipDiv").hide();
}

function alternateFontToggle() {
    /*$(".characterSheet label, \
    .characterSheet .skillsBox .skillNameCell, \
    .characterSheet .skillsBox .skillGroupNameCell, \
    .characterSheet .weaponSkillsBox .statNameCell, \
    .characterSheet .weaponGearBox .statNameCell, \
    .characterSheet .gearContainer label, \
    .characterSheet .statusBox label").toggleClass("alternateFont");*/
    $("body").toggleClass("alternateFont");

    $.cookie('alternateFont', $(".characterSheet label").hasClass("alternateFont"), { expires: 3650 });
}

function toggleVolatileCells() {
    $(".roundStatBox, .subRoundStatBox,	.statusBox,	.attributeBox, .favouredAttributeBox, .skillGroupIcon").toggleClass("noPrint");
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

function resetCreation() {
    // Empty everything.
    $("#wizardCultureButtonsDiv").empty();
    $("#cultureNextButton").hide().unbind();
    $("#wizardWeaponSkillsPackageButtonsDiv").empty();
    $("#weaponSkillsPackageNextButton").hide().unbind();
    $("#wizardSpecialtiesButtonsDiv").empty();
    $("#SpecialtiesNextButton").hide().unbind();
    $("#wizardBackgroundButtonsDiv").empty();
    $("#BackgroundNextButton").hide().unbind();
    $("#wizardCallingButtonsDiv").empty();
    $("#callingNextButton").hide().unbind();
    $("#callingNextToAdditionalTraitButton").hide().unbind();
    $("#wizardAdditionalTraitButtonsDiv").empty();
    $("#additionalTraitNextButton").hide().unbind();
    $("#wizardFavouredSkillGroupsButtonsDiv").empty();
    $("#favouredSkillGroupsNextButton").hide().unbind();
    $("#favouredAttributeNextButton").hide().unbind();
    $(".favouredAttributes3Div .favouredAttribute3").attr("chosen", "false");
    $(".favouredAttributes2Div .favouredAttribute2").attr("chosen", "false");
    $(".favouredAttributes1Div .favouredAttribute1").attr("chosen", "false");
    $(".valourWisdomSelector").attr("chosen", "false");
    $("#valourWisdomNextButton").hide().unbind();
    $("#wizardVirtuesDiv .virtuesDiv").empty();
    $("#virtuesNextButton").hide().unbind();
    $("#wizardRewardsDiv .rewardsDiv").empty();
    $("#rewardsNextButton").hide().unbind();
    $("#previousExperienceNextButton").unbind();
    $(".characterSheet .input").empty();
    $(".characterSheet input").attr("value", "");
    $(".skillRankIcon").attr("filled", "false");
    $(".characterSheet .skillNameCell").removeClass("favoured");
    $(".characterSheet .skillNameCell input, .characterSheet .skillNameCell .input").removeClass("favoured");
    $("#internalData .skillGroups .skillGroup div").each(function () {
        $("#characterData").data($(this).html(), 0);
        $("#characterData").data("temp" + $(this).html(), 0);
    });
    $("#edition").val("");
    // Disable synch
    synchLocalCharacterEdition = null;
}

// Character creation wizard functions
function initializeCultureSelection() {
    $("#wizardCultureButtonsDiv").empty();
    $("#cultureNextButton").hide();
    // Culture Selection
    // create the culture buttons	
    $("#internalData .cultures .culture").each(function () {
        var cultureName = $(this).attr("name");
        var cultureSelectionDiv = $(
		"<div id='" + cultureName + "SelectionButton' class='cultureSelectionButton selector' culture='" + cultureName + "'><b><u class='localizable'>" + cultureName + "</u></b></div>"
		);
        $(cultureSelectionDiv).append("<br /><b>" + _ui_("uiAge") + "</b>: " + $("#internalData .cultures .culture[name=" + cultureName + "] .ageMin").html() + "-" + $("#internalData .cultures .culture[name=" + cultureName + "] .ageMax").html()
		+ ", <b>" + _ui_("uiStandardofLiving") + "</b> <span class='localizable'>" + $("#internalData .cultures .culture[name=" + cultureName + "] .standardOfLiving").html() + "</span>"
		+ ", <b>" + _ui_("uiCulturalblessing") + "</b> <span class='localizable'>" + $("#internalData .cultures .culture[name=" + cultureName + "] .culturalBlessing div").html() + "</span>"
		);
        $(cultureSelectionDiv).append(", <b>" + _ui_("uiEndurance") + "</b> +" + $("#internalData .cultures .culture[name=" + cultureName + "] .enduranceBonus").attr("value")
		+ ", <b>" + _ui_("uiHope") + "</b> +" + $("#internalData .cultures .culture[name=" + cultureName + "] .hopeBonus").attr("value"));
        var favouredSkill = $("#internalData .cultures .culture[name=" + cultureName + "] .favouredSkill").attr("skill");
        var favouredSkillText = "<br /><b>" + _ui_("uiFavouredSkill") + "</b>: <span class='localizable'>" + favouredSkill + "</span>";
        $(cultureSelectionDiv).append(favouredSkillText);
        var startingSkillScoresText = "<br /><b>" + _ui_("uiStartingSkills") + "</b>: ";
        $("#internalData .cultures .culture[name=" + cultureName + "] .startingSkillScores .skillScore").each(function () {
            startingSkillScoresText += " <span class='localizable'>" + $(this).attr("skill") + "</span> +" + $(this).attr("score");
        });
        $(cultureSelectionDiv).append(startingSkillScoresText);
        var virtuesText = "<br /><b>" + _ui_("uiUniqueVirtues") + "</b>: ";
        $("#internalData .cultures .culture[name=" + cultureName + "] .virtues .virtue").each(function () {
            virtuesText += " <span class='localizable'>" + $(this).attr("name") + "</span>";
        });
        var rewardsText = "<br /><b>" + _ui_("uiUniqueRewards") + "</b>: ";
        $("#internalData .cultures .culture[name=" + cultureName + "] .rewards .reward").each(function () {
            rewardsText += " <span class='localizable'>" + $(this).attr("name") + "</span>";
        });
        $(cultureSelectionDiv).append(virtuesText);
        $(cultureSelectionDiv).append(rewardsText);

        // Add button
        $("#wizardCultureButtonsDiv").append(cultureSelectionDiv);
        $(cultureSelectionDiv).data("cultureObject", $(this));
    });
    // Click event for each button
    $(".cultureSelectionButton").click(function (e) {
        $(".cultureSelectionButton").attr("chosen", "false");
        $(this).attr("chosen", "true");
        // save selection
        $("#characterData").data("culture", $(this).attr("culture"));
        $("#characterData").data("cultureObject", $(this).data("cultureObject"));

        // show next wizard button
        $("#cultureNextButton").show().focus();
    });
    // Culture Next button
    $("#cultureNextButton").unbind().click(function (e) {
        $("#wizardCultureDiv").hide();
        initializeWeaponSkillsPackageSelection();
        $("#wizardWeaponSkillsPackageDiv").show();
    });
    localize();
}

function initializeWeaponSkillsPackageSelection() {
    $("#wizardWeaponSkillsPackageButtonsDiv").empty();
    $("#weaponSkillsPackageNextButton").hide();
    // Weapon Skill Package Selection
    // Create the package buttons	
    var characterCulture = $("#characterData").data("culture");
    var wsPackages = $("#internalData .cultures .culture[name=" + characterCulture + "] .weaponSkillsPackages .weaponSkillsPackage");

    // For each package
    $(wsPackages).each(function (index) {
        // We create a package selection div id="weaponSkillsPackage"+index
        var wspack = $("<div id='weaponSkillsPackage" + index + "' class='weaponSkillsPackageSelectionButton selector' >");
        // We insert the skill scores inside
        $(this).find(".weaponSkillScore").each(function () {
            var isCultural = ($(this).attr("cultural") == "true");
            var isFavoured = ($(this).attr("favoured") == "true");
            var skillText = "";
            if (isCultural) {
                skillText = "<span class='localizable'>(" + $(this).attr("skill") + ")</span>";
            } else if (isFavoured) {
                skillText = "<u><span class='localizable'>" + $(this).attr("skill") + "</span></u>";
            } else {
                skillText = "<span class='localizable'>" + $(this).attr("skill") + "</span>";
            }
            skillText += " " + $(this).attr("score");
            wspack.append(skillText + "<br />");
        });
        wspack.data("wspack", $(this));
        wspack.append("</div>");

        $("#wizardWeaponSkillsPackageButtonsDiv").append(wspack);
    });

    // Click event for each button
    $(".weaponSkillsPackageSelectionButton").click(function (e) {
        // save selection		
        $("#characterData").data("weaponSkillsPackageObject", $(this).data("wspack"));
        // make the selection highlight
        $(".weaponSkillsPackageSelectionButton").attr("chosen", "false");
        $(this).attr("chosen", "true");

        // Show the Next button
        $("#weaponSkillsPackageNextButton").show().focus();
    });
    // Weapon Skill Package Next button
    $("#weaponSkillsPackageNextButton").unbind().click(function (e) {
        $("#wizardWeaponSkillsPackageDiv").hide();
        initializeSpecialtiesSelection();
        $("#wizardSpecialtiesDiv").show();
    });
    // Weapon Skill Package Prev button
    $("#weaponSkillsPackagePrevButton").unbind().click(function (e) {
        $("#wizardWeaponSkillsPackageDiv").hide();
        initializeCultureSelection();
        $("#wizardCultureDiv").show();
    });

    localize();
    updateCharacterSheetFromCharacterData();
}

function initializeSpecialtiesSelection() {
    $("#wizardSpecialtiesButtonsDiv").empty();
    $("#SpecialtiesNextButton").hide();

    // Create specialties buttons
    var characterCulture = $("#characterData").data("cultureObject");
    var specialties = $(characterCulture).find(".specialties div");
    // Create a div for each
    $(specialties).each(function () {
        var specialtyDiv = $("<div class='specialtyButton selector localizable' specialty='" + $(this).html() + "' style='border-style: solid; border-size: 1px; border-color: #999;' chosen='false'>" + $(this).html() + "</div>");
        // Note down the specialty id data
        specialtyDiv.data("specialty", $(this));
        $("#wizardSpecialtiesButtonsDiv").append(specialtyDiv);
    });
    // Event for choosing a specialty
    $(".specialtyButton").click(function (e) {
        if ($(this).attr("chosen") == "false") {
            $(this).attr("chosen", "true");
        } else {
            $(this).attr("chosen", "false");
        }

        // When chosen, if there are exactly two chosen, save selection and show Next button.
        if ($(".specialtyButton[chosen=true]").length == 2) {
            // Save
            $("#characterData").data("specialties", $(".specialtyButton[chosen=true]"));
            $("#SpecialtiesNextButton").show().focus();
        } else {
            $("#SpecialtiesNextButton").hide();
        }
    });

    // Specialties Prev button
    $("#SpecialtiesPrevButton").unbind().click(function (e) {
        $("#wizardSpecialtiesDiv").hide();
        initializeWeaponSkillsPackageSelection();
        $("#wizardWeaponSkillsPackageDiv").show();
    });

    // Specialties Next button
    $("#SpecialtiesNextButton").unbind().click(function (e) {
        $("#wizardSpecialtiesDiv").hide();
        initializeBackgroundSelection();
        $("#wizardBackgroundDiv").show();
    });
    localize();
    updateCharacterSheetFromCharacterData();
}

function initializeBackgroundSelection() {
    $("#wizardBackgroundButtonsDiv").empty();
    $("#BackgroundNextButton").hide();

    var characterCulture = $("#characterData").data("cultureObject");
    var backgrounds = characterCulture.find(".backgrounds .background");
    // Create the background buttons.
    $(backgrounds).each(function () {
        var backgroundValue = $(this).attr("value");
        var bodyScore = $(this).find(".attributeScores .attributeScore[attribute=body]").attr("score");
        var heartScore = $(this).find(".attributeScores .attributeScore[attribute=heart]").attr("score");
        var witsScore = $(this).find(".attributeScores .attributeScore[attribute=wits]").attr("score");
        var favouredSkill = $(this).find(".favouredSkill").attr("skill");
        var backgroundButtonDivText =
		"<div id='background" + backgroundValue + "' number='" + backgroundValue + "' class='backgroundButtonDiv selector' ><b class='localizable' localizeKey='" + $(this).attr("localizeKey") + "'>"
		+ $(this).attr("localizeKey") + "</b><br /> <b>" + _ui_("uiBody") + "</b>: " + bodyScore + ", <b>" + _ui_("uiHeart") + "</b>: " + heartScore + ", <b>" + _ui_("uiWits") + "</b>: " + witsScore + ", <b>" + _ui_("uiFavouredSkill") + "</b>: <span class='localizable'>" + favouredSkill + "</span>.<br /> " + _ui_("uiDistFeaturesChoose2") + " <br /> </div>";
        var backgroundButtonDiv = $(backgroundButtonDivText);

        var featureContainer = $("<div class='background" + $(this).attr("value") + "distinctiveFeaturesDiv' />");

        // Get the distinctive features for this background
        var features = $(this).find(".distinctiveFeatures div");
        // Add a feature selection button to the background button for each feature
        $(features).each(function () {
            var featureButtonDiv = $("<div class='featureButtonDiv selector localizable' feature='" + $(this).html() + "' chosen='false'>" + $(this).html() + "</div>");
            featureContainer.append(featureButtonDiv);
        });
        $(backgroundButtonDiv).append(featureContainer);
        $("#wizardBackgroundButtonsDiv").append(backgroundButtonDiv);
    });
    // Add event handler for clicking background buttons
    $(".backgroundButtonDiv").click(function (e) {
        $(".backgroundButtonDiv[id!=" + $(this).attr('id') + "] .featureButtonDiv").attr("chosen", "false");
        $(".backgroundButtonDiv").attr("chosen", "false");
        $(this).attr("chosen", "true");
        // Save the background selection
        $("#characterData").data("background", $(this));
        // Hide the Next button if we have to reselect two features
        if ($(".featureButtonDiv[chosen=true]").length != 2) {
            $("#BackgroundNextButton").hide();
        }
    });
    // Add event handler for clicking feature buttons
    $(".featureButtonDiv").click(function (e) {
        if ($(this).attr("chosen") == "false") {
            $(this).attr("chosen", "true");
        } else {
            $(this).attr("chosen", "false");
        }
        // Enable the Next button only if exactly 2 chosen
        if ($(".featureButtonDiv[chosen=true]").length == 2) {
            $("#BackgroundNextButton").show().focus();
            // And save the selection
            $("#characterData").data("distinctiveFeatures", $(".featureButtonDiv[chosen=true]"));
        } else {
            $("#BackgroundNextButton").hide();
        }
    });

    // Background Prev button
    $("#BackgroundPrevButton").unbind().click(function (e) {
        $("#wizardBackgroundDiv").hide();
        initializeSpecialtiesSelection();
        $("#wizardSpecialtiesDiv").show();
    });
    // Background Next button
    $("#BackgroundNextButton").unbind().click(function (e) {
        $("#wizardBackgroundDiv").hide();
        initializeCallingSelection();
        $("#wizardCallingDiv").show();
    });
    localize();
    updateCharacterSheetFromCharacterData();
}

function initializeCallingSelection() {
    $("#wizardCallingButtonsDiv").empty();
    $("#callingNextButton").hide();
    $("#callingNextToAdditionalTraitButton").hide();

    // Calling Selection
    // Create the calling buttons		
    $("#internalData .callings .calling").each(function () {
        var callingName = $(this).attr("name");

        // Check if it's unusual calling
        var isUnusual = false;
        var unusualCallings = $("#characterData").data("cultureObject").find(".unusualCallings div");
        if ($(unusualCallings).filter(":contains('" + callingName + "')").length > 0) {
            isUnusual = true;
        }
        // Check if it's suggested calling
        var isSuggested = false;
        var suggestedCallings = $("#characterData").data("cultureObject").find(".suggestedCallings div");
        if ($(suggestedCallings).filter(":contains('" + callingName + "')").length > 0) {
            isSuggested = true;
        }
        var buttonClasses = "callingButton selector";

        if (isUnusual) {
            buttonClasses += " discouragedButton";
        }
        if (isSuggested) {
            buttonClasses += " encouragedButton";
        }

        var favouredSkillGroups = $(this).find(".favouredSkillGroups div");
        var fsgText = "<br /><b>" + _ui_("uiCallFSG") + "</b>: ";
        $(favouredSkillGroups).each(function () {
            fsgText += "<span class='localizable'>" + $(this).html() + "</span> ";
        });

        var additionalTraitText = "<br /><b>" + _ui_("uiCallAddTrait") + "</b>: ";
        var additionalTraits = $(this).find(".additionalTrait div");
        if ($(additionalTraits).length > 1) {
            additionalTraitText += _ui_("uiCallAddTraitSeveral") + " ";
        }
        $(additionalTraits).each(function () {
            additionalTraitText += "<span class='localizable'>" + $(this).html() + "</span> ";
        });
        var shadowWeaknessText = "<br /><b>" + _ui_("uiCallSW") + "</b>: ";
        var shadowWeakness = $(this).find(".shadowWeakness div").html();
        shadowWeaknessText += "<span class='localizable'>" + shadowWeakness + "</span>";

        var callingDiv = $("<div class='" + buttonClasses + "' calling='" + callingName + "'><b class='localizable'>"
			+ callingName + "</b>" + fsgText + additionalTraitText + shadowWeaknessText + "</div>");
        $("#wizardCallingButtonsDiv").append($(callingDiv));
        $(callingDiv).data("callingObject", $(this));
    });
    // Click event for each button
    $(".wizardWindow .selector").click(function (e) {
        // highlight button
        $(".wizardWindow .callingButton").attr("chosen", "false");
        $(this).attr("chosen", "true");

        // save selection
        $("#characterData").data("calling", $(this).attr("calling"));
        $("#characterData").data("callingObject", $(this).data("callingObject"));

        // Additional trait. It could be just one or to choose among several (Slayer)
        var additionalTrait = $("#internalData .callings .calling[name=" + $(this).attr("calling") + "] .additionalTrait div");
        if ($(additionalTrait).length == 1) {
            $("#characterData").data("additionalTrait", $(additionalTrait).html());
            $("#callingNextButton").show().focus();
            $("#callingNextToAdditionalTraitButton").hide();
        } else {
            $("#callingNextButton").hide();
            $("#callingNextToAdditionalTraitButton").show().focus();
        }


    });


    // Calling Prev button
    $("#callingPrevButton").unbind().click(function (e) {
        $("#wizardCallingDiv").hide();
        initializeBackgroundSelection();
        $("#wizardBackgroundDiv").show();
    });
    // Calling Next button
    $("#callingNextButton").unbind().click(function (e) {
        $("#wizardCallingDiv").hide();
        initializeFavoredSkillGroupsSelection();
        $("#wizardFavouredSkillGroupsDiv").show();
    });
    // Calling Next To Additional Trait button
    $("#callingNextToAdditionalTraitButton").unbind().click(function (e) {
        $("#wizardCallingDiv").hide();
        initializeAdditionalTraitSelection();
        $("#wizardAdditionalTraitDiv").show();
    });
    localize();
    updateCharacterSheetFromCharacterData();
}

function initializeAdditionalTraitSelection() {
    $("#wizardAdditionalTraitButtonsDiv").empty();
    $("#additionalTraitNextButton").hide();

    var calling = $("#characterData").data("calling");
    var additionalTraits = $("#internalData .callings .calling[name=" + calling + "] .additionalTrait div");
    $(additionalTraits).each(function () {
        var traitId = $(this).html();
        var traitButton = $("<div class='additionalTraitButton selector localizable' trait='" + traitId + "' >" + traitId + "</div>");
        $("#wizardAdditionalTraitButtonsDiv").append(traitButton);
    });

    // Click events
    $(".additionalTraitButton").click(function () {
        $(".additionalTraitButton").attr("chosen", "false");
        $(this).attr("chosen", "true");

        // Save data, enable next
        $("#characterData").data("additionalTrait", $(this).attr("trait"));
        $("#additionalTraitNextButton").show().focus();
    });
    // Prev button click
    $("#additionalTraitPrevButton").unbind().click(function (e) {
        $("#wizardAdditionalTraitDiv").hide();
        initializeCallingSelection();
        $("#wizardCallingDiv").show();
    });
    // Next button click
    $("#additionalTraitNextButton").unbind().click(function (e) {
        $("#wizardAdditionalTraitDiv").hide();
        initializeFavoredSkillGroupsSelection();
        $("#wizardFavouredSkillGroupsDiv").show();
    });
    localize();
    updateCharacterSheetFromCharacterData();
}

function initializeFavoredSkillGroupsSelection() {
    $("#wizardFavouredSkillGroupsButtonsDiv").empty();
    $("#favouredSkillGroupsNextButton").hide();

    // Getting skills that are favored already.
    var cultureId = $("#characterData").data("culture");
    var backgroundNo = $("#characterData").data("background").attr("number");
    var favouredSkillData = $("#internalData .cultures .culture[name=" + cultureId + "] .backgrounds .background[value=" + backgroundNo + "] .favouredSkill");
    var favouredSkillBackground = $(favouredSkillData).attr("skill");
    var favouredSkillCulture = $("#internalData .cultures .culture[name=" + cultureId + "] .favouredSkill").attr("skill");
    var calling = $("#characterData").data("calling");
    // Getting the favoured groups for the calling
    var fsgDivs = $("#internalData .callings .calling[name=" + calling + "] .favouredSkillGroups div");

    // Getting the skills in those groups
    var skillPool = $("#wizardFavouredSkillGroupsButtonsDiv");
    $(fsgDivs).each(function () {
        var skillGroupId = $(this).html();
        $("#internalData .skillGroups .skillGroup[name=" + skillGroupId + "] div").each(function () {
            var skillId = $(this).html();
            if (skillId != favouredSkillBackground && skillId != favouredSkillCulture) {
                $(skillPool).append("<div skill='" + skillId + "' class='favouredSkillButton selector localizable' >" + skillId + "</div>");
            }
        });
    });


    // Adding the events to the buttons
    $(".favouredSkillButton").click(function (e) {
        $(this).attr("chosen", ($(this).attr("chosen") == "true" ? "false" : "true"));

        //Enable / disable and save the next button only if there are only 2 chosen
        if ($("#wizardFavouredSkillGroupsDiv .favouredSkillButton[chosen=true]").length == 2) {
            $("#characterData").data("favouredSkills", $("#wizardFavouredSkillGroupsDiv .favouredSkillButton[chosen=true]"));
            $("#favouredSkillGroupsNextButton").show().focus();
        } else {
            $("#favouredSkillGroupsNextButton").hide();
        }
    });

    // Calling Prev button
    $("#favouredSkillGroupsPrevButton").unbind().click(function (e) {
        $("#wizardFavouredSkillGroupsDiv").hide();
        initializeCallingSelection();
        $("#wizardCallingDiv").show();
    });
    // Calling Next button
    $("#favouredSkillGroupsNextButton").unbind().click(function (e) {
        $("#wizardFavouredSkillGroupsDiv").hide();
        initializeFavouredAttributesSelection();
        $("#wizardFavouredAttributesDiv").show();
    });
    localize();
    updateCharacterSheetFromCharacterData();
}

function initializeFavouredAttributesSelection() {
    $(".favouredAttribute3, .favouredAttribute2, .favouredAttribute1").attr("chosen", "false");
    $("#favouredAttributeNextButton").hide();

    // Background attribute scores 
    var background = $("#characterData").data("background");
    var backgroundNo = $(background).attr("number");
    var cultureId = $("#characterData").data("culture");
    var attributeScores = $("#internalData .cultures .culture[name=" + cultureId + "] .backgrounds .background[value=" + backgroundNo + "] .attributeScores .attributeScore");
    var attributes = [];
    $(attributeScores).each(function () {
        var attribute = $(this).attr("attribute");
        var score = $(this).attr("score");
        attributes[attribute] = score;
    });
    $("#FAChooseTextId").html(_ui_("uiFAChooseText", attributes["body"], attributes["heart"], attributes["wits"]));


    $(".favouredAttributes3Div .favouredAttribute3").click(function (e) {
        $(".favouredAttributes3Div .favouredAttribute3").attr("chosen", "false");
        $(this).attr("chosen", "true");
    });
    $(".favouredAttributes2Div .favouredAttribute2").click(function (e) {
        $(".favouredAttributes2Div .favouredAttribute2").attr("chosen", "false");
        $(this).attr("chosen", "true");
    });
    $(".favouredAttributes1Div .favouredAttribute1").click(function (e) {
        $(".favouredAttributes1Div .favouredAttribute1").attr("chosen", "false");
        $(this).attr("chosen", "true");
    });

    // When to show the Next button.
    $(".favouredAttribute1, .favouredAttribute2, .favouredAttribute3").click(function (e) {
        if ($(".favouredAttribute3[chosen=true]").length == 1 &&
			$(".favouredAttribute2[chosen=true]").length == 1 &&
			$(".favouredAttribute1[chosen=true]").length == 1 &&
			$(".favouredAttribute3[chosen=true]").attr("attribute") != $(".favouredAttribute2[chosen=true]").attr("attribute") &&
			$(".favouredAttribute3[chosen=true]").attr("attribute") != $(".favouredAttribute1[chosen=true]").attr("attribute") &&
			$(".favouredAttribute1[chosen=true]").attr("attribute") != $(".favouredAttribute2[chosen=true]").attr("attribute")
			) {
            // Show button
            $("#favouredAttributeNextButton").show().focus();
            // Save Selection
            $("#characterData").data("favouredAttribute3", $(".favouredAttribute3[chosen=true]").attr("attribute"));
            $("#characterData").data("favouredAttribute2", $(".favouredAttribute2[chosen=true]").attr("attribute"));
            $("#characterData").data("favouredAttribute1", $(".favouredAttribute1[chosen=true]").attr("attribute"));
        } else {
            $("#favouredAttributeNextButton").hide();
        }
    });

    // Favoured Attributes Prev button	
    $("#favouredAttributePrevButton").unbind().click(function (e) {
        $("#wizardFavouredAttributesDiv").hide();
        initializeFavoredSkillGroupsSelection();
        $("#wizardFavouredSkillGroupsDiv").show();
    });
    // Favoured Attributes Next button	
    $("#favouredAttributeNextButton").unbind().click(function (e) {
        $("#wizardFavouredAttributesDiv").hide();
        initializeValourWisdomSelection();
        $("#wizardValourWisdomDiv").show();
    });

    updateCharacterSheetFromCharacterData();
}

function initializeValourWisdomSelection() {
    $(".valourWisdomSelector").attr("chosen", "false");
    $("#valourWisdomNextButton").hide();
    $("#characterData").data("rewards", null);
    $("#characterData").data("virtues", null);

    $(".valourWisdomSelector").click(function (e) {
        $(".valourWisdomSelector").attr("chosen", "false");
        $(this).attr("chosen", "true");
        // Save data
        if ($(this).attr("attribute") == "valour") {
            $("#characterData").data("valour", "2");
            $("#characterData").data("wisdom", "1");
            $("#characterData").data("availableRewardPoints", "1");
            $("#characterData").data("availableVirtuePoints", "0");
        } else {
            $("#characterData").data("valour", "1");
            $("#characterData").data("wisdom", "2");
            $("#characterData").data("availableRewardPoints", "0");
            $("#characterData").data("availableVirtuePoints", "1");
        }
        $("#characterData").data("availablePreviousExperiencePoints", "10");
        $("#valourWisdomNextButton").show().focus();
    });

    // Valour/Wisdom Prev button
    $("#valourWisdomPrevButton").unbind().click(function (e) {
        $("#wizardValourWisdomDiv").hide();
        initializeFavouredAttributesSelection();
        $("#wizardFavouredAttributesDiv").show();
    });
    // Valour/Wisdom Next button
    $("#valourWisdomNextButton").unbind().click(function (e) {
        $("#wizardValourWisdomDiv").hide();
        if ($("#characterData").data("wisdom") == 2) {
            initializeVirtueSelection();
            $("#wizardVirtuesDiv").show();
        } else {
            initializeRewardsSelection();
            $("#wizardRewardsDiv").show();
        }
    });

    updateCharacterSheetFromCharacterData();
}

function initializeVirtueSelection() {
    $("#wizardVirtuesDiv .virtuesDiv").empty();
    $("#virtuesNextButton").hide();

    var cultureId = $("#characterData").data("culture");
    var uniqueVirtues = $("#internalData .cultures .culture[name=" + cultureId + "] .virtues .virtue");
    var masteries = $("#internalData .masteries .mastery");

    var appendingFunction = function () {
        var virtueId = $(this).attr("name");
        var virtueButton = $("<div class='virtueButton selector localizable' chosen='false' name='" + virtueId + "'>" + virtueId + "</div>");
        $("#wizardVirtuesDiv .virtuesDiv").append(virtueButton);
    };
    $(uniqueVirtues).each(appendingFunction);
    $(masteries).each(appendingFunction);

    // Click events
    $("#wizardVirtuesDiv .virtuesDiv .selector").click(function (e) {
        $("#wizardVirtuesDiv .virtuesDiv .selector").attr("chosen", "false");
        $(this).attr("chosen", "true");
        // Save Data and enable Next button
        $("#characterData").data("virtues", $("<div>" + $(this).attr("name") + "</div>"));
        $("#virtuesNextButton").show().focus();
    });

    // Virtues Prev button
    $("#virtuesPrevButton").unbind().click(function (e) {
        $("#wizardVirtuesDiv").hide();
        initializeValourWisdomSelection();
        $("#wizardValourWisdomDiv").show();
    });
    // Virtues Next button
    $("#virtuesNextButton").unbind().click(function (e) {
        $("#wizardVirtuesDiv").hide();
        initializePreviousExperienceSpending();
        $("#wizardPreviousExperienceDiv").show();
    });
    localize();
    updateCharacterSheetFromCharacterData();
}

function initializeRewardsSelection() {
    $("#wizardRewardsDiv .rewardsDiv").empty();
    $("#rewardsNextButton").hide();

    var cultureId = $("#characterData").data("culture");
    var uniqueRewards = $("#internalData .cultures .culture[name=" + cultureId + "] .rewards .reward");
    var qualities = $("#internalData .qualities .quality");

    var appendingFunction = function () {
        var rewardId = $(this).attr("name");
        var rewardButton = $("<div class='rewardButton selector localizable' chosen='false' name='" + rewardId + "'>" + rewardId + "</div>");
        $("#wizardRewardsDiv .rewardsDiv").append(rewardButton);
    };
    $(uniqueRewards).each(appendingFunction);
    $(qualities).each(appendingFunction);

    // Click events
    $("#wizardRewardsDiv .rewardsDiv .selector").click(function (e) {
        $("#wizardRewardsDiv .rewardsDiv .selector").attr("chosen", "false");
        $(this).attr("chosen", "true");
        // Save Data and enable Next button
        $("#characterData").data("rewards", $("<div>" + $(this).attr("name") + "</div>"));
        $("#rewardsNextButton").show().focus();
    });

    // Rewards Prev button
    $("#rewardsPrevButton").unbind().click(function (e) {
        $("#wizardRewardsDiv").hide();
        initializeValourWisdomSelection();
        $("#wizardValourWisdomDiv").show();
    });
    // Rewards Next button
    $("#rewardsNextButton").unbind().click(function (e) {
        $("#wizardRewardsDiv").hide();
        initializePreviousExperienceSpending();
        $("#wizardPreviousExperienceDiv").show();
    });
    localize();
    updateCharacterSheetFromCharacterData();
}

function initializePreviousExperienceSpending() {
    // Empty window
    $(".rankableSkillsDiv").empty();
	var cultureId = $("#characterData").data("culture");
	var previousXP = $("#internalData .cultures .culture[name=" + cultureId + "] .previousXP").attr("value") || 10;
    $(".remainingXP").attr("XPLeft", previousXP).html(_ui_("uiPXXPLeft", previousXP));

    
    // We save in characterData the skills and ranks
    // Skill Scores saving
    var startingSkillScores = $("#internalData .cultures .culture[name=" + cultureId + "] .startingSkillScores .skillScore");
    startingSkillScores.each(function () {
        var skillId = $(this).attr("skill");
        var score = $(this).attr("score");
        // Save ranks 
        $("#characterData").data(skillId, score);
    });
    // Weapon Skill saving
    var weaponSkillPackage = $("#characterData").data("weaponSkillsPackageObject");
    var weaponSkillsText = "";
    $(weaponSkillPackage).find(".weaponSkillScore").each(function (index) {
        var wsId = $(this).attr("skill");
        var wsScore = $(this).attr("score");
        var wsIsCultural = $(this).attr("cultural") == "true";
        var wsIsFavoured = $(this).attr("favoured") == "true";

        // Save ranks 
        weaponSkillsText += "<div skill='" + wsId + "' score='" + wsScore + "' cultural='" + wsIsCultural + "' favoured='" + wsIsFavoured + "'></div>";
    });
    $("#characterData").data("weaponSkills", $(weaponSkillsText));

    previousXPCreateTemporaryScores();
    previousXPGenerateButtons();

    // Previous Experience Prev button
    $("#previousExperiencePrevButton").unbind().click(function (e) {
        $("#wizardPreviousExperienceDiv").hide();
        initializeValourWisdomSelection();
        $("#wizardValourWisdomDiv").show();
    });
    // Previous Experience Next button
    $("#previousExperienceNextButton").unbind().click(function (e) {
        // Make temporary scores definitive
        $("#internalData .skillGroups .skillGroup div").each(function () {
            var skillId = $(this).html();
            var skillRank = parseInt($("#characterData").data("temp" + skillId), 10);
            skillRank = (isNaN(skillRank) ? 0 : skillRank);
            $("#characterData").data(skillId, skillRank);
        });
        $("#characterData").data("weaponSkills", $("#characterData").data("tempweaponSkills").clone());

        updateCharacterSheetFromCharacterData();
        $("#wizardPreviousExperienceDiv").hide();
        $("#wizardFinishDiv").show();
    });

    // Final touches Close button
    $("#wizardFinishDiv #finishCloseButton").unbind().click(function () {
        $("#wizardFinishDiv").hide();
    });

    // Previous Experience Reset button
    $("#previousExperienceResetButton").unbind().click(function (e) {
        // Empty window
        $(".rankableSkillsDiv").empty();
        // Reset XP counter
		var previousXP = $("#internalData .cultures .culture[name=" + cultureId + "] .previousXP").attr("value") || 10;
        $(".remainingXP").attr("XPLeft", previousXP).html(_ui_("uiPXXPLeft", previousXP));

        //Re create everything
        previousXPCreateTemporaryScores();
        previousXPGenerateButtons();
    });

    updateCharacterSheetFromCharacterData();
}

function previousXPCreateTemporaryScores() {
    // Create temporary scores
    $("#internalData .skillGroups .skillGroup div").each(function () {
        var skillId = $(this).html();
        var skillRank = parseInt($("#characterData").data(skillId), 10);
        skillRank = (isNaN(skillRank) ? 0 : skillRank);
        $("#characterData").data("temp" + skillId, skillRank);
    });
    $("#characterData").data("tempweaponSkills", $("#characterData").data("weaponSkills").clone());
    var includedWSkills = $("#characterData").data("tempweaponSkills").toEnumerable()
        .Select("x => x.attr('skill')");
    var extraWSkills = $("#internalData .weapons .weapon").toEnumerable()
        .Select(function (x) { return { "id": x.attr("name"), "cultural": false }; })
        .Where(function (x) { return !includedWSkills.Contains(x.id); });
    var extraWSkillGroups = $("#internalData .weaponGroups .weaponGroup").toEnumerable()
        .Select(function (x) { return { "id": x.attr("name"), "cultural": true }; })
        .Where(function (x) { return !includedWSkills.Contains(x.id); });
    var extraWS = extraWSkills
        .Concat(extraWSkillGroups)
        .Select(function (x) { return $("<div></div>").attr("skill", x.id).attr("score", 0).attr("cultural", x.cultural).attr("favoured", false); })
        .ToArray();
    var extraSet = $("#characterData").data("tempweaponSkills");
    for (var index in extraWS) {
        extraSet = extraSet.add(extraWS[index]);
    }
    $("#characterData").data("tempweaponSkills", extraSet);
}

function previousXPGenerateButtons() {

    var xpLeft = parseInt($("#wizardPreviousExperienceDiv .remainingXP").attr("XPLeft"), 10);
	var cultureId = $("#characterData").data("culture");
	var maxSkillRank = cultureId == "highElfRivendell" ? 6 : 5;
	var maxWSkillRank = cultureId == "highElfRivendell" ? 4 : 3;
	var wSCost = { "1":2, "2":4, "3":6, "4":10 };
    // Now we create the ranking buttons
    // For each skill
    $("#internalData .skillGroups .skillGroup div").each(function () {
        var skillId = $(this).html();
        var currentRank = parseInt($("#characterData").data("temp" + skillId), 10);
        currentRank = (isNaN(currentRank) ? 0 : currentRank);
        var rankCost = currentRank + 1;
        // Skip to next if it is too expensive
        if (rankCost > xpLeft) {
            return true;
        }
        var rankUpButton;
        // Create the button
        if (currentRank < maxSkillRank) {
            rankUpButton = $("<div class='rankUpButton selector' skill='" + skillId + "' cost='" + rankCost + "' rankToGo='" + (currentRank + 1) + "' type='common'><div class='skillName localizable'></div><div class='skillRankIcons'></div><div class='skillRankCost'></div></div>");
            $(rankUpButton).find(".skillName").html(skillId);
            $(rankUpButton).find(".skillRankCost").html(_ui_("uiPXRankCost", rankCost));
            var i;
            for (i = 1; i <= 6; i++) {
                var filled = (i <= currentRank);
                $(rankUpButton).find(".skillRankIcons").append($("<div class='skillRankIcon' filled='" + filled + "'>&nbsp;</div>"));
            }

            $("#wizardPreviousExperienceDiv .rankableSkillsDiv").append(rankUpButton);
        }
    });
        
    // For each weapon skill
    $("#characterData").data("tempweaponSkills").each(function () {
        var skillId = $(this).attr("skill");
        var currentRank = parseInt($(this).attr("score"), 10);
        var rankCost = wSCost[currentRank + 1];
        // Skip to next if it is too expensive
        if (rankCost > xpLeft) {
            return true;
        }
        var rankUpButton;
        // Create the button
        if (currentRank < maxWSkillRank) {
            rankUpButton = $("<div class='rankUpButton selector' skill='" + skillId + "' cost='" + rankCost + "' rankToGo='" + (currentRank + 1) + "'  type='weapon'><div class='skillName'></div><div class='skillRankIcons'></div><div class='skillRankCost'></div></div>");
            $(rankUpButton).find(".skillName").html(__(skillId));
            $(rankUpButton).find(".skillRankCost").html(_ui_("uiPXRankCost", rankCost));
            var i;
            for (i = 1; i <= 6; i++) {
                var filled = (i <= currentRank);
                $(rankUpButton).find(".skillRankIcons").append($("<div class='skillRankIcon' filled='" + filled + "'>&nbsp;</div>"));
            }

            $("#wizardPreviousExperienceDiv .rankableSkillsDiv").append(rankUpButton);
        }
    });
    
    // Add click events
    $("#wizardPreviousExperienceDiv .rankableSkillsDiv .rankUpButton").click(function (e) {
        var skillId = $(this).attr("skill");
        var cost = parseInt($(this).attr("cost"), 10);
        var rankToGo = parseInt($(this).attr("rankToGo"), 10);
        var type = $(this).attr("type");

        if (type == "common") {
            $("#characterData").data("temp" + skillId, rankToGo);
        } else {
            var ws = $("#characterData").data("tempweaponSkills").filter("div[skill=" + skillId + "]");
            $(ws).attr("score", rankToGo);
        }
        // Update the XP left
        xpLeft -= cost;
        $("#wizardPreviousExperienceDiv .remainingXP").attr("XPLeft", xpLeft);
        $("#wizardPreviousExperienceDiv .remainingXP").html(_ui_("uiPXXPLeft", xpLeft));
        // We reset the rank-up-buttons
        $("#wizardPreviousExperienceDiv .rankableSkillsDiv").empty();
        previousXPGenerateButtons();
        localize();
    });
    localize();
}

function updateCharacterSheetFromCharacterData() {
    // Culture
    var cultureInput = $("#cultureInput");
    var cultureId = $("#characterData").data("culture");
    $(cultureInput).empty();
    $(cultureInput).append("<span class='localizable'>" + cultureId + "</span>");
    // Standard of Living
    var standardOfLivingId = $("#internalData .cultures .culture[name=" + cultureId + "] .standardOfLiving").html();
    var standardOfLivingInput = $("#standardInput");
    $(standardOfLivingInput).empty();
    $(standardOfLivingInput).append("<span class='localizable'>" + standardOfLivingId + "</span>");
    // Cultural Blessing(s)
    var culturalBlessings = $("#internalData .cultures .culture[name=" + cultureId + "] .culturalBlessing div");
    var culturalBlessingInput = $("#culturalBlessingInput");
    $(culturalBlessingInput).empty();
    $(culturalBlessings).each(function () {
        culturalBlessingInput.append(" <span class='localizable'>" + $(this).html() + "</span>");
    });
    // Starting Skill Scores
    var startingSkillScores = $("#internalData .skillGroups .skillGroup div");
    startingSkillScores.each(function () {
        var skillId = $(this).html();
        var score = $("#characterData").data(skillId);
        var skillRankIcons = $(".characterSheet .skillRankIcon[skill=" + skillId + "]");
        $(skillRankIcons).each(function () {
            if ($(this).attr("rank") <= score) {
                $(this).attr("filled", "true");
            } else {
                $(this).attr("filled", "false");
            }
        });
    });
    
    // Weapon Skill Package    
    var weaponSkills = ($("#characterData").data("weaponSkills") || $([])).toEnumerable()
        .Select('x => {"id": x.attr("skill"), "score": parseInt(x.attr("score")), "cultural": x.attr("cultural") == "true", "favoured": x.attr("favoured") == "true" }')
        .Where('x => x.score != 0')
        .ToArray();
    // Create more rows if needed
    if (weaponSkills.length > ($("#weaponSkillsTable tr").length * 3)) {
        var neededRows = Math.ceil(weaponSkills.length / 3);
        fillWeaponSkillTable(neededRows);
    }
    var weaponGearIndex = 0;
    for(index in weaponSkills) {
        var wsId = weaponSkills[index].id;
        var wsScore = weaponSkills[index].score;
        var wsIsCultural = weaponSkills[index].cultural;
        var wsIsFavoured = weaponSkills[index].favoured;
        var wsInput = $(".characterSheet #weaponSkillsTable .skillNameCell[weaponSkillNo=" + (index) + "] .input");
        var wsInputText = (wsIsCultural ? "(" : "") + wsId + (wsIsCultural ? ")" : "");
        if (wsIsFavoured) {
            wsInput.addClass("favoured");
        }
        $(wsInput).empty();
        $(wsInput).append("<span class='localizable'>" + wsInputText + "</span>");
        // Rank cells
        $(".weaponSkillsBox .skillRankCell[weaponSkillNo=" + (index) + "] .skillRankIcon").each(function () {
            if ($(this).attr("rank") <= (wsScore)) {
                $(this).attr("filled", "true");
            } else {
                $(this).attr("filled", "false");
            }
        });
        // Stats
        var weaponStats = $("#internalData .weapons .weapon[name='" + wsId + "']");
        if ($(weaponStats).length == 0) {
            continue;
        }
        if ($("#weaponGearTable tr").length <= weaponGearIndex) {
            var newRow = $("#weaponGearTable tr:last-child").clone();
            $("#weaponGearTable").append(newRow);
        }

        var wgNameInput = $(".characterSheet #weaponGearTable tr:eq(" + (weaponGearIndex) + ") .weaponGearNameInput");
        $(wgNameInput).empty();
        $(wgNameInput).append("<span class='localizable'>" + wsId + "</span>");
        var wsDamageInput = $(".characterSheet #weaponGearTable tr:eq(" + (weaponGearIndex) + ") .weaponGearDamageInput");
        wsDamageInput.val($(weaponStats).attr("damage"));
        var wsEdgeInput = $(".characterSheet #weaponGearTable tr:eq(" + (weaponGearIndex) + ") .weaponGearEdgeInput");
        wsEdgeInput.val($(weaponStats).attr("edge"));
        var wsInjuryInput = $(".characterSheet #weaponGearTable tr:eq(" + (weaponGearIndex) + ") .weaponGearInjuryInput");
        wsInjuryInput.val($(weaponStats).attr("injury"));
        var wsEncInput = $(".characterSheet #weaponGearTable tr:eq(" + (weaponGearIndex) + ") .weaponGearEncInput");
        wsEncInput.val($(weaponStats).attr("enc"));
        weaponGearIndex++;
    }

    // Specialties
    var specialties = $("#characterData").data("specialties");
    var specialtiesInput = $("#specialtiesInput");
    $(specialtiesInput).empty();
    $(specialties).each(function () {
        $(specialtiesInput).append("<span class='localizable'>" + $(this).attr("specialty") + "</span>,&nbsp;");
    });

    // Background attribute scores 
    var background = $("#characterData").data("background");
    var backgroundNo = $(background).attr("number");
    var attributeScores = $("#internalData .cultures .culture[name=" + cultureId + "] .backgrounds .background[value=" + backgroundNo + "] .attributeScores .attributeScore");
    $(attributeScores).each(function () {
        var attribute = $(this).attr("attribute");
        var score = $(this).attr("score");
        var input = $("#" + attribute + "ScoreInput");
        $(input).val(score);
        // Save the data
        $("#characterData").data(attribute, score);
    });

    // Backgound text
    var text = $("#locale div[name=" + cultureId + "Background" + backgroundNo + "]").html() || "";
    // Remove line breaks
    text = text.replace(/(\r\n|\n|\r)/gm, " ");
    $(".characterSheet.back div[stat=backgroundText] .input").val(text);


    $(".characterSheet .skillNameCell").removeClass("favoured");
    // Culture Favored skill
    var favouredSkillCulture = $("#internalData .cultures .culture[name=" + cultureId + "] .favouredSkill").attr("skill");
    var favouredSkillCultureCell = $(".characterSheet .skillNameCell[skill=" + favouredSkillCulture + "]");
    $(favouredSkillCultureCell).addClass("favoured");

    // Background Favored skills
    var favouredSkillData = $("#internalData .cultures .culture[name=" + cultureId + "] .backgrounds .background[value=" + backgroundNo + "] .favouredSkill");
    var favouredSkill = $(favouredSkillData).attr("skill");
    var skillCell = $(".characterSheet .skillNameCell[skill=" + favouredSkill + "]");
    $(skillCell).addClass("favoured");

    // Background Features
    var featuresInput = $("#distinctiveFeaturesInput");
    $(featuresInput).empty();
    var features = $("#characterData").data("distinctiveFeatures");
    $(features).each(function () {
        var featureId = $(this).attr("feature");
        $(featuresInput).append("<span class='localizable'>" + featureId + "</span>,&nbsp;");
    });

    // Calling Favoured Skills
    var favouredSkills = $("#characterData").data("favouredSkills");
    $(favouredSkills).each(function () {
        var skillId = $(this).attr("skill");
        var skillCell = $(".characterSheet .skillNameCell[skill=" + skillId + "]");
        $(skillCell).addClass("favoured");
    });

    // Endurance
    var enduranceBonusData = $("#internalData .cultures .culture[name=" + cultureId + "] .enduranceBonus");
    var enduranceBonus = $(enduranceBonusData).attr("value");
    var heartScoreInput = $("#heartScoreInput");
    var enduranceValue = parseInt(enduranceBonus, 10) + parseInt($(heartScoreInput).val(), 10);
    var enduranceInput = $(".characterSheet .roundStatBox[stat=endurance] > input");
    $(enduranceInput).val(enduranceValue);
    var startingEnduranceInput = $(".characterSheet .roundStatBox[stat=endurance] .subRoundStatBox[stat=startingEndurance] > input");
    $(startingEnduranceInput).val(enduranceValue);

    // Hope	
    var hopeBonusData = $("#internalData .cultures .culture[name=" + cultureId + "] .hopeBonus");
    var hopeBonus = $(hopeBonusData).attr("value");
    var hopeValue = parseInt(hopeBonus, 10) + parseInt($(heartScoreInput).val(), 10);
    var hopeInput = $(".characterSheet .roundStatBox[stat=hope] > input");
    $(hopeInput).val(hopeValue);
    var startingHopeInput = $(".characterSheet .roundStatBox[stat=hope] .subRoundStatBox[stat=startingHope] > input");
    $(startingHopeInput).val(hopeValue);

    // Calling
    var callingInput = $("#callingInput");
    $(callingInput).empty();
    $(callingInput).append("<span class='localizable'>" + $("#characterData").data("calling") + "</span>&nbsp;");
    // Shadow Weakness
    var shadowWeaknessInput = $("#shadowWeaknessInput");
    $(shadowWeaknessInput).empty();
    $(shadowWeaknessInput).append("<span class='localizable'>" + $("#internalData .callings .calling[name=" + $("#characterData").data("calling") + "] .shadowWeakness div").html() + "</span>&nbsp;");

    // Additional Trait
    $(specialtiesInput).append("<span class='localizable'>" + $("#characterData").data("additionalTrait") + "</span>,&nbsp;");

    // Favoured Attributes
    var favouredAttribute3 = $("#characterData").data("favouredAttribute3");
    var favouredAttribute3Score = parseInt($("#characterData").data(favouredAttribute3), 10) + 3;
    var favouredAttribute2 = $("#characterData").data("favouredAttribute2");
    var favouredAttribute2Score = parseInt($("#characterData").data(favouredAttribute2), 10) + 2;
    var favouredAttribute1 = $("#characterData").data("favouredAttribute1");
    var favouredAttribute1Score = parseInt($("#characterData").data(favouredAttribute1), 10) + 1;

    var input3 = $(".characterSheet  .favouredAttributeBox[attribute=" + favouredAttribute3 + "] input");
    $(input3).attr("value", favouredAttribute3Score);
    var input2 = $(".characterSheet  .favouredAttributeBox[attribute=" + favouredAttribute2 + "] input");
    $(input2).attr("value", favouredAttribute2Score);
    var input1 = $(".characterSheet  .favouredAttributeBox[attribute=" + favouredAttribute1 + "] input");
    $(input1).attr("value", favouredAttribute1Score);
    $("#characterData").data(favouredAttribute3 + "Favoured", favouredAttribute3Score);
    $("#characterData").data(favouredAttribute2 + "Favoured", favouredAttribute2Score);
    $("#characterData").data(favouredAttribute1 + "Favoured", favouredAttribute1Score);

    // Parry Rating (same as Wits base score)
    $(".characterSheet .roundStatBox[stat=parry] > input").attr("value", $("#characterData").data("wits"));

    // Valour and Wisdom
    $(".characterSheet .roundStatBox[stat=valour] > input").attr("value", $("#characterData").data("valour"));
    $(".characterSheet .roundStatBox[stat=wisdom] > input").attr("value", $("#characterData").data("wisdom"));

    // Virtues
    var virtuesDiv = $(".characterSheet .virtuesContainer .virtuesContent div");
    $(virtuesDiv).empty();
    var virtues = $("#characterData").data("virtues");
    $(virtues).each(function () {
        $(virtuesDiv).append("<span class='localizable'>" + $(this).html() + "</span>,&nbsp;");
    });

    // Rewards
    var rewardsDiv = $(".characterSheet .rewardsContainer .rewardsContent div");
    $(rewardsDiv).empty();
    var rewards = $("#characterData").data("rewards");
    $(rewards).each(function () {
        $(rewardsDiv).append("<span class='localizable'>" + $(this).html() + "</span>,&nbsp;");
    });


    iconImageUpdate();
    // Localize All
    localize();
    // Compute after localize or can't find the dwarven blessing
    computeFatigue();
    computeTotalShadow();
}

function updateCharacterSheetAfterInputs() {
    // Compute Fatigue
    $(".characterSheet").on("change", ".weaponSkillStatCell input, .gearEnc", computeFatigue);

    // Compute Total Shadow
    $(".characterSheet").on("change", ".subRoundStatBox[stat=shadow] input, .subRoundStatBox[stat=permanentShadow] input", computeTotalShadow);

    // Change page title
    $(".characterSheet .basicInformationTable #nameInput").on("change", function (event) {
        var name = $(this).val();
        $(document).attr("title", name);
    });

    $(".subRoundStatBox[stat=fatigue] input, .subRoundStatBox[stat=fatigueTravel] input").on("change", function (event) {
        computeTotalFatigue();
    });

    // Synch all inputs
    $(".characterSheet").on("change", "input[type=text], textarea", function (e) {
        performSynch();
    });
}

function computeFatigue() {
    var fatigueAdder = 0;
    $(".weaponGearEncInput, .gearEnc").each(function () {
        // Find the Carried status
        var carried = $(this).parents("tr").find(".weaponGearCarriedStatus,.gearCarriedStatus").attr("on");
        if (carried != "true") {
            // Continue
            return true;
        }

        // Add the encumbrance value
        var value = parseInt($(this).attr("value"), 10);
        value = isNaN(value) ? 0 : value;
        fatigueAdder += value;
    });

    // If it has Redoubtable blessing, we substract favoured Heart score
    if ($("#culturalBlessingInput .localizable[localizeKey=redoubtable]").length > 0) {
        var favouredHeartScore = $(".favouredAttributeBox[attribute=heart] input").attr("value");
        fatigueAdder -= parseInt(favouredHeartScore, 10);
    }
    if (fatigueAdder < 0) {
        fatigueAdder = 0;
    }

    $(".subRoundStatBox[stat=fatigue] input").attr("value", fatigueAdder);
    computeTotalFatigue();
}

function computeTotalFatigue() {
    var gearFatigue = parseInt($(".subRoundStatBox[stat=fatigue] input").val(), 10) || 0;
    var travelFatigue = parseInt($(".subRoundStatBox[stat=fatigueTravel] input").val(), 10) || 0;
    var totalFatigue = gearFatigue + travelFatigue;
    $(".subRoundStatBox[stat=fatigueTotal] input").val(totalFatigue);
    performSynch();
}

function computeTotalShadow() {
    var temporaryShadow = parseInt($(".subRoundStatBox[stat=shadow] input").val(), 10) || 0;
    var permanentShadow = parseInt($(".subRoundStatBox[stat=permanentShadow] input").val(), 10) || 0;
    var totalShadow = temporaryShadow + permanentShadow;
    $(".subRoundStatBox[stat=totalShadow] input").val(totalShadow);
    performSynch();
}

function computeArmours() {
    var armour = $(".gearContainer .gearTable tr:eq(0) .input .localizable").attr("localizeKey");
    var headgear = $(".gearContainer .gearTable tr:eq(1) .input .localizable").attr("localizeKey");
    var shield = $(".gearContainer .gearTable tr:eq(2) .input .localizable").attr("localizeKey");

    // Armour
    var armourType = $("#internalData .armours .armour[name=" + armour + "]");
    var armourProtection = "";
    if (($(armourType).length > 0) && ($(armourType).attr("type") == "leatherArmour" || $(armourType).attr("type") == "mailArmour")) {
        armourProtection = $(armourType).attr("protection");
    }
    $(".roundStatBox[stat=armour] > input").attr("value", armourProtection);

    // Headgear
    var hgType = $("#internalData .armours .armour[name=" + headgear + "]");
    var hgProtection = "";
    if ($(hgType).length > 0 && $(hgType).attr("type") == "headgear") {
        hgProtection = $(hgType).attr("protection");
    }
    $(".subRoundStatBox[stat=headgear] > input").attr("value", hgProtection);

    // Shield
    var shieldType = $("#internalData .shields .shield[name=" + shield + "]");
    var shieldProtection = "";
    if ($(shieldType).length > 0) {
        shieldProtection = $(shieldType).attr("parry");
    }
    $(".subRoundStatBox[stat=shield] > input").attr("value", shieldProtection);
}

// Character serialization
function serializeCharacter() {
    var serializedText = serializedData();

    // Show window
    $("#serializeDiv").show();
    $("#serializeDiv .serializeDataDiv").html(serializedText).select().focus();
    $("#serializeDiv #serializeCloseButton").unbind().click(function () {
        $("#serializeDiv").hide();
    });
}

function sheetToObject() {
    var data = new Object();
    data.version = "2";
    data.edition = $("#edition").val() || 0;
    data.name = escape($("#nameInput").val());
    data.culture = $("#cultureInput .localizable").attr("localizeKey");
    data.standard = $("#standardInput .localizable").attr("localizeKey");
    data.culturalBlessing = $("#culturalBlessingInput .localizable").attr("localizeKey");
    data.calling = $("#callingInput .localizable").attr("localizeKey");
    data.shadowWeakness = $("#shadowWeaknessInput .localizable").attr("localizeKey");

    data.specialties = $("#specialtiesInput .localizable").toEnumerable()
		.Select("$.attr('localizeKey')")
		.ToArray();
    data.features = $("#distinctiveFeaturesInput .localizable").toEnumerable()
		.Select("$.attr('localizeKey')")
		.ToArray();
    data.favoured = $(".skillNameCell.localizable.favoured").toEnumerable()
		.Select("$.attr('localizeKey')")
		.ToArray();
	data.eyeMarked = $(".skillNameCell.localizable.eyeMarked").toEnumerable()
		.Select("$.attr('localizeKey')")
		.ToArray();

    $(".skillTable .skillRankCell .skillRankIcon[filled=true]").each(function () {
        if (!data[$(this).attr("skill")] || parseInt(data[$(this).attr("skill")], 10) < parseInt($(this).attr("rank"), 10)) {
            data[$(this).attr("skill")] = parseInt($(this).attr("rank"), 10);
        }
    });
    $(".skillGroupAdvancementCell .skillGroupIcon[filled=true]").each(function () {
        if (!data[$(this).attr("skillgroup")] || parseInt(data[$(this).attr("skillgroup")], 10) < parseInt($(this).attr("rank"), 10)) {
            data[$(this).attr("skillgroup")] = parseInt($(this).attr("rank"), 10);
        }
    });
    $(".attributeBox").each(function () {
        data[$(this).attr("attribute")] = parseInt($(this).find("input").attr("value"), 10);
    });
    $(".favouredAttributeBox").each(function () {
        data["favoured" + $(this).attr("attribute")] = parseInt($(this).find("input").attr("value"), 10);
    });
    $(".roundStatBox,.subRoundStatBox[stat]").each(function () {
        data[$(this).attr("stat")] = $(this).find("input").attr("value");
    });
    $(".statusBox[stat]").each(function () {
        data[$(this).attr("stat")] = ($(this).attr("on") == "true");
    });

    data.virtues = $(".virtuesContent div .localizable").toEnumerable()
		.Select("$.attr('localizeKey')")
		.ToArray();

    data.rewards = $(".rewardsContent div .localizable").toEnumerable()
		.Select("$.attr('localizeKey')")
		.ToArray();

    data.weaponSkills = $("#weaponSkillsTable .skillNameCell").toEnumerable()
		.Where(function (wsNameCell) {
		    return $(wsNameCell).find(".localizable").attr("localizeKey");
		})
		.Select(function (wsNameCell) {
		    var wsId = $(wsNameCell).find(".localizable").attr("localizeKey");
		    var wsFavoured = ($(wsNameCell).find(".favoured").length > 0);
		    var wsSkillNo = $(wsNameCell).attr("weaponSkillNo");
		    var wsRankCollection = $("#weaponSkillsTable .skillRankCell[weaponSkillNo=" + wsSkillNo + "] .skillRankIcon[filled=true]").toEnumerable()
				.Select("parseInt($.attr('rank'), 10)");
		    var wsRank = 0;
		    if (wsRankCollection.Count() > 0) {
		        wsRank = wsRankCollection.Last();
		    }
		    return { "id": wsId, "favoured": wsFavoured, "rank": wsRank };
		})
		.ToArray();


    data.weaponGear = $("#weaponGearTable tr").toEnumerable()
		.Where(function (wgRow) { return $(wgRow).find(".localizable").attr("localizeKey"); })
		.Select(function (wgRow) {
		    var wgId = $(wgRow).find(".localizable").attr("localizeKey");
		    var wgStats = {};
		    $(wgRow).find(".weaponGearStatCell input").each(function () {
		        wgStats[$(this).attr('stat')] = $(this).val();
		    });
		    var wgCarried = ($(wgRow).find(".statusBox").attr("on") == "true");
		    return { "id": wgId, "stats": wgStats, "carried": wgCarried };
		})
		.ToArray();

		data.gear = $(".gearTable tr").toEnumerable()
		.Where("$.find('.gearName .localizable').attr('localizeKey')")
		.Select(function (gRow) {
		    return {
		        "id": $(gRow).find(".gearName .localizable").attr("localizeKey"),
		        "enc": $(gRow).find(".gearEnc").attr("value"),
		        "carried": ($(gRow).find(".statusBox").attr("on") == "true"),
		        "specificSlot": ($(gRow).index() <= 2 ? $(gRow).index() : "extra")
		    };
		})
		.ToArray();

    // Back sheet
    data.backgroundText = escape($(".bigText[stat=backgroundText] .input").attr("value"));
    data.guideText = escape($("#guideInput").attr("value"));
    data.scoutText = escape($("#scoutInput").attr("value"));
    data.huntsmanText = escape($("#huntsmanInput").attr("value"));
    data.lookoutText = escape($("#lookoutInput").attr("value"));
    data.fellowshipFocusText = escape($("#fellowshipFocusInput").attr("value"));
    data.fellowshipNotesText = escape($("#fellowshipNotesInput").attr("value"));
    data.sanctuariesText = escape($("#sanctuariesInput").attr("value"));
    data.patronText = escape($("#patronInput").attr("value"));
    
	data.coins = {"gold": escape($("#goldCoinsInput").val()||""), "silver": escape($("#silverCoinsInput").val()||""), "copper": escape($("#copperCoinsInput").val()||"")};
	
	data.inventory = $("#inventoryTable td").toEnumerable()
		.Where(function(td){return td.find(".input").val();})
		.Select(function(td){return {"slotNo": td.attr("slotNo"), "value": escape(td.find(".input").val())};})
		.ToArray();
	
	// Tale of years
    data.taleOfYears = $("#taleOfYearsTable .yearTale").toEnumerable()
		.Where('($.find(".year.input").val()) || ($.find(".events.input").val())')
		.Select(function (row) {
		    var rowNumber = $(row).attr("number");
		    var rowYearText = escape($(row).find(".year.input").val());
		    var rowEventsText = escape($(row).find(".events.input").val());
		    return { "year": rowYearText, "events": rowEventsText };
		})
		.ToArray();

    // Comment texts
    data.comments = $(".localizable[commentText]").toEnumerable()
		.Where("$.attr('commentText')")
		.Select('{"for":$.attr("localizeKey"), "text":escape($.attr("commentText"))}')
		.ToArray();

    return data;
}

function serializedData() {
    var data = sheetToObject();

    // Serialize
    var serializedText = JSON.stringify(data);
    return serializedText;
}

// Character deserialization
function deserializeCharacter() {
    // Show window
    $("#deserializeDiv").show();
    $("#deserializeDiv .deserializeDataDiv").attr("value", "").focus();
    $("#deserializeDiv #deserializeNextButton").unbind().click(function () {
        var serializedText = $("#deserializeDiv .deserializeDataDiv").attr("value");
        deserializeData(serializedText);
        $("#deserializeDiv").hide();
    });
    $("#deserializeDiv #deserializeCloseButton").unbind().click(function () {
        $("#deserializeDiv").hide();
    });
}

function __(text) {
    return "<span class='localizable'>" + text + "</span>";
}

function localizeUI(optionalElement) {
    // Defaults to the whole document
    optionalElement = (typeof optionalElement === "undefined") ? $('body') : optionalElement;
    $(optionalElement).find(".uiText").each(function () {
        var localizeKey = $(this).attr("localizeKey");
        if (!localizeKey) {
            localizeKey = $(this).html().replace(/^\s*|\s*$/g, "");
            $(this).attr("localizeKey", localizeKey);
        }
        $(this).html(_ui_(localizeKey));
    });
}

function _loc_() {
    var args = _loc_.arguments;

    if (args.length == 0) {
        return;
    }

    var localizeKey = args[0];
    if (!localizeKey) {
        return "Missing:localizeKey";
    }
    var locale = localeDict[localizeKey];
    if (!locale) {
        return "Missing:" + localizeKey;
    }
    // We get the full name 
    var localizedText = locale.fullname;

    // We substitute rest of parameters into the text
    for (i = 1; i < args.length; i++) {
        localizedText = localizedText.replace("{" + (i - 1) + "}", args[i]);
    }

    return localizedText;
}

function _ui_(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
    var args = $.Enumerable.From([arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10])
		.TakeWhile("$!=undefined")
		.ToArray();
    if (args.length == 0) {
        return;
    }

    var localizeKey = args[0];
    if (localizeKey == undefined) {
        return "Missing:localizeKey";
    }
    var locale = localeDict[localizeKey];
    if (!locale) {
        return "Missing:" + localizeKey;
    }
    // We get the full name 
    var localizedText = locale.contents;

    // We substitute rest of parameters into the text
    var i;
    for (i = 1; i < args.length; i++) {
        localizedText = localizedText.replace("{" + (i - 1) + "}", args[i]);
    }

    return localizedText;
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
			if ($("#weaponGearTable tr").length > 1){
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

function renumberWeaponSlots() {
    // ## Renumber them
    $("#weaponSkillsTable .skillNameCell").each(function (index) {
        $(this).attr("weaponSkillNo", index);
    });
    $("#weaponSkillsTable .skillRankCell").each(function (index) {
        $(this).attr("weaponSkillNo", index);
    });
    $("#weaponGearTable tr").each(function (index) {
        $(this).attr("weaponSkillNo", index);
    });
}

function objectToSheet(data) {
    try {
        if (data.version == undefined) {
            importCharacterV1(data);
        } else {
            // Load from Version 2
            $("#edition").val(data.edition);
            $("#nameInput").attr("value", unescape(data.name)).trigger("change");
            $("#cultureInput").html(__(data.culture));
            $("#standardInput").html(__(data.standard));
            $("#culturalBlessingInput").html(__(data.culturalBlessing));
            $("#callingInput").html(__(data.calling));
            $("#shadowWeaknessInput ").html(__(data.shadowWeakness));
            $("#specialtiesInput").empty();
            var array = data.specialties;
            var i;
            for (i in array) {
                $("#specialtiesInput").append(__(array[i]) + ", ");
            }
            $("#distinctiveFeaturesInput").empty();
            array = data.features;
            for (i in array) {
                $("#distinctiveFeaturesInput").append(__(array[i]) + ", ");
            }

            $("#internalData .skillGroups .skillGroup div").each(function () {
                var skillId = $(this).html();
                $(".skillNameCell[skill=" + skillId + "]").removeClass("favoured").removeClass("eyeMarked");
            });
            array = data.favoured;
            for (i in array) {
                $(".skillNameCell[skill=" + array[i] + "]").addClass("favoured");
            }
			array = data.eyeMarked || [];
            for (i in array) {
                $(".skillNameCell[skill=" + array[i] + "]").addClass("eyeMarked");
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
            array = data.virtues;
            if (array.length > 0) {
                for (i in array) {
                    if (unescape(array[i]) == "") {
                        continue;
                    }

                    $(".virtuesContent div").append(__(array[i]) + ", ");
                }
            }
            $(".rewardsContent div").empty();
            array = data.rewards;
            if (array.length > 0) {
                for (i in array) {
                    if (unescape(array[i]) == "") {
                        continue;
                    }
                    $(".rewardsContent div").append(__(array[i]) + ", ");
                }
            }

            var wsArray = data.weaponSkills;
            // Make room for the many weapon skills
            // n=wsArray.length -> skill count in the character. In the new layout we have to make Math.ceil(n/3) rows to fit them all because every row in the new layout holds 3
            // Weapon skills rows
            var neededWSRows = Math.ceil(wsArray.length / 3);
            while ($("#weaponSkillsTable tr").length < neededWSRows) {
                $("#weaponSkillsTable").append($("#weaponSkillsTable tr:eq(0)").clone());
            }


            // Renumber them
            $("#weaponSkillsTable .skillNameCell").each(function (index) {
                $(this).attr("weaponSkillNo", index);
            });
            $("#weaponSkillsTable .skillRankCell").each(function (index) {
                $(this).attr("weaponSkillNo", index);
            });

            // Empty the rows (in both skills and gear tables)
            $("#weaponSkillsTable .weaponSkillNameInput, #weaponGearTable .weaponGearNameInput").empty();
            $("#weaponGearTable .weaponGearDamageInput, #weaponGearTable .weaponGearEdgeInput, #weaponGearTable .weaponGearInjuryInput, #weaponGearTable .weaponGearEncInput").val("");

            // Fill the rows			
            for (ws in wsArray) {
                var wsId = wsArray[ws].id;
                // Weapon Skills table
                var wsNameInput = $("#weaponSkillsTable .skillNameCell[weaponSkillNo=" + ws + "] .weaponSkillNameInput");
                $(wsNameInput).html(__(wsId));

                if (wsArray[ws].favoured == true) {
                    $(wsNameInput).addClass("favoured");
                } else {
                    $(wsNameInput).removeClass("favoured");
                }
                $("#weaponSkillsTable .skillRankCell[weaponSkillNo=" + ws + "] .skillRankIcon").each(function () {
                    if (parseInt($(this).attr("rank"), 10) <= wsArray[ws].rank) {
                        $(this).attr("filled", "true");
                    } else {
                        $(this).attr("filled", "false");
                    }
                });

            }

            // Weapon Gear table
            var wgArray = data.weaponGear;
            // Weapon gear rows
            while ($("#weaponGearTable tr").length < wgArray.length) {
                $("#weaponGearTable").append($("#weaponGearTable tr:eq(4)").clone());
            }
            // Renumber
            $("#weaponGearTable tr").each(function (index) {
                $(this).attr("weaponSkillNo", index);
            });
            var wg;
            for (wg in wgArray) {
                tr = $("#weaponGearTable tr[weaponSkillNo=" + wg + "]");
                $(tr).find(".weaponGearNameInput").html(__(wgArray[wg].id));
                $(tr).find(".weaponGearDamageInput").val(wgArray[wg].stats.damage);
                $(tr).find(".weaponGearEdgeInput").val(wgArray[wg].stats.edge);
                $(tr).find(".weaponGearInjuryInput").val(wgArray[wg].stats.injury);
                $(tr).find(".weaponGearEncInput").val(wgArray[wg].stats.enc);
                $(tr).find(".weaponGearCarriedStatus").attr("on", wgArray[wg].carried);
            }

            var gearArray = data.gear;
            // Make room for the many gear rows
            while ($(".gearTable tr").length < gearArray.length) {
                $(".gearTable").append($(".gearTable tr:eq(3)").clone());
            }
            // Empty the rows
            $(".gearTable .gearName").empty();
            $(".gearTable .gearEnc").val("");
            // Fill the rows
            var g;
            for (g in gearArray) {
                // Check if it either belongs to the first 3 special places or any of the other extra ones.
                var specificSlot = gearArray[g].specificSlot;
                var position = g;
                if (specificSlot == "extra") {
                    position = 2 + parseInt(g);
                } else if (specificSlot != undefined) {
                    position = parseInt(specificSlot);
                } 

                tr = $(".gearTable tr:eq(" + position + ")");
                $(tr).find(".gearName").append(__(gearArray[g].id));
                $(tr).find(".gearEnc").val(gearArray[g].enc);
                $(tr).find(".gearCarriedStatus").attr("on", gearArray[g].carried);
            }

            // Back sheet
            $("#taleOfYearsTable .yearTale .input").val("");
            $.Enumerable.From(data.taleOfYears)
				.Do(function (value, index) {
				    var toyRow = $("#taleOfYearsTable .yearTale:eq(" + index + ")");
				    $(toyRow).find(".year.input").val(unescape(value.year || ""));
				    $(toyRow).find(".events.input").val(unescape(value.events || ""));
				})
				.ToArray();
			
			if(data.inventory) {
				$("#inventoryTable td .input").val("");
				$.Enumerable.From(data.inventory)
					.Do(function (value, index) {
						var invTd = $("#inventoryTable td[slotNo=" + unescape(value.slotNo) + "]");
						$(invTd).find(".input").val(unescape(value.value || ""));				    
					})
					.ToArray();
			} else {
				$("#inventoryTable td .input").val("");
			}
			if(data.coins){
				$("#goldCoinsInput").val(unescape(data.coins.gold||""));
				$("#silverCoinsInput").val(unescape(data.coins.silver||""));
				$("#copperCoinsInput").val(unescape(data.coins.copper||""));
			} else {
				$("#goldCoinsInput").val("");
				$("#silverCoinsInput").val("");
				$("#copperCoinsInput").val("");
			}
			
            $(".bigText[stat=backgroundText] .input").val(unescape(data.backgroundText || ""));
            $("#guideInput").val(unescape(data.guideText || ""));
            $("#scoutInput").val(unescape(data.scoutText || ""));
            $("#huntsmanInput").val(unescape(data.huntsmanText || ""));
            $("#lookoutInput").val(unescape(data.lookoutText || ""));
            $("#fellowshipFocusInput").val(unescape(data.fellowshipFocusText || ""));
            $("#fellowshipNotesInput").val(unescape(data.fellowshipNotesText || ""));
            $("#sanctuariesInput").val(unescape(data.sanctuariesText || ""));
            $("#patronInput").val(unescape(data.patronText || ""));

            iconImageUpdate();
            localize();
            computeFatigue();
            computeTotalShadow();
            // After localization, all localizables have localizeKey. 
            // Then we can attach the comments.
            var c;
            for (c in data.comments) {
                var element = $(".localizable[localizeKey=" + data.comments[c]["for"] + "]");
                if (element.length == 0) {
                    continue;
                }
                $(element).attr("commentText", unescape(data.comments[c].text));
                localizeOne(element);
            }

        }

    }
    catch (ex) {
		alert(ex);
    }
}

function deserializeData(serializedText) {
    try {
        synchLocalCharacterEdition = $.parseJSON(serializedText);

        objectToSheet(synchLocalCharacterEdition);
		localize();
    }
    catch (ex) {
        alert(ex);
    }
}


// Interactive menus
function showContextMenu(e) {
    var menu = $(".contextMenu");
    //$(menu).clearQueue("fx");
    $(menu).css("left", e.pageX + 1);
    $(menu).css("top", e.pageY + 1);
    $(menu).show();
}

function closeContextMenu() {
    $(".contextMenu").clearQueue("fx").hide();
}

function commonSkillMenu(e) {
    // showMenu
    var menu = $(".contextMenu");
    $(menu).empty();
    var sender = $(this);
    // favoured
    if (sender.hasClass("favoured")) {
        var button = $("<div class='action'>" + _ui_("uiMenuNotFavoured") + "</div>").click(function () {
            sender.removeClass("favoured");
            closeContextMenu();
            performSynch();
        });
        $(menu).append(button);
    }
    if (!sender.hasClass("favoured")) {
        var button = $("<div class='action'>" + _ui_("uiMenuFavoured") + "</div>").click(function () {
            sender.addClass("favoured");
            closeContextMenu();
            performSynch();
        });
        $(menu).append(button);
    }

	// eye marked
    if (sender.hasClass("eyeMarked")) {
        var button = $("<div class='action'>" + _ui_("uiMenuNotEyeMarked") + "</div>").click(function () {
            sender.removeClass("eyeMarked");
            closeContextMenu();
            performSynch();
        });
        $(menu).append(button);
    }
    if (!sender.hasClass("eyeMarked")) {
        var button = $("<div class='action'>" + _ui_("uiMenuEyeMarked") + "</div>").click(function () {
            sender.addClass("eyeMarked");
            closeContextMenu();
            performSynch();
        });
        $(menu).append(button);
    }


    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

    showContextMenu(e);
}

function virtuesMenu(e) {
    if (e.target != this) {
        return true;
    }
    // showMenu
    var menu = $(".contextMenu");
    $(menu).empty();
    var sender = $(this);

    // Add virtue	
    var button = $("<div class='action'>" + _ui_("uiMenuAdd") + "</div>").click(function () {
        closeContextMenu();
        menu.empty();
        // get culture
        var culture = $("#cultureInput .localizable").attr("localizeKey");
        // get current virtues
        var currentVirtues = [];
        $(".virtuesContent div .localizable").each(function () {
            currentVirtues[$(this).attr("localizeKey")] = true;
        });
        // get general virtues that aren't current
        var virtues = [];
        $("#internalData .mastery").each(function () {
            if (currentVirtues[$(this).attr("name")] != true) {
                virtues.push($(this).attr("name"));
            }
        });
        // get culture virtues that aren't current
        $("#internalData .culture[name=" + culture + "] .virtues .virtue").each(function () {
            if (currentVirtues[$(this).attr("name")] != true) {
                virtues.push($(this).attr("name"));
            }
        });

        // make the buttons
        var v;
        for (v in virtues) {
            var virtueName = virtues[v];
            var button = $("<div class='action'>" + __(virtueName) + "</div>");
            $(button).click({ n: virtueName }, function (ea) {
                closeContextMenu();
                // add the virtue
                $(".virtuesContent > div").append(__(ea.data.n) + ", ");
                localize();
                performSynch();
            });
            menu.append(button);
        }
        // nevermind button
        menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

        localize();
        showContextMenu(e);
    });
    $(menu).append(button);

    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

    localize();
    showContextMenu(e);
}

function oneVirtueRewardMenu(e) {
    // showMenu
    var menu = $(".contextMenu");
    $(menu).empty();
    var sender = $(this);

    // remove virtue	
    var button = $("<div class='action'>" + _ui_("uiMenuRemove") + "</div>").click(function () {
        closeContextMenu();
        $(sender).remove();
        performSynch();
    });
    $(menu).append(button);

    // Add comment
    addCommentMenuOption(sender);

    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

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
    var button = $("<div class='action'>" + _ui_("uiMenuAdd") + "</div>").click(function () {
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
        menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

        localize();
        showContextMenu(e);
    });
    $(menu).append(button);

    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

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
        var button = $("<div class='action'>" + _ui_("uiMenuNotFavoured") + "</div>").click(function () {
            sender.removeClass("favoured");
            closeContextMenu();
            performSynch();
        });
        $(menu).append(button);
    }
    if (!sender.hasClass("favoured")) {
        var button = $("<div class='action'>" + _ui_("uiMenuFavoured") + "</div>").click(function () {
            sender.addClass("favoured");
            closeContextMenu();
            performSynch();
        });
        $(menu).append(button);
    }

    // Select weapon skill
    var button = $("<div class='action'>" + _ui_("uiMenuSelectWSkill") + "</div>").click(function () {
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
        menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

        localize();
        showContextMenu(e);
    });
    $(menu).append(button);

    // Select cultural weapon skill
    button = $("<div class='action'>" + _ui_("uiMenuSelectWGroup") + "</div>").click(function () {
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
        menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

        localize();
        showContextMenu(e);

    });
    $(menu).append(button);

    // Remove weapon skill	
    button = $("<div class='action'>" + _ui_("uiMenuRemove") + "</div>").click(function () {
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
    button = $("<div class='action'>" + _ui_("uiMenuAddRow") + "</div>").click(function () {
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
        button = $("<div class='action'>" + _ui_("uiMenuRemoveRow") + "</div>").click(function () {
            closeContextMenu();
            var row = sender.parents("#weaponSkillsTable tr");
            $(row).remove();
            renumberWeaponSlots();
            performSynch();
        });
        $(menu).append(button);
    }


    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

    localize();
    showContextMenu(e);
}

function weaponGearMenu(e) {
    // showMenu
    var menu = $(".contextMenu");
    $(menu).empty();
    var sender = $(this);

    // Select weapon 
    var button = $("<div class='action'>" + _ui_("uiMenuSelectWeapon") + "</div>").click(function () {
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
        menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

        localize();
        showContextMenu(e);
    });
    $(menu).append(button);

    // Add row
    button = $("<div class='action'>" + _ui_("uiMenuAddRow") + "</div>").click(function () {
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
        button = $("<div class='action'>" + _ui_("uiMenuRemoveRow") + "</div>").click(function () {
            closeContextMenu();
            var row = sender.parents("#weaponGearTable tr");
            $(row).remove();
            renumberWeaponSlots();
            performSynch();
        });
        $(menu).append(button);
    }

    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

    localize();
    showContextMenu(e);
}



function gearMenu(e) {
    // showMenu
    var menu = $(".contextMenu");
    $(menu).empty();
    var sender = $(this);

    // Select gear
    button = $("<div class='action'>" + _ui_("uiMenuSelectGear") + "</div>").click(function () {
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
        menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

        localize();
        showContextMenu(e);

    });
    $(menu).append(button);

    // Remove gear	
    button = $("<div class='action'>" + _ui_("uiMenuRemove") + "</div>").click(function () {
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
    button = $("<div class='action'>" + _ui_("uiMenuAddRow") + "</div>").click(function () {
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
        button = $("<div class='action'>" + _ui_("uiMenuRemoveRow") + "</div>").click(function () {
            closeContextMenu();
            var row = sender.parents(".gearTable tr");
            $(row).remove();
            computeFatigue();
            computeArmours();
        });
        $(menu).append(button);
    }

    // Add comment option
    button = $("<div class='action'>" + _ui_("uiMenuSetComment") + "</div>").click(function () {
        closeContextMenu();
        var currentText = $(sender).find(".localizable").attr("commentText");
        if (currentText == undefined) {
            currentText = "";
        }
        var commentText = prompt(_ui_("uiSetCommentText"), currentText);
        $(sender).find(".localizable").attr("commentText", commentText);

        localizeOne($(sender).find(".localizable"));
        performSynch();
    });
    $(menu).append(button);



    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

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
    var button = $("<div class='action'>" + _ui_("uiMenuAddDegeneration") + "</div>").click(function () {
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
            alert(_ui_("uiErrorNoMoreDeg"));
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
        menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

        localize();
        showContextMenu(e);
    });
    $(menu).append(button);

    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

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

        var button = $("<div class='action'>" + _ui_("uiMenuExchangeFeature") + "</div>").click(function () {
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
            menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

            localize();
            showContextMenu(e);
        });
        menu.append(button);
    };
    // Add comment
    addCommentMenuOption(sender);

    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

    localize();
    showContextMenu(e);
}

function addCommentMenuOption(sender) {
    var menu = $(".contextMenu");
    var button = $("<div class='action'>" + _ui_("uiMenuSetComment") + "</div>").click(function () {
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
    $(menu).empty();
    var sender = $(this);

    // Select standard of living

    // get all gear
    $("#internalData .standardsOfLiving .standardOfLiving").each(function () {
        var gId = $(this).attr("name");

        var button = $("<div class='action'>" + __(gId) + "</div>");

        // Add the standard
        $(button).click({ id: gId }, function (ed) {
            closeContextMenu();

            $("#standardInput").empty();
            $("#standardInput").append(__(ed.data.id));

            localize();
            performSynch();
        });
        $(menu).append(button);
    });


    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

    localize();
    showContextMenu(e);

}

function simpleCommentMenu(e) {
    // showMenu
    var menu = $(".contextMenu");
    $(menu).empty();
    var sender = $(this);

    // Add comment
    addCommentMenuOption(sender);

    // nevermind button
    menu.append($("<div class='action'><b>" + _ui_("uiMenuNevermind") + "</b></div>").click(function () { closeContextMenu(); }));

    localize();
    showContextMenu(e);
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
            $("#rollerTotal").html(_ui_("uiTotal") + ": " + total);
        } else {
            $("#rollerTotal").html(_ui_("uiTotal") + ": " + total + " + " + tengwar + "<img src='css/6.png' />");
        }
    } else {
        if (tengwar == 0) {
            $("#rollerTotal").html(_ui_("uiSimpleSuccess"));
        } else if (tengwar == 1) {
            $("#rollerTotal").html(_ui_("uiSuperiorSuccess"));
        } else if (tengwar >= 2) {
            $("#rollerTotal").html(_ui_("uiExtraordinarySuccess"));
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
    text += "[b]" + _ui_("uiName") + "[/b] " + $("#nameInput").attr("value").replace(/['"]/g, '');
    text += "\n\n";
    // Culture
    text += "[b]" + _ui_("uiCulture") + "[/b] " + _loc_($("#cultureInput .localizable").attr("localizeKey"));
    // Standard
    text += "  [b]" + _ui_("uiStandardofLiving") + "[/b] " + _loc_($("#standardInput .localizable").attr("localizeKey"));
    text += "\n";
    // Blessing
    text += "[b]" + _ui_("uiCulturalblessing") + "[/b] " + _loc_($("#culturalBlessingInput .localizable").attr("localizeKey"));
    text += forumCommentHelper($("#culturalBlessingInput .localizable"));
    text += "\n";
    // Calling
    text += "  [b]" + _ui_("uiCalling") + "[/b] " + _loc_($("#callingInput .localizable").attr("localizeKey"));
    // Shadow Weakness
    text += "  [b]" + _ui_("uiShadowweakness") + "[/b] " + _loc_($("#shadowWeaknessInput .localizable").attr("localizeKey"));
    text += "\n";
    // Specialties
    text += "[b]" + _ui_("uiSpecialties") + "[/b] ";
    var array = [];
    $("#specialtiesInput .localizable").each(function () {
        array.push(_loc_($(this).attr("localizeKey")) + forumCommentHelper($(this)));
    });
    text += array.join(", ");
    text += "\n";
    // Distinctive features
    text += "[b]" + _ui_("uiDistinctivefeatures") + "[/b] ";
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
        text += " [b]" + _loc_($(this).attr("attribute")) + " (" + _ui_("uiFavoured") + ")[/b]: " + parseInt($(this).find("input").attr("value") || "0", 10);
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
    text += "[b]" + _ui_("uiCommonSkills") + "[/b]";
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
    text += "[b]" + _ui_("uiWeaponSkills") + "[/b]";
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
        text += " [b]"+_ui_("uiWSDamage")+"[/b]: "+ $(this).find(".weaponSkillDamageInput").attr("value");
        text += " [b]"+_ui_("uiWSEdge")+"[/b]: "+ $(this).find(".weaponSkillEdgeInput").attr("value");
        text += " [b]"+_ui_("uiWSInjury")+"[/b]: "+$(this).find(".weaponSkillInjuryInput").attr("value");
        text += " [b]"+_ui_("uiEnc")+"[/b]: "+$(this).find(".weaponSkillEncInput").attr("value");
        */
    });
    text += "[/list]";

    // Rewards
    text += " [b]" + _ui_("uiRewards") + "[/b]: ";
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
    text += "[b]" + _ui_("uiVirtues") + "[/b]: ";
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
    text += "[b]" + _ui_("uiGear") + "[/b]";
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
            text += " [b]" + _ui_("uiWSDamage") + "[/b]: " + damage;
            text += " [b]" + _ui_("uiWSEdge") + "[/b]: " + edge;
            text += " [b]" + _ui_("uiWSInjury") + "[/b]: " + injury;
            text += " [b]" + _ui_("uiEnc") + "[/b]: " + enc;
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
        text += " [b]" + _ui_("uiEnc") + "[/b]: " + $(this).find(".gearEnc").attr("value");
        text += ($(this).find(".gearCarriedStatus").attr("on") == "true") ? "" : " (not carried)";
        text += "\n";
    });
    text += "[/list]\n";


    // Round stats
    $(".roundStatBox,.subRoundStatBox").each(function (index) {
        text += "[b]" + _ui_("ui" + $(this).attr("stat")) + "[/b]: " + parseInt($(this).find("input").attr("value") || "0", 10) + " ";
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
        userFullName = prompt(_ui_("uiOnlineRegisterFullNameText"));
    } while (userFullName == "");

    if (userFullName == null) {
        return;
    }
    var username = "";
    do {
        username = prompt(_ui_("uiOnlineRegisterUsernameText"));
    } while (username == "");
    if (username == null) {
        return;
    }
    var password = "";
    do {
        password = prompt(_ui_("uiOnlineRegisterPasswordText"));
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
		    var characters = $(response);
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
		        cell = $("<td>" + _ui_(isPublic ? "uiPublic" : "uiPrivate") + "</td>");
		        $(row).append(cell);
		        cell = $("<td class='actions'><button class='characterLoadButton'>" + _ui_("uiLoadOnlineCharacter") + "</button><button class='characterDeleteButton'>" + _ui_("uiDeleteOnlineCharacter") + "</button></td>");
		        $(row).append(cell);
		        $(row).find(".characterLoadButton").click(function () {
		            serverLoad(username, password, characterName);
		        });
		        $(row).find(".characterDeleteButton").click(function () {
		            if (confirm(_ui_("uiConfirmDeleteOnlineCharacter"))) {
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
		    var characters = $(response);
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
		        cell = $("<td class='actions'><button class='characterLoadButton'>" + _ui_("uiLoadOnlineCharacter") + "</button></td>");
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
		        var message = _ui_("uiRemotelyChanged", synchLocalCharacterEdition.edition, synchRemoteCharacterEdition.edition);
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
	if (id != undefined){
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
		        alert("Error: "+xhr.status);
		        return;
		    }
		    // All new messages
		    var messages = $(response);
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
        var text = _ui_(key);
        slideWindow.find("legend").html(title);
        slideWindow.find(".text").html(text);
    });
    // Buttons
    elements.filter(".button").each(function () {
        var label = _ui_($(this).attr("label"));
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
			var newTrigger = $("<input type='hidden' class='trigger' overseer='"+triggerOverseer+"' selector='"+triggerSelector+"' event='"+triggerEvent+"'>");
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
