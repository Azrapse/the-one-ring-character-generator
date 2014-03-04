define(["jquery", "jquery.linq"], function ($) {
    var Gamedata = {};
    Gamedata.HtmlToJson = function (selector) {
        var root = $(selector);
        var data = {};
        // Cultures
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
        return data;
    };

    return Gamedata;
});