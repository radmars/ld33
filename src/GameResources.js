function _Image( name, path ) {
    return { name: name, type: "image", src: "data/" + name + ".png" };
}

function _Audio( name ) {
    return { name: name, type: "audio", src: "data/audio/" , channels: 2 };
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
    _Image( "corpse" ),

    // ui
    _Image("16x16_font"),
    _Image("32x32_font"),

    //splash
    _Image("splash"),
    _Image("introcta"),

    _Image("game_over"),
    _Image("game_win"),

    //game
    _Image("tinyman"),

    // Levels
    _Image( "collision_tiles"),

    _Image( "world_1_1"),
    _Level( "level1" ),

    _Audio( "radmarslogo" ),
];
