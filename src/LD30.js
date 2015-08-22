var screenHeight = 560;
var screenWidth = 960;
var goodEnd = true;

var LD30 = function() {

    /**
     * Start stuff when the page loads.
     */
    this.onload = function() {
        if ( !me.video.init( 'canvas', screenWidth, screenHeight ) ) {
            alert ("Yer browser be not workin");
        }

        this.options = {};

        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            this.options[key] = value;
        }.bind(this));

        // add "#debug" to the URL to enable the debug Panel
        if (this.options.debug) {
            me.plugin.register(debugPanel, "debug");
            me.plugin.debug.show();
        }

        me.input.preventDefault = true;

        me.audio.init ("m4a,ogg" );

        // Sync up post loading stuff.
        me.loader.onload = this.loaded.bind( this );

        me.loader.preload( GameResources );

        me.state.change( me.state.LOADING );


        return;
    };

    /**
     * Do stuff post-resource-load.
     */
    this.loaded = function() {

        me.state.set( me.state.INTRO, new RadmarsScreen() );
        me.state.set( me.state.MENU, new TitleScreen() );
        me.state.set( me.state.PLAY, new PlayScreen() );
        me.state.set( me.state.GAMEOVER, new GameOverScreen() );

        me.state.change( me.state.INTRO);

        me.pool.register( "player", Player );
        me.pool.register( "baddie", Baddie );
        me.pool.register( "corpse", Corpse );

        me.pool.register( "fish", Fish );
        me.pool.register( "wasp", Wasp );

        me.pool.register( "pickup", Pickup );
        me.pool.register( "levelchanger", LevelChanger );
        me.pool.register( "gameender", GameEnder );
    };
};


LD30.data = {souls:1, collectedSouls:0, collectedSoulsMax:15, beatGame:false};

LD30.HUD = LD30.HUD || {};

LD30.HUD.Container = me.ObjectContainer.extend({
    init: function() {
        // call the constructor
        this.parent();

        this.isPersistent = true;
        this.collidable = false;

        this.boxDisplay = new LD30.HUD.BoxDisplay(0, 0);
        this.addChild(this.boxDisplay);

        // make sure our object is always draw first
        this.z = Infinity;
        this.name = "HUD";
    },

    startGame:function(){
        this.boxDisplay.startGame();
    },

    endGame: function(){
        this.boxDisplay.endGame();
    }
});

LD30.HUD.BoxDisplay = me.Renderable.extend( {

    init: function(x, y) {

        // call the parent constructor
        // (size does not matter here)
        this.parent(new me.Vector2d(x, y), 0, 0);

        // create a font
        this.font = new me.BitmapFont("32x32_font", 32);
        //this.font.set("right");

        this.box = me.loader.getImage("selectBox");

        this.render = false;

        // make sure we use screen coordinates
        this.floating = true;

        this.mouseDown = false;
        this.mouseDownPos = new me.Vector2d(0, 0);
        this.mousePosLocal = new me.Vector2d(0, 0);

        // enable the keyboard
        me.input.bindKey(me.input.KEY.O, "proxy_mouse");
        me.input.bindPointer(me.input.KEY.O);
        me.input.bindPointer(me.input.mouse.LEFT, me.input.KEY.O);


    },

    startGame: function(){
        this.render = true;

        /*
        var self = this;
        new me.Tween(self.findGatePos).to({x:100}, 500).easing(me.Tween.Easing.Quintic.Out).delay(1000).onComplete(function(){
            new me.Tween(self.findGatePos).to({x:1000}, 1000).easing(me.Tween.Easing.Quintic.In).delay(2000).onComplete(function(){
                self.showFindGate = false;
            }).start();
        }).start();
        */
    },

    endGame: function(){
        this.render = false;
    },

    update : function () {
        if (me.input.isKeyPressed('proxy_mouse'))  {
            if( !this.mouseDown ){
                this.mouseDown = true;
                this.mouseDownPos.x = me.input.mouse.pos.x;
                this.mouseDownPos.y = me.input.mouse.pos.y;
            }

        }else{
            if( this.mouseDown ){
                this.mouseDown = false;
            }
        }

        return true;
    },

    draw : function (context) {
        if(!this.render)return;

        //void ctx.drawImage(image, dx, dy, dWidth, dHeight);
        //this.pos.x +
        // this.pos.y +

        // this.mouseDownPos.x = me.input.mouse.pos.x;
        // this.mouseDownPos.y = me.input.mouse.pos.y;

       // this.font.draw (context, this.souls, this.pos.x + 50, this.pos.y + 30);

        if(this.mouseDown){
            //this.mousePosLocal  = me.input.globalToLocal(me.input.mouse.pos.x, me.input.mouse.pos.y );

            var player = me.state.current().player;

            console.log( "mouse! " + (me.input.mouse.pos.x + me.game.viewport.pos.x)  + " , " +  (me.input.mouse.pos.y + me.game.viewport.pos.y) + " / player: " + player.pos.x + " , " + player.pos.y );
            //console.log( "mouse! " +  me.input.mouse.pos.x  + " , " +  me.input.mouse.pos.y );

            context.drawImage( this.box, this.mouseDownPos.x, this.mouseDownPos.y, me.input.mouse.pos.x - this.mouseDownPos.x, me.input.mouse.pos.y - this.mouseDownPos.y );
        }

    }
});


var LevelChanger = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // TODO: Just bake image or attach to obj?
        settings.image = "gateway";
        settings.spritewidth = 144;
        settings.spriteheight = 192;
        this.toLevel = settings.toLevel;
        this.parent( x, y, settings );
        this.gravity = 0;
        this.collidable = true;
        this.flipX(true);
    },
    update: function(dt) {
        // TODO: Just bake image or attach to obj?
        this.parent(dt);
        this.updateMovement();

        me.game.world.collide(this, true).forEach(function(col) {
            if(col && col.obj == me.state.current().player  ) {
                me.state.current().goToLevel(this.toLevel);
            }
        }, this);
    }
});

var GameEnder = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // TODO: Just bake image or attach to obj?
        settings.image = settings.image || 'pickup';
        settings.spritewidth =  69;
        settings.spriteheight = 117;
        this.toLevel = settings.toLevel;
        this.parent( x, y, settings );
        this.gravity = 0;
        this.collidable = true;
        this.flipX(true);
    },
    update: function(dt) {
        // TODO: Just bake image or attach to obj?
        this.parent(dt);
        this.updateMovement();

        me.game.world.collide(this, true).forEach(function(col) {
            if(col && col.obj == me.state.current().player  ) {
                LD30.data.collectedSouls += LD30.data.souls;
                LD30.data.souls = 0;
                me.state.current().endGame();
            }
        }, this);
    }
});

var Zombie = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = 'zombie';
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.height = 16;
        settings.width = 16;
        this.parent(x, y, settings);
        this.z = 300;
        this.zombie = true;
    },
});


var Corpse = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        settings = settings || {};
        settings.image = 'corpse';
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.height = 16;
        settings.width = 16;
        this.parent(x, y, settings);
        this.z = 300;
        this.corpse = true;
    },

    convertToZombie: function() {
        me.game.world.removeChild(this);
        var z = new Zombie(this.pos.x, this.pos.y);
        me.game.world.addChild(z);
    },
});

/** The game play state... */
var PlayScreen = me.ScreenObject.extend({
    init: function() {
        this.parent( true );
        me.input.bindKey(me.input.KEY.SPACE, "shoot");
        this.playerArmy = [];
        this.baddies = [];
        this.pickups = [];
        this.subscription = me.event.subscribe(me.event.KEYDOWN, this.keyDown.bind(this));

        this.HUD = new LD30.HUD.Container();
        me.game.world.addChild(this.HUD);
        LD30.data.beatGame = false;

    },

    endGame: function(){
        LD30.data.beatGame = true;
        me.state.change( me.state.GAMEOVER );
    },

    goToLevel: function( level ) {
        this.baddies = [];
        this.pickups = [];
        me.levelDirector.loadLevel( level );
        me.state.current().changeLevel( level );
        this.HUD.startGame();

    },

    keyDown: function( action ) {
        if(action == "shoot") {
            this.player.shoot();
        }
    },

    getLevel: function() {
        return this.parseLevel( me.levelDirector.getCurrentLevelId() );
    },

    parseLevel: function( input ) {
        var re = /level(\d+)/;
        var results = re.exec( input );
        return results[1];
    },

    /** Update the level display & music. Called on all level changes. */
    changeLevel: function( level ) {
        me.audio.mute( "ld30-spirit" );
        me.audio.unmute( "ld30-real" );

        // TODO: Makethis track the real variable...
        // this only gets called on start?
        me.game.world.sort();

        me.game.viewport.fadeOut( '#000000', 1000, function() {
        });
    },

    // this will be called on state change -> this
    onResetEvent: function() {
        this.baddies = [];
        this.pickups = [];
        this.overworld = true;
        LD30.data.beatGame = false;
        LD30.data.collectedSouls = 0;
        LD30.data.souls = 1;
        var level =  location.hash.substr(1) || "level1" ;
        me.levelDirector.loadLevel( level );

        me.audio.stopTrack();
        me.audio.play( "ld30-real", true );
        me.audio.play( "ld30-spirit", true );
        me.audio.play( "portalrev" );

        this.changeLevel( level );
        this.HUD.startGame();

        for(var i = 0; i < 30; i++) {
            var x = Math.random() * 500;
            var y = Math.random() * 500;
            var c = new Corpse(x, y);
            me.game.world.addChild(c);
        }

    },

    onDestroyEvent: function() {
        this.HUD.endGame();
        me.audio.stop("ld30-real");
        me.audio.stop("ld30-spirit");
    },

});


window.onReady(function() {
    window.app = new LD30();
    window.app.onload();
});
