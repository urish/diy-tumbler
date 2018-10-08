// Tumbling Machine Firmware for Pixl.js board
// Copyright (C) 2018, Uri Shaked
// License: MIT

const PIN_ENABLE = D2; // Connected to !SLP / !RST pin of Stepper Driver
const PIN_STEP = D3;
const PIN_DIRECTION = D4;
const PIN_SENSOR = A0; // Set to null to disable magnetic revolution sensor

const stepResolution = 1; // how many pulses per step (1 = full step mode)
const stepsPerRotation = 200;

const pulsesPerRotation = stepsPerRotation * stepResolution;
const stepsPerRPM = pulsesPerRotation / 60;
const buttonDelta = stepsPerRPM * 1;
const acceleration = stepsPerRPM * 15;
const startSpeed = 20 * stepsPerRPM;
let targetSpeed = 45 * stepsPerRPM;
let lastTime = 0;
let direction = 1;
let enabled = 0;
let lastSensorTime = 0;
let revolutionCounter = 0;
let recoveryStage = 0;

let speed = startSpeed;

require("FontDennis8").add(Graphics);
const glyphs = {
  UP: "\x82",
  DOWN: "\x83",
  PLAY: "\x89",
  PAUSE: "\x8d",
  REWIND: "\xab",
  FORWARD: "\xbb",
};

function updateScreen() {
  g.clear();

  const rpm = Math.round((enabled ? speed : targetSpeed) / pulsesPerRotation * 60);
  g.setFontAlign(0, 1, 0);
  g.setFontVector(20);
  g.drawString(rpm, g.getWidth() / 2, 24);
  g.setFontVector(12);
  g.drawString("RPM", g.getWidth() / 2, 44);

  g.setFontBitmap();
  g.drawString(revolutionCounter, g.getWidth() / 2, 60);

  // Draw buttons
  g.setFontDennis8();
  g.setFontAlign(-1, -1, 0);
  g.drawString(glyphs.UP, 0, 0); // Arrow up
  g.setFontAlign(1, -1, 0);
  g.drawString(glyphs.DOWN, g.getWidth() - 1, 0); // Arrow down
  g.setFontAlign(1, 1, 0);
  g.drawString(enabled ? glyphs.PAUSE : glyphs.PLAY, g.getWidth() - 1, g.getHeight() - 1);
  g.setFontAlign(-1, -1, 0);
  g.drawString(direction ? glyphs.FORWARD : glyphs.REWIND, 0, g.getHeight() - 8);

  g.flip();
}

function increaseSpeed() {
  let delta = buttonDelta;
  targetSpeed += delta;
  if (!speed) {
    speed = targetSpeed;
  }
}

function decreaseSpeed() {
  let delta = buttonDelta;
  if (targetSpeed < delta) {
    targetSpeed = 0;
    return;
  }
  targetSpeed -= delta;
}

function changeDirection() {
  direction = !direction;
  digitalWrite(PIN_DIRECTION, direction);
  speed = startSpeed;
}

function toggleMotor() {
  enabled = !enabled;
  speed = startSpeed;
  recoveryStage = 0;
  lastTime = getTime();
  lastSensorTime = getTime();
}

function setSpeed(speed) {
  digitalWrite(PIN_ENABLE, 1);
  analogWrite(PIN_STEP, 0.5, {freq: speed});
}

function accelerate() {
  if (!enabled || !speed) {
    digitalWrite(PIN_ENABLE, 0);
    updateScreen();
    return;
  }

  const delta = getTime() - lastTime;
  const actualAcceleration = acceleration * (1 - (speed / targetSpeed));
  if (speed < targetSpeed) {
    speed = Math.min(targetSpeed, Math.round(speed + acceleration * delta));
    setSpeed(speed);
  }
  if (speed > targetSpeed) {
    speed = Math.max(targetSpeed, Math.round(speed - acceleration * delta));
    setSpeed(speed);
  }

  lastTime = getTime();
  updateScreen();
}

function stop() {
  digitalWrite(PIN_ENABLE, enabled = 0);
}

function checkSensor() {
  if (!enabled) {
    return;
  }
  const delta = getTime() - lastSensorTime;
  let newSpeed = null;
  if (delta > 5 && !recoveryStage) {
    newSpeed = speed / 2;
    recoveryStage = 1;
  } else if (delta > 15 && recoveryStage === 1) {
    newSpeed = stepsPerRPM * 10;
    recoveryStage = 2;
  } else if (delta > 30 && recoveryStage === 2) {
    newSpeed = stepsPerRPM * 5;
    recoveryStage = 3;
  } else if (delta > 60) {
    // We haven't been able to recover, give up
    stop();
  }
  if (newSpeed) {
    speed = newSpeed;
    setSpeed(speed);
  }
}

function sensorHit(e) {
  if (e.time - e.lastTime < 0.1) {
    // This is probably noise - we don't go faster than 600RPM, so we shouldn't be getting 10
    // events per second.
    return;
  }

  lastSensorTime = e.time;
  recoveryStage = 0;
  revolutionCounter++;
}

function onInit() {
  LED.set();

  setInterval(accelerate, 1);
  if (PIN_SENSOR != null) {
    setInterval(checkSensor, 100);
    setWatch(sensorHit, PIN_SENSOR, { repeat: true, edge: 'falling' });
  }

  // Button handlers
  setWatch(increaseSpeed, BTN1, {edge:"rising", debounce:50, repeat:true});
  setWatch(decreaseSpeed, BTN2, {edge:"rising", debounce:50, repeat:true});
  setWatch(toggleMotor, BTN3, {edge:"rising", debounce:50, repeat:true});
  setWatch(changeDirection, BTN4, {edge:"rising", debounce:50, repeat:true});

  // Motor control
  digitalWrite(PIN_DIRECTION, direction);
  digitalWrite(PIN_ENABLE, enabled);
}
