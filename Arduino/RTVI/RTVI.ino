//Lbus = LIN BUS from Car
//Vss = Ground
//Vbb = +12V

// MCP2004 LIN bus frame:
// ZERO_BYTE SYN_BYTE ID_BYTE DATA_BYTES.. CHECKSUM_BYTE

#define DEBUG true

#include "Keyboard.h"
#include "Mouse.h"
#include "SoftwareSerial.h"

// https://github.com/zapta/linbus/tree/master/analyzer/arduino
#include "src/lin_frame.h"

#define CS_PIN 8
// #define FAULT_PIN 14 // After testing, this is not required
#define RX_LED 17
#define LIN_RX_PIN 10
#define LIN_TX_PIN 11 
#define RTI_RX_PIN 2 // not actually used
#define RTI_TX_PIN 4

#define ON_CLICK_DURATION 100 
#define OFF_CLICK_DURATION 3000 // how long to hold "back" button to turn off
#define SWITCH_MOUSE_CLICK_DURATION 2000 // how long to hold "back" button to switch to mouse controls

#define CLICK_TIMEOUT 300

#define RTI_INTERVAL 100

#define MOUSE_BASE_SPEED 8
#define MOUSE_SPEEDUP 3

#define SYN_FIELD 0x55
#define SWM_ID 0x20

// Volvo SWM key codes
// BTN_NEXT       20 0 10 0 0 EF
// BTN_PREV       20 0 2 0 0 FD
// BTN_VOL_UP     20 0 0 1 0 FE
// BTN_VOL_DOWN   20 0 80 0 0 7F
// BTN_BACK       20 0 1 0 0 F7
// BTN_ENTER      20 0 8 0 0 FE
// BTN_UP         20 1 0 0 0 FE
// BTN_DOWN       20 2 0 0 0 FD
// BTN_LEFT       20 4 0 0 0 FB
// BTN_RIGHT      20 8 0 0 0 F7

#define JOYSTICK_UP 0x1
#define JOYSTICK_DOWN 0x2
#define JOYSTICK_LEFT 0x4
#define JOYSTICK_RIGHT 0x8
#define BUTTON_BACK 0x1
#define BUTTON_ENTER 0x8
#define BUTTON_NEXT 0x10
#define BUTTON_PREV 0x2

short rtiStep;

SoftwareSerial LINSerial(LIN_RX_PIN, LIN_TX_PIN);
SoftwareSerial rtiSerial(RTI_RX_PIN, RTI_TX_PIN);

LinFrame frame = LinFrame();

unsigned long currentMillis, lastRtiWrite, buttonDownAt, lastButtonAt, lastJoysticButtonAt;

bool on = false;
bool enableMouse = false;

bool manualOn = false;
byte currentButton, currentJoystickButton;
int mouseSpeed = MOUSE_BASE_SPEED;

void setup() {
  pinMode(RX_LED, OUTPUT);

  pinMode(CS_PIN, OUTPUT);
  digitalWrite(CS_PIN, HIGH);

  //pinMode(FAULT_PIN, OUTPUT);
  //digitalWrite(FAULT_PIN, HIGH);

  // PI connection
  Serial.begin(9600); // virtual (USB) port

  // LIN Bus connection
  LINSerial.begin(9600);

  // RTI Connection
  rtiSerial.begin(2400);

  Keyboard.begin();

  // Turn on RTI
  turn_on();
}

void loop() {
  currentMillis = millis();

  if (LINSerial.available())
    read_lin_bus();

  timeout_button();
  check_ignition_key();
  rti();
}

void read_lin_bus() {
  byte b = LINSerial.read();
  int n = frame.num_bytes();

  if (b == SYN_FIELD && n > 2 && frame.get_byte(n - 1) == 0) {
    digitalWrite(RX_LED, LOW);

    frame.pop_byte();
    handle_swm_frame();
    frame.reset();

    digitalWrite(RX_LED, HIGH);
  } else if (n == LinFrame::kMaxBytes) {
    frame.reset();
  } else {
    frame.append_byte(b);
  }
}

void handle_swm_frame() {
  if (frame.get_byte(0) != SWM_ID)
    return;

  // skip zero values 20 0 0 0 0 FF
  if (frame.get_byte(5) == 0xFF)
    return;

  if (!frame.isValid())
    return;

  //  dump_frame();
  handle_buttons();
  handle_joystick();
}

void handle_joystick() {
    if (!on) return;

  byte button = frame.get_byte(1);

  timeout_joystic_button();

  if (button != currentJoystickButton) {
    currentJoystickButton = button;
    mouseSpeed = MOUSE_BASE_SPEED;

    if (!enableMouse) click_joystick(button);
  }

  if (!enableMouse) return;
  
  switch (button) {
    case JOYSTICK_UP:
      move_mouse(0, -1);
      break;
    case JOYSTICK_DOWN:
      move_mouse(0, 1);
      break;
    case JOYSTICK_LEFT:
      move_mouse(-1, 0);
      break;
    case JOYSTICK_RIGHT:
      move_mouse(1, 0);
      break;
  }
}

void click_joystick(byte button) {
  switch (button) {
    case JOYSTICK_UP:
      Keyboard.write(KEY_UP_ARROW);
      debug("UP");
      break;
    case JOYSTICK_DOWN:
      Keyboard.write(KEY_DOWN_ARROW);
      debug("DOWN");
      break;
    case JOYSTICK_LEFT:
      Keyboard.write(KEY_LEFT_ARROW);
      debug("LEFT");
      break;
    case JOYSTICK_RIGHT:
      Keyboard.write(KEY_RIGHT_ARROW);
      debug("RIGHT");
      break;
  }

  lastJoysticButtonAt = currentMillis;
}

void timeout_joystic_button() {
  if (!currentJoystickButton)
    return;

  if (since(lastJoysticButtonAt) > CLICK_TIMEOUT)
    currentJoystickButton = 0;
}

void move_mouse(int dx, int dy) {
  Mouse.move(dx * mouseSpeed, dy * mouseSpeed, 0);
  mouseSpeed += MOUSE_SPEEDUP;
}

void handle_buttons() {
  byte button = frame.get_byte(2);

  if (!button)
    return;

  if (button != currentButton) {
    release_button(currentButton, since(buttonDownAt));
    click_button(button);

    currentButton = button;
    buttonDownAt = currentMillis;
  }

  lastButtonAt = currentMillis;
}

void timeout_button() {
  if (!currentButton)
    return;

  if (since(lastButtonAt) > CLICK_TIMEOUT)
    release_button(currentButton, since(buttonDownAt));
}

void release_button(byte button, unsigned long clickDuration) {
  switch (button) {
    case BUTTON_ENTER:
      if (!on && clickDuration > ON_CLICK_DURATION) {
        manualOn = true;
        turn_on();
      }
      break;

    case BUTTON_BACK:
      if (clickDuration > OFF_CLICK_DURATION) {
        manualOn = false;
        turn_off();
      }
      break;
    case BUTTON_PREV: 
      if (clickDuration > SWITCH_MOUSE_CLICK_DURATION) {
        if(enableMouse){
          enableMouse = false;
		      Mouse.end();
        }
        else
        {
          enableMouse = true;
		      Mouse.begin();
        }
      }
      break;
  }

  currentButton = 0;
}

void click_button(byte button) {
  if (!on) return;

  switch (button) {
    case BUTTON_ENTER:
	  if (!enableMouse)
        Keyboard.write(32); // Apple Carplay -> Spacebar
      else 
        Mouse.click();
      debug("ENTER");
      break;
    case BUTTON_BACK:
      Keyboard.write(enableMouse ? KEY_ESC : 'M'); // Siri
      debug("ESC");
      break;    
    case BUTTON_PREV:
      Keyboard.write(enableMouse ? KEY_TAB : 'V'); // Previous
      debug("PREV");
      break;
    case BUTTON_NEXT:
      Keyboard.write(enableMouse ? KEY_RETURN : 'N'); // Next
      debug("NEXT");
      break;
  }
}

void turn_on() {
  debug("Turn on");
  on = true;  
}

void turn_off() {
  debug("Turn off");
  on = false;
}

// send serial data to Volvo RTI screen mechanism
//
// 0x40     RTI_RGB    
// 0x46     RTI_OFF
// 0x20     brightness levels
// 0x83     sync

void rti() {
  if (since(lastRtiWrite) < RTI_INTERVAL) return;

  switch (rtiStep) {
    case 0: // mode
      rti_print(on ? 0x40 : 0x46);
      debug(on ? "RTI ON" : "RTI OFF");
      rtiStep++;
      break;

    case 1: // brightness
      rti_print(0x20);
      rtiStep++;
      break;

    case 2: // sync
      rti_print(0x83);
      rtiStep = 0;
      break;
  }

  lastRtiWrite = currentMillis;
}
void rti_print(char byte) {
  rtiSerial.print(byte);
}

// -- debugging

void dump_frame() {
  for (int i = 0; i < frame.num_bytes(); i++) {
    Serial.print(frame.get_byte(i), HEX);
    Serial.print(" ");
  }
  Serial.println();
}

void debug(String message) {
  if (DEBUG)
    Serial.println(message);
}

long since(long timestamp) {
  return currentMillis - timestamp;
}
