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
matrix_size = 0
try:
    from user_point import user_point

    from FramePython import FramePython
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
        f = open('kMatrix.csv','w')
        f.write('')
        f.close()
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

    # calcrate
    out_AllCase = OrderedDict()
    for icase in range(0, inp.caseCount):
        inp.setPalam(icase)
        # calcration 
        out = FramePython().Nonlinear3D(inp, debug)
        # output 
        out_json = out.getDictionary()
        # calculation state
        out_json['matrix_size'] = inp.n
        dtime=time.time()-start
        out_json['dtime'] = dtime
        out_AllCase[inp.caseName] = out_json

    dict_Json = out_AllCase
    dtime=time.time()-start
    dict_Json['dtime'] = dtime

    if debug == False:
        # user confirmation
        deduct_points = len(inp.node) * inp.caseCount
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
        dict_Json['username'] = inp.username
        dict_Json['old_points'] = old_points
        dict_Json['deduct_points'] = deduct_points
        dict_Json['new_points'] = new_points

    # result
    out_grid = json.dumps(dict_Json)
    if len(inp_grid) == 0:
        out_text = json.dumps(dict_Json, indent=4)
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
