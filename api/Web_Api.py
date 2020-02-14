#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
import cgi
import cgitb; cgitb.enable()
import json
import time
from collections import OrderedDict

start=time.time()
inp_grid =""
out_grid =""

try:
    from user_point  import user_point
    from inpData     import inpData
    from outData     import outData

    # arg 
    form = cgi.FieldStorage()
    inp_grid = form.getfirst("inp_grid", "")

    # input 
    inp  = inpData() 
    debug = False
    if len(inp_grid) == 0:
        inp.readTestData()
        debug = True
    else:
        inp.setJSON(inp_grid)

    # user confirmation
    if debug == False:
        usr = user_point(inp.username, inp.password)
        user_id = old_points = new_points = deduct_points = 0
        re = usr.get_points_balance()
        if "error" in re:
            raise TypeError(re["error"])
        else:
            user_id = re["user_id"]
            old_points = int(re["purchase_value"])

    # output 
    out = outData(inp)

    out_json = out.getPrediction()
    dtime=time.time()-start
    out_json['dtime'] = dtime

    if debug == False:
        # user confirmation
        deduct_points = 1
        # ポイントを購入してくださいってハナシ
        if deduct_points > old_points:
            raise Exception('error - Service usage point {0}pt is insufficient. Please purchase usage rights at structuralengine.com'.format(old_points))

        # ポイントを減らすよ
        re = usr.deduct_points_balance(deduct_points)
        if "error" in re:
            raise TypeError(re["error"])
        else:
            new_points = int(re["purchase_value"])

        # ポイントを減らしたよ
        out_json['username'] = inp.username
        out_json['old_points'] = old_points
        out_json['deduct_points'] = deduct_points
        out_json['new_points'] = new_points

    # result
    out_grid = json.dumps(out_json)
    if len(inp_grid) == 0:
        out_text = json.dumps(out_json, indent=4)
        fout=open('out_grid.json', 'w')
        print(out_text, file=fout)
        fout.close()
    else:
        print("Content-type: text/javascript; charset=utf-8")
        print("Access-Control-Allow-Origin: *")
        print("Access-Control-Allow-Methods: GET, POST, OPTIONS")
        print("Access-Control-Allow-Headers: *")
        print()
        print(out_grid)

except:
    print("Content-type: text/javascript; charset=utf-8")
    print("Access-Control-Allow-Origin: *")
    print("Access-Control-Allow-Methods: GET, POST, OPTIONS")
    print("Access-Control-Allow-Headers: *")
    print()
    for err in sys.exc_info():
        print(err)
