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
VOL_DATA = 0x0A
LD1_DATA  = 0x34
LD2_DATA  = 0x2C

REFRESH_RATE = 0.03
INTERVAL = 1
x = 1

bus = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)

def can_rx_task():
    #boostOld = 0
    #boostNew = 0
    #difference = 0

    while (True):
        message = bus.recv()

        #Catch Lambda1
        if (message.arbitration_id == REP_ID and message.data[4] == LD1_DATA):
            lambda1 = (message.data[5] << 8) | message.data[6]
            print(float(lambda1))
            lambda1 = lambda1 * 16
            print(float(lambda1))
            lambda1 = float(lambda1) / float(65536)
            print(float(lambda1))
            #print("value: " + str(lambda1)
            #print("{:.2f}".format(float(lambda1)))
            #print("ld1: "+str(float(lambda1)))
            #res = ''.join(format(x, '02x') for x in message.data)
            #print(res)
            sys.stdout.flush()

        #Catch Lambda2
        if (message.arbitration_id == REP_ID and message.data[4] == LD2_DATA):
            lambda2 = message.data[5]
            lambda2 = lambda2 * (1.33/255) - 0.2

            #print("ld2:"+str(float(lambda2)))
            sys.stdout.flush()


t = Thread(target = can_rx_task)
t.daemon = True
t.start()

# Main loop
try:
    while (True):

        # Fast requests go here
        msg1 = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xA6,0x10,0x34,0x01,0x00,0x00],is_extended_id=True) #lambda 1
        msg2 = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xA6,0x10,0x2C,0x01,0x00,0x00],is_extended_id=True) #lambda 2
        try:
            bus.send(msg1)
            #bus.send(msg2)
            time.sleep(REFRESH_RATE)
        except can.CanError:
            print("Nothing sent")

        time.sleep(REFRESH_RATE)

except (KeyboardInterrupt, SystemExit):
	#Catch keyboard interrupt
	sys.exit()
