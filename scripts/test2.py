import time
import os
import sys

#DEFINE MAX VAL
MAX_MAP = 1.5

#DEFINE END VAL
TARGET_MAP = 0.02

#DEFINE START ANIMATION
STEPS = 30
DURATION1 = .02
DURATION2 = .03

#CALC MAX STEPS
stepBoost = MAX_MAP / STEPS

#CALC TARGET STEPS
stepTargetBoost = TARGET_MAP / STEPS

boost = 0.0


i = 0

while(True):
    if(i == 0):
        for number in range(STEPS):
            print("map:"+str(float(boost)))
            sys.stdout.flush()

            boost = boost + stepBoost
            time.sleep(DURATION1)
            if(boost > 1.6):
                i = 1
                break
    
    if(i == 1):
        for number in range(STEPS):
            print("map:"+str(float(boost)))
            sys.stdout.flush()

            boost = boost - stepBoost

            if(boost < 0):
                boost = 0

            time.sleep(DURATION1)
            if(boost == 0):
                i = 0
                break