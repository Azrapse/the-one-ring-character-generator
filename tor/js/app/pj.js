define(["extends", "character", "gamedata", "json"], function (_extends, Character, Gamedata) {

    var Pj = (function (_super) {
        _extends(Pj, Character);

        function Pj(jsonOrName) {
            _super.call(this);
            try {
                fromJson.call(this, jsonOrName);
            }
            catch (ex) {
                if (jsonOrName && jsonOrName.length && jsonOrName.length <= 100) {
                    this.name = jsonOrName;
                }
            }

        }

        Pj.prototype.toString = function () {
            return "PJ " + this.name;
        };

        var fromJson = function (json) {
            var data = JSON.parse(json);
            switch ("" + data.version) {
                case "2":
                    fromJsonV2.call(this, data);
                    break;

                case "3":
                    fromJsonV3.call(this, data);
                    break;

                default:
                    throw "Unsupported character version";
            }
        }

        var fromJsonV2 = function (data) {
            for (prop in data) {
                if (!(data.hasOwnProperty(prop))) {
                    continue;
                }

                if (prop === "version") {
                    continue;
                }

                if (prop in Gamedata.attributes) {
                    this.attributeScores = this.attributeScores || {};
                    this.attributeScores[prop] = data[prop];
                    continue;
                }

                if (prop in { favouredbody: true, favouredheart: true, favouredwits: true }) {
                    this.attributeFavouredScores = this.attributeFavouredScores || {};
                    var attribute = prop.replace("favoured", "");
                    this.attributeFavouredScores[attribute] = data[prop];
                    continue;
                }

                if (prop in Gamedata.skills) {
                    this.skillScores = this.skillScores || {};
                    this.skillScores[prop] = data[prop];
                    continue;
                }

                if (prop in Gamedata.skillGroups) {
                    this.skillGroupScores = this.skillGroupScores || {};
                    this.skillGroupScores[prop] = data[prop];
                    continue;
                }


                if (prop === "weaponSkills" || prop === "weaponGear" || prop == "gear") {
                    this[prop] = {};
                    for (var i = 0; i < data[prop].length; i++) {
                        var ws = data[prop][i];
                        this[prop][ws.id] = ws;
                    }
                    continue;
                }

                if (prop === "comments") {
                    this[prop] = {};
                    for (var i = 0; i < data[prop].length; i++) {
                        var comm = data[prop][i];
                        this[prop][comm["for"]] = comm.text;
                    }
                    continue;
                }

                this[prop] = data[prop];
            }
        };

        var fromJsonV3 = function (data) {
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    this[prop] = data[prop];
                }
            }
        };

        return Pj;
    })(Character);

    return Pj;
});

/*
{"version":"2","edition":"184","name":"Abredul","culture":"beorning","standard":"martial","culturalBlessing":"furious","calling":"warden","shadowWeakness":"lureOfPower","specialties":["anduinLore","storyTelling","shadowLore"],"features":["grim","hardy","resentful"],"favoured":["awe","athletics","explore","lore"],"awe":3,"inspire":1,"persuade":1,"athletics":2,"travel":2,"stealth":1,"awareness":2,"insight":3,"search":1,"explore":2,"healing":1,"hunting":3,"riddle":2,"craft":1,"battle":2,"lore":1,"personality":1,"movement":1,"survival":1,"custom":2,"body":6,"heart":5,"wits":3,"favouredbody":8,"favouredheart":8,"favouredwits":4,"endurance":"29","startingEndurance":"29","fatigue":"17","fatigueTravel":"2","fatigueTotal":"19","hope":"7","startingHope":"15","shadow":"11","permanentShadow":"1","totalShadow":"12","armour":"3d","headgear":"+1","parry":"3","shield":"","damage":"6","ranged":"6","wisdom":"3","valour":"3","experience":"8","total":"46","fellowshipPoints":"5","advancementPoints":"0","treasurePoints":"3","standing":"1","carried":false,"weary":false,"miserable":true,"wounded":false,"woundTreated":false,"virtues":["nightGoer","confidence"],"rewards":["giantSlayingSpear","keen"],"weaponSkills":[{"id":"greatSpear","favoured":true,"rank":4},{"id":"axe","favoured":false,"rank":1},{"id":"dagger","favoured":false,"rank":2},{"id":"bow","favoured":false,"rank":1}],"weaponGear":[{"id":"greatSpear","stats":{"damage":"9","edge":"8","injury":"16","enc":"4"},"carried":true},{"id":"axe","stats":{"damage":"5","edge":"G","injury":"18","enc":"2"},"carried":false},{"id":"dagger","stats":{"damage":"3","edge":"G","injury":"12","enc":"0"},"carried":true},{"id":"bow","stats":{"damage":"5","edge":"10","injury":"14","enc":"1"},"carried":true}],"gear":[{"id":"mailShirt","enc":"12","carried":true,"specificSlot":0},{"id":"capOfIronAndLeather","enc":"2","carried":false,"specificSlot":1}],"backgroundText":"","guideText":"Abredul","scoutText":"Pelo","huntsmanText":"","lookoutText":"Nileth","fellowshipFocusText":"Nileth","fellowshipNotesText":"Estatus%20con%20%E1guilas%201%0A-------------------------------------%0A%C1guila%20perdida%20en%20el%20bosque%20negro%3A%20Lintirith%0ARey%20de%20Rhovannion%20%28autoproclamado%29%3A%20Rey%20Balter%0AHombre%20criatura%20-%20Sigmund%0ANi%F1o%20desaparecido%3A%20en%20la%20caba%F1a%20del%20cu%F1ado%20de%20Sigmund%0AIndividuo%20misterioso%20nos%20persigue%0ABeornidas%20corrompidos%0ASe%F1or%20fam%E9lico%20/%20procurador%20de%20la%20muerte%20/%20Urcheron","sanctuariesText":"Esgaroth","patronText":"Gl%F3in","coins":{"gold":"","silver":"","copper":""},"inventory":[],"taleOfYears":[],"comments":[{"for":"keen","text":"Lanza"}]}

{
  "version": "2",
  "edition": "184",
  "name": "Abredul",
  "culture": "beorning",
  "standard": "martial",
  "culturalBlessing": "furious",
  "calling": "warden",
  "shadowWeakness": "lureOfPower",
  "specialties": [
    "anduinLore",
    "storyTelling",
    "shadowLore"
  ],
  "features": [
    "grim",
    "hardy",
    "resentful"
  ],
  "favoured": [
    "awe",
    "athletics",
    "explore",
    "lore"
  ],
  "awe": 3,
  "inspire": 1,
  "persuade": 1,
  "athletics": 2,
  "travel": 2,
  "stealth": 1,
  "awareness": 2,
  "insight": 3,
  "search": 1,
  "explore": 2,
  "healing": 1,
  "hunting": 3,
  "riddle": 2,
  "craft": 1,
  "battle": 2,
  "lore": 1,
  "personality": 1,
  "movement": 1,
  "survival": 1,
  "custom": 2,
  "body": 6,
  "heart": 5,
  "wits": 3,
  "favouredbody": 8,
  "favouredheart": 8,
  "favouredwits": 4,
  "endurance": "29",
  "startingEndurance": "29",
  "fatigue": "17",
  "fatigueTravel": "2",
  "fatigueTotal": "19",
  "hope": "7",
  "startingHope": "15",
  "shadow": "11",
  "permanentShadow": "1",
  "totalShadow": "12",
  "armour": "3d",
  "headgear": "+1",
  "parry": "3",
  "shield": "",
  "damage": "6",
  "ranged": "6",
  "wisdom": "3",
  "valour": "3",
  "experience": "8",
  "total": "46",
  "fellowshipPoints": "5",
  "advancementPoints": "0",
  "treasurePoints": "3",
  "standing": "1",
  "carried": false,
  "weary": false,
  "miserable": true,
  "wounded": false,
  "woundTreated": false,
  "virtues": [
    "nightGoer",
    "confidence"
  ],
  "rewards": [
    "giantSlayingSpear",
    "keen"
  ],
  "weaponSkills": [
    {
      "id": "greatSpear",
      "favoured": true,
      "rank": 4
    },
    {
      "id": "axe",
      "favoured": false,
      "rank": 1
    },
    {
      "id": "dagger",
      "favoured": false,
      "rank": 2
    },
    {
      "id": "bow",
      "favoured": false,
      "rank": 1
    }
  ],
  "weaponGear": [
    {
      "id": "greatSpear",
      "stats": {
        "damage": "9",
        "edge": "8",
        "injury": "16",
        "enc": "4"
      },
      "carried": true
    },
    {
      "id": "axe",
      "stats": {
        "damage": "5",
        "edge": "G",
        "injury": "18",
        "enc": "2"
      },
      "carried": false
    },
    {
      "id": "dagger",
      "stats": {
        "damage": "3",
        "edge": "G",
        "injury": "12",
        "enc": "0"
      },
      "carried": true
    },
    {
      "id": "bow",
      "stats": {
        "damage": "5",
        "edge": "10",
        "injury": "14",
        "enc": "1"
      },
      "carried": true
    }
  ],
  "gear": [
    {
      "id": "mailShirt",
      "enc": "12",
      "carried": true,
      "specificSlot": 0
    },
    {
      "id": "capOfIronAndLeather",
      "enc": "2",
      "carried": false,
      "specificSlot": 1
    }
  ],
  "backgroundText": "",
  "guideText": "Abredul",
  "scoutText": "Pelo",
  "huntsmanText": "",
  "lookoutText": "Nileth",
  "fellowshipFocusText": "Nileth",
  "fellowshipNotesText": "Estatus%20con%20%E1guilas%201%0A-------------------------------------%0A%C1guila%20perdida%20en%20el%20bosque%20negro%3A%20Lintirith%0ARey%20de%20Rhovannion%20%28autoproclamado%29%3A%20Rey%20Balter%0AHombre%20criatura%20-%20Sigmund%0ANi%F1o%20desaparecido%3A%20en%20la%20caba%F1a%20del%20cu%F1ado%20de%20Sigmund%0AIndividuo%20misterioso%20nos%20persigue%0ABeornidas%20corrompidos%0ASe%F1or%20fam%E9lico%20\/%20procurador%20de%20la%20muerte%20\/%20Urcheron",
  "sanctuariesText": "Esgaroth",
  "patronText": "Gl%F3in",
  "coins": {
    "gold": "",
    "silver": "",
    "copper": ""
  },
  "inventory": [
    
  ],
  "taleOfYears": [
    
  ],
  "comments": [
    {
      "for": "keen",
      "text": "Lanza"
    }
  ]
}
*/