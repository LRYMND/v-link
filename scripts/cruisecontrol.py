import can
import os
import sys

#DEFINE CAN DATA
REQ_ID = 0x000FFFFE

#SETUP INTERFACE
bus = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)

# Turn Cruise Control ON
msg = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xA6,0x10,0x10,0x01,0x01,0x01],is_extended_id=True)
try:
	bus.send(msg)
	print("Message sent to CAN Bus.")
except can.CanError:
	print("Nothing sent")