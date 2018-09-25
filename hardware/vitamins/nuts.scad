include <MCAD/units.scad>
include <MCAD/materials.scad>

NutM3Radius = 3.2;

module NutM3(height = 2.4, tolerance = 0) {
    color(Steel)
    difference() {
        cylinder(h=height, r=NutM3Radius + tolerance, $fn = 6);

        translate([0, 0, -epsilon/2])
        cylinder(h=height+epsilon, r=1.5 + tolerance, $fn = 60);
    }
}

module NutM3Hole(height = 2.4, tolerance = 0.15, trap = true) {
    cylinder(h=height + tolerance, r=NutM3Radius + tolerance, $fn = 6);

    if (trap) {
        translate([-(NutM3Radius + tolerance), 0, 0])
        cube([(NutM3Radius + tolerance) * 2, (NutM3Radius + tolerance) * 2, height + tolerance]);
    }
}