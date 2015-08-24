function _Image( name, path ) {
    return { name: name, type: "image", src: "data/" + name + ".png" };
}

function _Audio( name ) {
    return { name: name, type: "audio", src: "data/audio/" , channels: 2 };
}

function _AddAudioArray( name, num, parent ) {
    for(var i = 1; i <= num; i++) {
        parent.push(_Audio(name + "-" + i));
    }
}

function GetRandomIndexString(max) {
    var index = Math.floor(Math.random() * max) + 1;
    return "-" + index;
}

function _Level( name ) {
    return { name: name, type: "tmx", src: "data/" + name + ".tmx" };
}


var GameResources = [
    /* Radmars Logo */
    _Image( "intro_bg" ),
    _Image( "intro_glasses1" ),
    _Image( "intro_glasses2" ),
    _Image( "intro_glasses3" ),
    _Image( "intro_glasses4" ),
    _Image( "intro_mars" ),
    _Image( "intro_radmars1" ),
    _Image( "intro_radmars2" ),

    // Corpses
    _Image( "mage" ),
    _Image( "mage_zombie" ),
    _Image( "knight" ),
    _Image( "knight_zombie" ),
    _Image( "musketeer" ),
    _Image( "musketeer_zombie" ),

    _Image( "civilian" ),
    _Image( "civilian_zombie" ),

    _Image( "skeleton" ),
    _Image( "skeleton_zombie" ),

    _Image( "corpse" ),

    // ui
    _Image("16x16_font"),
    _Image("32x32_font"),
    _Image("selectBox"),
    _Image("hp_bar_ally"),
    _Image("hp_bar_backing"),
    _Image("hp_bar_baddie"),
    _Image("unit_selected"),
    _Image("move_target"),

    //splash
    _Image("splash"),
    _Image("introcta"),

    _Image("game_over"),
    _Image("game_win"),

    //game
    _Image("tinyman"),

    _Image("baddieBullet"),
    _Image("magicMissile"),

    _Image("grave_1"),
    _Image("grave_2"),
    _Image("grave_3"),
    _Image("gateway"),

    // Levels
    _Image( "collision_tiles"),

    _Image( "world_1_1"),
    _Level( "level1" ),
    _Level( "level2" ),
    _Level( "level3" ),
    _Level( "level4" ),
    _Level( "level5" ),
    _Level( "level6" ),
    _Level( "level7" ),
    _Level( "level8" ),
    _Level( "level9" ),
    _Level( "level10" ),
    _Level( "level_debug_1" ),

    _Audio( "radmarslogo" ),

    _Audio("magic"),
    _Audio("magic-hit"),
    _Audio("micromancer"),
    _Audio("musket"),
    _Audio("rise"),
    _Audio("skeletondeath"),
    _Audio("skeletonraise"),
    _Audio("rez"),
    _Audio("rezfail"),

];

_AddAudioArray("hit", 3, GameResources);
_AddAudioArray("knightdeath", 4, GameResources);
_AddAudioArray("musketeerdeath", 4, GameResources);
_AddAudioArray("magedeath", 5, GameResources);
_AddAudioArray("zombiedeath", 6, GameResources);
_AddAudioArray("zombieraise", 5, GameResources);
_AddAudioArray("playerdeath", 4, GameResources);
