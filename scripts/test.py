import can
import os
import sys

#DEFINE CAN DATA
REQ_ID = 0x000FFFFE

#SETUP INTERFACE
bus = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)

# Turn Foglights ON/OFF
msg = can.Message(arbitration_id=REQ_ID, data=[0xCF,0x50,0xB1,0x8C,0x10,0x01,0x01,0x01],is_extended_id=True)
#msg = can.Message(arbitration_id=REQ_ID, data=[0xCF,0x50,0xB1,0x8C,0x10,0x01,0x01,0x00],is_extended_id=True)

#msg = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x50,0xB1,0x8C,0x10,0x00,0x00,0x00],is_extended_id=True)
#msg = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x50,0xB1,0x8C,0x10,0x00,0x00,0x00],is_extended_id=True)

try:
	bus.send(msg)
	print("Message sent to CAN Bus.")
except can.CanError:
	print("Nothing sent")