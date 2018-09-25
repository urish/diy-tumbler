// Tumbling Machine - Motor Hub
// Copyright (C) 2018, Uri Shaked
// License: MIT

include <MCAD/units.scad>
use <../vitamins/nuts.scad>

diameter = 80;
totalHeight = 15;
hubHeight = 10;
hubDiameter = 20;
screwHeight = totalHeight - 5;
tolerance = 0.15;

$fn = 60;

module MotorHub() {
    difference() {
        union() {
            cylinder(h=totalHeight - hubHeight, r=diameter / 2);

            translate([0, 0, totalHeight - hubHeight])
            cylinder(r=hubDiameter / 2, h=hubHeight);
        }

        // motor shaft hole
        translate([0, 0, -epsilon])
        difference() {
            cylinder(r=2.5 + tolerance, h=totalHeight + 2*epsilon);

            translate([2.35 + tolerance, -5, 0])
            cube([10, 10, totalHeight+epsilon]);
        }

        // mounting holes
        for (angle = [0:360 / 8:360])
            rotate([0, 0, angle])
            translate([0, 30, 0])
            cylinder(r=M3 / 2 + tolerance, h=5 + epsilon);

        translate([0, 0, screwHeight]) {
            rotate([0, 90, 0])
            cylinder(h=hubDiameter/2 + epsilon, r = M3 / 2 + tolerance);

            translate([M3 / 2 + 3, 0, 0])
            rotate([90, 0, 90])
            NutM3Hole(2.4);
        }
    }
}

MotorHub();
