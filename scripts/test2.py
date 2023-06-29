##################################################
## VOLVO RTVI CAN SCRIPT
##################################################
## Author: LRYMND
## Version: 0.2.0
## Git: https://github.com/LRYMND/volvo-rtvi
##################################################


#IMPORTS
import can
import time
import os
import sys

from threading import Thread


#DEFINE TIMING
REFRESH_RATE = 0.03     #HIGHSPEED (SECONDS)
INTERVAL = 3            #LOWSPEED  (REFRESH_RATE * INTERVAL)


#DEFINE CAN DATA
REQ_ID = 0x000FFFFE
REP_ID = 0x00400021

REQ_MSG = [0xCD,0x7A,0xA6,0x10,0x00,0x01,0x00,0x00]


#[MSG_ID, RTVI_ID, 16Bit]
#HIGH REFRESH RATE
MSG_ID_HS = [
    [0x9D, "map:", False],  #BOOST
    [0x34, "ld1:", True],   #LAMBDA1
]

#LOW REFRESH RATE
MSG_ID_LS = [
     [0xCE, "iat:", False], #INTAKE
     [0xD8, "col:", False], #COOLANT
     [0x0A, "vol:", False], #VOLTAGE
     [0x2C, "ld2:", False], #LAMBDA2
]


#DEFINE BUS
#FILTER = [{"can_id":REP_ID, "can_mask": 0xFFFFFFFF, "extended": True}]
CAN_BUS = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)


#DEFINE CONVERSION METHOD
def conversion(msg_id, data):
        if(msg_id == 0x9D):    #BOOST
            data -= 101.0
            data *= 0.01
            if (data < 0):
                data = 0
            return data

        elif(msg_id == 0xCE):  #INTAKE
            data *= 0.75
            data -= 47.0
            return data

        elif(msg_id == 0xD8):  #COOLANT
            data *= 0.75
            data -= 47.0
            return data

        elif(msg_id == 0x0A):  #VOLTAGE
            data *= 0.07
            return data

        elif(msg_id == 0x34):  #LAMBDA1
            data *= 16.0 / 65536.0
            return data

        elif(msg_id == 0x2C):  #LAMBDA2
            data *= (1.33 / 255)
            data -= 0.2
            return data

        else:              #DEFAULT
            return 0


#DEFINE MESSAGE FILTER
def filter(msg, msg_id, is_extended):
    if(msg.arbitration_id == REP_ID and msg.data[4] == msg_id):
        value = 0
        if(is_extended == True):
            value = (msg.data[5] << 8) | msg.data[6]
        else:
            value = msg.data[5]
        print(msg_id+str(conversion(msg_id, float(value))))
        sys.stdout.flush()
	return True
    else:
	return False


#DEFINE MESSAGE REQUEST
def request(msg_id):
    i = 0
    while (i < len(msg_id)):
        REQ_MSG[4] = msg_id[i][0]
        msg = can.Message(arbitration_id=REQ_ID, data=REQ_MSG,is_extended_id=True)

        try:
	    received = False
            CAN_BUS.send(msg)

	    retries = 500

	    while not received == True or retries == 0
		msg = CAN_BUS.recv()
		received = filter(msg, msg_id[i][0], msg_id[i][2])
		retries -= 1

        except can.CanError:
            print("Error")
        i += 1


#MAIN LOOP
try:
    x = 0
    while (True):
        #HIGHSPEED
        if(x <= INTERVAL):
            request(MSG_ID_HS)
            time.sleep(REFRESH_RATE)
        x += 1

        #LOWSPEED
        if(x == INTERVAL):
            request(MSG_ID_LS)
            x = 0

except (KeyboardInterrupt, SystemExit):
	#Catch keyboard interrupt
	sys.exit()
