import can
import os
import sys

#DEFINE CAN DATA
REQ_ID = 0x000FFFFE

#SETUP INTERFACE
bus = can.interface.Bus(channel='can0', bustype='socketcan', bitrate=500000)

# Delete 2-Byte DTCs
msg = can.Message(arbitration_id=REQ_ID, data=[0xCD,0x7A,0xAF,0x11,0x00,0x00,0x00,0x00],is_extended_id=True)
try:
	bus.send(msg)
	print("Message sent to CAN Bus.")
except can.CanError:
	print("Nothing sent")