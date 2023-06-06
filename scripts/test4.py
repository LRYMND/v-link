import sys

key = ["haldex_on", "esp_off", "cruise_control", "window_down", "window_up", "headligt_on", "sidelight_on", "foglight_on"]

for i in range(1, len(sys.argv)):
    print(key[i-1], 'value:', sys.argv[i])
    
