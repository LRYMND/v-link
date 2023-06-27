import can
import time
import os
import sys

from threading import Thread

#DEFINE BUS
bus = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)

#DEFINE TIMING
REFRESH_RATE = 0.03     #HIGHSPEED (SECONDS)
INTERVAL = 3            #LOWSPEED  (REFRESH_RATE * INTERVAL)

#DEFINE CAN DATA
REQ_ID = 0x000FFFFE
REP_ID = 0x00400021

REQ_MSG = [0xCD,0x7A,0xA6,0x10,0x00,0x01,0x00,0x00]

#[MSG_ID, RTVI_ID, 16Bit]
MSG_ID_HS = [
    [0x9D, "map:", False],  #BOOST
    [0x34, "ld1:", True],   #LAMBDA1
]

MSG_ID_LS = [
     [0xCE, "iat:", False], #INTAKE
     [0xD8, "col:", False], #COOLANT
     [0x0A, "vol:", False], #VOLTAGE
     [0x2C, "ld2:", False], #LAMBDA2
]


#CONVERSION METHOD
def conversion(id, value):
    match id:
        case 0x9D:  #BOOST
            value -= 101.0
            value *= 0.01
            if (boost < 0):
                boost = 0
            return value
        
        case 0xCE:  #INTAKE
            value *= 0.75
            value -= 47.0
            return value
        
        case 0xD8:  #COOLANT
            value *= 0.75
            value -= 47.0
            return value
        
        case 0x0A:  #VOLTAGE
            value *= 0.07
            return value
        
        case 0x34:  #LAMBDA1
            value *= 16.0 / 65536.0
            return value
        
        case 0x2C:  #LAMBDA2
            value *= (1.33/255)
            value -= 0.2
            return value

        case _:     #DEFAULT
            return 0


#RECEIVER TASK
def can_rx_task():
    while (True):
        message = bus.recv()

        #HIGHSPEED
        x = 0
        value = 0
        while (x < len(MSG_ID_HS)):
            if(message.arbitration_id == REP_ID and message.data[4] == MSG_ID_HS[x][0]):
                if(MSG_ID_HS[x][2] == True):
                    value = (message.data[5] << 8) | message.data[6]
                else:
                    value = message.data[5]
                print(MSG_ID_HS[x][1]+str(float(conversion[MSG_ID_HS[x][0], float(value)])))
                sys.stdout.flush()
            x += 1

        #LOWSPEED
        x = 0
        value = 0
        while (x < len(MSG_ID_LS)):
            if(message.arbitration_id == REP_ID and message.data[4] == MSG_ID_LS[x][0]):
                if(MSG_ID_LS[x][2] == True):
                    value = (message.data[5] << 8) | message.data[6]
                else:
                    value = message.data[5]
                print(MSG_ID_LS[x][1]+str(float(conversion[MSG_ID_LS[x][0], float(value)])))
                sys.st
            x += 1


#START THREAD
t = Thread(target = can_rx_task)
t.daemon = True
t.start()


#MAIN LOOP
try:
    while (True):
        #HIGHSPEED
        if(x <= INTERVAL):
            y = 0
            while (y < len(MSG_ID_HS)):
                REQ_MSG[4] = MSG_ID_HS[y][0]
                msg = can.Message(arbitration_id=REQ_ID, data=REQ_MSG,is_extended_id=True)

                try:
                    bus.send(msg)
                except can.CanError:
                    print("Nothing sent")
                y += 1
            time.sleep(REFRESH_RATE)
        x += 1

        #LOWSPEED
        if(x == INTERVAL):
            y = 0
            while (y < len(MSG_ID_LS)):
                REQ_MSG[4] = MSG_ID_LS[y][0]
                msg = can.Message(arbitration_id=REQ_ID, data=REQ_MSG,is_extended_id=True)

                try:
                    bus.send(msg)
                except can.CanError:
                    print("Nothing sent")
                y += 1
            x = 0

#CATCH INTERRUPT
except (KeyboardInterrupt, SystemExit):
	#Catch keyboard interrupt
	sys.exit()