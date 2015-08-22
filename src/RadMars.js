var radmars = {
    maybeSwitchAnimation: function(renderable, a, returnToIdle) {
        if( ! renderable.isCurrentAnimation(a) ){
            radmars.playAnimation(renderable, a, returnToIdle);
        }
    },

    playAnimation: function(renderable, a, returnToIdle) {
        var cb = returnToIdle ? renderable.setCurrentAnimation.bind(renderable, "idle") : null;
        renderable.setCurrentAnimation(a, cb);
    },
};

