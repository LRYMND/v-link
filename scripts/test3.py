
import time
import os
import sys

#DEFINE MAX VAL
MAX_MAP = 1.5
MAX_IAT = 90.0
MAX_COL = 150.0

#DEFINE END VAL
TARGET_MAP = 0.02
TARGET_IAT = 14.0
TARGET_COL = 95.0

#DEFINE START ANIMATION
STEPS = 30
DURATION1 = .02
DURATION2 = .03

#CALC MAX STEPS
stepBoost = MAX_MAP / STEPS
stepIntake = MAX_IAT / STEPS
stepCoolant = MAX_COL / STEPS

#CALC TARGET STEPS
stepTargetBoost = TARGET_MAP / STEPS
stepTargetIntake = TARGET_IAT / STEPS
stepTargetCoolant = TARGET_COL / STEPS

boost = 0.0
intake = 0.0
coolant = 0.0


#RAISE TO MAX
for number in range(STEPS):
    print("map:"+str(float(boost)))
    print("iat:"+str(float(intake)))
    print("col:"+str(float(coolant)))
    
    sys.stdout.flush()
    
    boost = boost + stepBoost
    intake = intake + stepIntake
    coolant = coolant + stepCoolant

    time.sleep(DURATION1)

#RAISE TO LOW
for number in range(STEPS):
    boost = boost - stepBoost
    intake = intake - stepIntake
    coolant = coolant - stepCoolant

    if(boost < 0):
        boost = 0
    if(intake < 0):
        intake = 0
    if(coolant < 0):
        coolant = 0

    print("map:"+str(float(boost)))
    print("iat:"+str(float(intake)))
    print("col:"+str(float(coolant)))
    
    sys.stdout.flush()

    time.sleep(DURATION1)

#RAISE TO TARGET
for number in range(STEPS):
    boost = boost + stepTargetBoost
    intake = intake + stepTargetIntake
    coolant = coolant + stepTargetCoolant

    print("map:"+str(float(boost)))
    print("iat:"+str(float(intake)))
    print("col:"+str(float(coolant)))
    
    sys.stdout.flush()

    time.sleep(DURATION2)


    