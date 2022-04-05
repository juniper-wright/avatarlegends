# Avatar Legends

A simple, unofficial [Foundry VTT](https://foundryvtt.com/) system for [Magpie Games](https://magpiegames.com/)' [Avatar Legends: The RPG](https://magpiegames.com/pages/avatarrpg).

## Installation

// TODO add install instructions

## Overview

This system is released under the MIT license described in [LICENSE.txt](LICENSE.txt), and its copyright belongs to its contributors.

Forked from the [Monster of the Week System](https://gitlab.com/3cell/monsterweek.git).

## Changes I'd like to make:

* General code audit, to remove MotW leftovers
* General code quality improvements
    * Remove the gear group entirely -- Conditions are their own thing, as are Bonuses/holds
    * Clean up code cruft
* PCs should have somewhere to put demeanor, training, fighting style, connections, notes
* Techniques should have fields for playbook, training type, approach, learned level
* Moves should have fields for basic/balance/playbook/game-system, which playbook it belongs to if playbook, associated stat (instead of "rating")
* Make a way to view all PCs' fatigue/conditions/balance (for the GM) or all PCs' balance (for PCs)
* Once the above is done, allow PCs to roll with other PCs' principles
* Add a way to roll with an NPC's principle?
* Once the above is done, add a "taken out" indicator if fatigue and conditions are maxed
* Actual fields for forward/ongoing (with scope levels: all, stat, move, etc)
* A way to track, interact with, or include playbook features
* Build in a way for the player to change their center
* Character sheet needs to be way less ugly
* Have moves' miss/weakhit/stronghit rules show up in chat?

## Versioning:

* Prior to v1.0.0, under semver, patch versions will be bugfixes and tweaks, and minor versions will be new features that may break functionality. All of these versions will be tagged -alpha.
* v1.0.0 will be released when I feel like this system exhaustively allows you to play **AL:TRPG**. I will likely go through an internal alpha, a public beta, then a full release.
* After v1.0.0, I will follow semver (major version for breaking changes, minor version for new features, patch version for bugfixes).
