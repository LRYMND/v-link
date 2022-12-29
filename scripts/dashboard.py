import can
import time
import os
import sys

from threading import Thread


#DEFINE CAN DATA
REQ_ID = 0x000FFFFE
REP_ID = 0x00400021

MAP_DATA = 0x9D
IAT_DATA = 0xCE
COL_DATA = 0xD8

REFRESH_RATE = 0.03
INTERVAL = 1
x = 1

bus = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)

def can_rx_task():
    boostOld = 0
    boostNew = 0
    difference = 0

    while (True):
        message = bus.recv()

		#Catch Boost
        if (message.arbitration_id == REP_ID and message.data[4] == MAP_DATA):
            boost = message.data[5]
            boost = boost - 101
            boost = boost * 0.01

            if (boost < 0):
                boost = 0

#            boostNew = boost
#            difference = abs(boostNew - boostOld)
#            i = 0.01
#
#            #Simulate analogue feeling by iterating more on big value gaps
#            if (difference >= 0.1):
#		boost = boostOld
#                while(i <= difference):
#		    if (boost < boostNew):
#                        boost = boost + 0.01
#		    if (boost > boostNew):
#			boost = boost - 0.01
#                    print("map:"+str(float(boost)))
#                    i = i + 0.01
#            else:
#                print("map:"+str(float(boost)))
#
#	    boostOld = boost

	    print("map:"+str(float(boost)))
            sys.stdout.flush()

		#Catch Intake
        if (message.arbitration_id == REP_ID and message.data[4] == IAT_DATA):
            intake = message.data[5]
            intake = intake * 0.75
            intake = intake - 47

            print("iat:"+str(float(intake)))
            sys.stdout.flush()

		#Catch Coolant
        if (message.arbitration_id == REP_ID and message.data[4] == COL_DATA):
            coolant = message.data[5]
            coolant = coolant * 0.75
            coolant = coolant - 47

            print("col:"+str(float(coolant)))
            sys.stdout.flush()
        

t = Thread(target = can_rx_task)
t.daemon = True
t.start()

# Main loop
try:
    while (True):
        x += REFRESH_RATE
        if(x > INTERVAL):

            # Sent an intake temperature request
            msg = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xA6,0x10,0xCE,0x01,0x00,0x00],is_extended_id=True)
            try:
                bus.send(msg)
                time.sleep(REFRESH_RATE)
            except can.CanError:
                print("Nothing sent")

            # Sent a coolant temperature request
            msg = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xA6,0x10,0xD8,0x01,0x00,0x00],is_extended_id=True)
            try:
                bus.send(msg)
                time.sleep(REFRESH_RATE)
            except can.CanError:
                print("Nothing sent")

            x = 0
        
        else:

            # Sent a boost pressure request
            msg = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xA6,0x12,0x9D,0x01,0x00,0x00],is_extended_id=True)
            try:
                bus.send(msg)
                time.sleep(REFRESH_RATE)
            except can.CanError:
                print("Nothing sent")

        time.sleep(REFRESH_RATE)

except (KeyboardInterrupt, SystemExit):
	#Catch keyboard interrupt
	sys.exit()
