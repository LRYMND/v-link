import can
import time
import os
import sys
import math

from threading import Thread


#DEFINE CAN DATA
REQ_ID = 0x000FFFFE
REP_ID = 0x00400021

MAP_ID = 0x9D
IAT_ID = 0xCE
COL_ID = 0xD8
VOL_ID = 0x0A
LD1_ID  = 0x34
LD2_ID  = 0x2C


REFRESH_RATE = 0.03
INTERVAL = 1
x = 1

bus = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)

def can_rx_task():

    while (True):
        message = bus.recv()

		#Catch Boost
        if (message.arbitration_id == REP_ID and message.data[4] == MAP_ID):
            boost = message.data[5]
            boost = boost - 101
            boost = boost * 0.01

            if (boost < 0):
                boost = 0

            print("map:"+str(float(boost)))
            sys.stdout.flush()

		#Catch Intake
        if (message.arbitration_id == REP_ID and message.data[4] == IAT_ID):
            intake = message.data[5]
            intake = intake * 0.75
            intake = intake - 47

            print("iat:"+str(float(intake)))
            sys.stdout.flush()

		#Catch Coolant
        if (message.arbitration_id == REP_ID and message.data[4] == COL_ID):
            coolant = message.data[5]
            coolant = coolant * 0.75
            coolant = coolant - 47

            print("col:"+str(float(coolant)))
            sys.stdout.flush()

        #Catch Voltage
        if (message.arbitration_id == REP_ID and message.data[4] == VOL_ID):
            voltage = message.data[5]
            voltage = voltage * 0.07

            print("vol:"+str(float(voltage)))
            sys.stdout.flush()

        #Catch Lambda1
        if (message.arbitration_id == REP_ID and message.data[4] == LD1_ID):
            lambda1 = (message.data[5] << 8) | message.data[6]
            lambda1 = float(lambda1) * 16.0 / 65536.0

            print("ld1:"+str(float(lambda1)))
            sys.stdout.flush()

        #Catch Lambda2
        if (message.arbitration_id == REP_ID and message.data[4] == LD2_ID):
            lambda2 = message.data[5]
            lambda2 = lambda2 * (1.33/255) - 0.2

            print("ld2:"+str(float(lambda2)))
            sys.stdout.flush()

t = Thread(target = can_rx_task)
t.daemon = True
t.start()

# Main loop
try:
    while (True):
        x += REFRESH_RATE

        # Slow requests go here
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

            # Sent a battery voltage request
            msg = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xA6,0x10,0x0A,0x01,0x00,0x00],is_extended_id=True)
            try:
                bus.send(msg)
                time.sleep(REFRESH_RATE)
            except can.CanError:
                print("Nothing sent")

            # Send rear lambda request
            msg = can.Message(arbitration_id=REQ_ID, data=[0xCD, 0x7A, 0xA6, 0x10, 0x2C, 0x01, 0x00, 0x00],is_extended_id=True)
            try:
                bus.send(msg)
                time.sleep(REFRESH_RATE)
            except:
                print("Nothing sent.")

            x = 0

        # Fast requests go here
        # Sent a boost pressure and lambda requests
        msg1 = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xA6,0x12,0x9D,0x01,0x00,0x00],is_extended_id=True) #boost
        msg2 = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xA6,0x10,0x34,0x01,0x00,0x00],is_extended_id=True) #lambda 1
        try:
            bus.send(msg1)
            bus.send(msg2)
            time.sleep(REFRESH_RATE)
        except can.CanError:
            print("Nothing sent")
            time.sleep(REFRESH_RATE)
        

except (KeyboardInterrupt, SystemExit):
	#Catch keyboard interrupt
	sys.exit()
