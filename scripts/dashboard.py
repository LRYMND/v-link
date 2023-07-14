##################################################
## VOLVO RTVI CAN SCRIPT                        ##
##################################################
## Author: LRYMND                               ##
## Version: 1.0.0                               ##
## Git: https://github.com/LRYMND/volvo-rtvi    ##
##################################################


#IMPORTS
import can
import time
import os
import sys
import json

from threading import Thread


#DEFINE BUS
#FILTER = [{"can_id":REP_ID, "can_mask": 0xFFFFFFFF, "extended": True}]
CAN_BUS = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)


#DEFINE JSON CONFIG
file_path = '/home/pi/.config/Volvo_RTVI/storage/canbus.json'
with open(file_path) as file:
    SETTINGS = json.load(file)


#EXTRACT CONSTANTS FROM JSON CONFIG
REFRESH_RATE =  SETTINGS["timing"]["refresh_rate"]
INTERVAL =      SETTINGS["timing"]["interval"]


#EXTRACT MESSAGES FROM JSON CONFIG
MSG_HS = []
MSG_LS = []

for key, message in SETTINGS['messages'].items():
    # COPY VALUES
    req_id = int(message['req_id'], 16)
    rep_id = int(message['rep_id'], 16)
    target = int(message['target'], 16)
    action = int(message['action'], 16)
    parameter0 = int(message['parameter'][0], 16)
    parameter1 = int(message['parameter'][1], 16)

    #CONSTRUCT BYTE ARRAYS AND STORE PARAMETERS
    req_id_bytes = [
        req_id
    ]
    message_bytes = [
        0xCD, target, action, parameter0, parameter1, 0x01, 0x00, 0x00
    ]
    rep_id_bytes = [
        rep_id
    ]
    scale = message['scale']
    is_16bit = message['is_16bit']
    rtvi_id = message['rtvi_id']

    #SORT MESSAGES
    refresh_rate = message['refresh_rate']
    if refresh_rate == "high":
        MSG_HS.append((req_id_bytes, rep_id_bytes, message_bytes, scale, is_16bit, rtvi_id))
    elif refresh_rate == "low":
        MSG_LS.append((req_id_bytes, rep_id_bytes, message_bytes, scale, is_16bit, rtvi_id))


#DEFINE MESSAGE REQUEST
def request(messages):
    i = 0
    while (i < len(messages)):

        print(messages[i][0])
        print(messages[i][2])
        msg = can.Message(arbitration_id=messages[i][0], data=messages[i][2],is_extended_id=True)

        try:
            received = False
            CAN_BUS.send(msg)

            retries = 500

            while not received == True or retries == 0:
                data = CAN_BUS.recv()
                received = filter(data, messages[i])
                retries -= 1

        except can.CanError:
            print("Error")
        i += 1


#DEFINE MESSAGE FILTER
def filter(data, message):
    if(data.arbitration_id == message[1] and data.data[4] == message[2][4]):
        value = 0
        if(message[4] == True):
            value = (data.data[5] << 8) | data.data[6]
        else:
            value = data.data[5]

        conversion_formula = message[3]
        converted_value = eval(conversion_formula, {'value': value})
        
        print(message[5]+str(float(converted_value)))
        sys.stdout.flush()
        return True
    else:
        return False


#MAIN LOOP  
try:
    x = 0
    while (True):
        #HIGHSPEED
        if(x <= INTERVAL):
            request(MSG_HS)
            time.sleep(REFRESH_RATE)
        x += 1
        #LOWSPEED
        if(x == INTERVAL):
            request(MSG_LS)
            x = 0
except (KeyboardInterrupt, SystemExit):
	#Catch keyboard interrupt
	sys.exit()