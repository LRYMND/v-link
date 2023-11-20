########################################
#                                      #
#          CANBUS TEST SCRIPT          #
#                                      #
########################################

import can
import random
import time
import struct


# Initial values
INTAKE = 20.0
BOOST = 1.0
COOLANT = 90.0
LAMBDA1 = .01
LAMBDA2 = 0.85
VOLTAGE = 14.0

VALUES = [INTAKE, BOOST, COOLANT, LAMBDA1, LAMBDA2, VOLTAGE]
TEMPLATE = [0xcd, 0x7a, 0xa6, 0x00, 0x00, 0x40, 0x0, 0x0]

CAN_BUS = can.interface.Bus(channel='vcan0', bustype='socketcan', bitrate=500000)

def check_message(message):
    # Define the request array
    request = [
        [0x12, 0x9D],
        [0x10, 0xCE],
        [0x10, 0xD8],
        [0x10, 0x0A],
        [0x10, 0x34],
        [0x10, 0x2C],
    ]

    # Check if the 4th and 5th bytes match any entry in the request array
    for index, req in enumerate(request):
        if list(message.data[3:5]) == req:
            send_message(req)
            return True  # Match found
        
    return False  # No match found

def send_message(id):
    TEMPLATE[3:5] = list(id)
    
    # Generate a random offset in the range [-0x10, 0x10]
    random_offset = random.randint(-0x01, 0x01)
    TEMPLATE[5:6] = struct.pack('>B', (TEMPLATE[5] + random_offset) & 0xFF)
    response_message = can.Message(arbitration_id=0x00400021, data=TEMPLATE, is_extended_id=True)

    # Send the response
    CAN_BUS.send(response_message)



def main():
    try:
        # Enter a loop to continuously check for messages on vcan0
        while True:
            message = CAN_BUS.recv()
            check_message(message)

    except KeyboardInterrupt:
        print("Script terminated by user.")

if __name__ == "__main__":
    main()