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




    // ui
    _Image("16x16_font"),
    _Image("32x32_font"),
    _Image("selectBox"),
    _Image("hp_bar_ally"),
    _Image("hp_bar_backing"),
    _Image("hp_bar_baddie"),
    _Image("unit_selected"),
    _Image("move_target"),
    _Image("hud"),

    _Image("enter_gateway_1"),
    _Image("enter_gateway_2"),
    _Image("humans_killed_1"),
    _Image("humans_killed_2"),
    _Image("kill_all_humans_1"),
    _Image("kill_all_humans_2"),

    _Image("rune_res"),
    _Image("rune_summon"),

    //splash
    _Image("splash"),
    _Image("introcta"),

    _Image("game_over"),
    _Image("game_win"),

    //particles
    _Image("baddieBullet"),
    _Image("magicMissile"),
    _Image( "bloodstain" ),
    _Image( "bloodsplat" ),
    _Image( "explode_small" ),
    _Image( "explode_big" ),
    _Image( "fireball" ),
    _Image( "fireball_zombie" ),
    _Image( "bullet" ),
    _Image( "bullet_zombie" ),

    //graves
    _Image("grave_1"),
    _Image("grave_2"),
    _Image("grave_3"),
    _Image("gateway"),

    // Corpses
    _Image( "civilian_1_corpse" ),
    _Image( "civilian_2_corpse" ),
    _Image( "civilian_3_corpse" ),
    _Image( "knight_corpse" ),
    _Image( "knight_zombie_corpse" ),
    _Image( "mage_corpse" ),
    _Image( "mage_zombie_corpse" ),
    _Image( "musketeer_corpse" ),
    _Image( "musketeer_zombie_corpse" ),
    _Image( "skeleton_corpse" ),
    _Image( "skeleton_zombie_corpse" ),

    //characters
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
    _Image( "player" ),

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

    // audio
    _Audio( "radmarslogo" ),
    _Audio( "ld33-title" ),
    _Audio( "ld33-1" ),
    _Audio( "ld33-2" ),
    _Audio( "ld33-3" ),
    _Audio( "ld33-lose" ),
    _Audio( "ld33-win" ),

    _Audio("magic"),
    _Audio("magic-hit"),
    _Audio("micromancer"),
    _Audio("musket"),
    _Audio("rise"),
    _Audio("skeletondeath"),
    _Audio("skeletonraise"),
    _Audio("rez"),
    _Audio("rezfail"),
    _Audio("gateopen"),
    _Audio("recall"),
    _Audio("portalrev"),

];

_AddAudioArray("hit", 3, GameResources);
_AddAudioArray("knightdeath", 4, GameResources);
_AddAudioArray("musketeerdeath", 4, GameResources);
_AddAudioArray("magedeath", 5, GameResources);
_AddAudioArray("zombiedeath", 6, GameResources);
_AddAudioArray("zombieraise", 5, GameResources);
_AddAudioArray("playerdeath", 4, GameResources);
