// Tumbling Machine - Motor Hub
// Copyright (C) 2018, Uri Shaked
// License: MIT

include <MCAD/units.scad>

$fn = 60;

mountWidth = 1.725 * inch;
mountThickness = 3;
pilotRadius = 0.433 * inch;
mountHoleDistance = 1.220 * inch;
mountHoleRadius = 1.5;
tolerance = 0.15;

module Nema17Mount() {
    difference() {
        translate([-mountWidth / 2, -mountWidth / 2, 0])
        cube([mountWidth, mountWidth, mountThickness]);

        translate([0,0,-0.05])
        cylinder(r=pilotRadius+tolerance, h=mountThickness + 0.1);

        // Motor mounting holes
        for (x=[0,1]) for (y=[0,1])
            mirror([x,y,0])
            translate([mountHoleDistance / 2, mountHoleDistance / 2,-0.05])
            cylinder(r=mountHoleRadius + tolerance,h = mountThickness + 0.1);
    }
}

Nema17Mount();
