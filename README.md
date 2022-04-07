# Avatar Legends

A simple, unofficial [Foundry VTT](https://foundryvtt.com/) system for [Magpie Games](https://magpiegames.com/)' [Avatar Legends: The RPG](https://magpiegames.com/pages/avatarrpg).

## Installation

There are two ways to install this package:

* From your Foundry VTT instance's config panel:
    * Navigate to "Game Systems"
    * Click "Install System"
    * Paste this repo's manifest url in the "Manifest URL" field: `https://raw.githubusercontent.com/ian-mcdevitt/avatarlegends/main/system.json`
    * Click "Install"!
* As a zip file:
    * Choose a specific [release](https://github.com/ian-mcdevitt/avatarlegends/releases) from the repository
    * Download the associated zip file
    * Unzip that file into your Foundry VTT instance's `/Data/systems` directory

If the version you installed is prior to v1.0.0, update at your own risk; much of the Actor functionality is in flux.

## Overview

This system is released under the MIT license described in [LICENSE.txt](LICENSE.txt), and its copyright belongs to its contributors.

Forked from the [Monster of the Week System](https://gitlab.com/3cell/monsterweek.git).

## Changes I'd like to make:

* v1.0.0 Planned Changes:
    * General code quality improvements; clean up code cruft
        * Actually use the .less file
    * Character sheet needs to be way less ugly
* Post-v1.0.0 Changes:
    * Add a way to roll with an NPC's principle
    * Have moves' miss/weakhit/stronghit rules show up in chat
    * A way to track, interact with, or include playbook features
    * Add a "taken out" indicator if fatigue and conditions are maxed
    * Actual fields for forward/ongoing (with scope levels: all, stat, move, etc)
    * Moves should have fields for basic/balance/playbook/game-system, which playbook it belongs to if playbook

## Versioning:

* Prior to v1.0.0, under semver, patch versions will be bugfixes and tweaks, and minor versions will be new features that may break functionality. All of these versions will be tagged -alpha.
* v1.0.0 will be released when I feel like this system exhaustively allows you to play **AL:TRPG**. I will likely go through an internal alpha, a public beta, then a full release.
* After v1.0.0, I will follow semver (major version for breaking changes, minor version for new features, patch version for bugfixes).
