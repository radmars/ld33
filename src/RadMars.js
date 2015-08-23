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

    assert: function(value, err) {
        if(value == null) {
            throw err;
        }
        return value;
    },

    findTarget: function(searchPosition, potentialTargets, visionRange) {
        var closestDist = null;
        var nextTarget = null;

        potentialTargets.forEach(function(target) {
            var dist = target.pos.distance(searchPosition);
            if (dist < visionRange) {
                if (!closestDist || dist < closestDist) {
                    closestDist = dist;
                    nextTarget = target;
                }
            }
        });

        return nextTarget;
    },
};

