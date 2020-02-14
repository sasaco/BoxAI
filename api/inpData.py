import json
import pandas as pd

class inpData:

    def readTestData(self):
        fnameR= 'inp_grid.json'
        f = open(fnameR)
        fstr = f.read()  # ファイル終端まで全て読んだデータを返す
        f.close()
        self.setJSON(fstr)

    def setJSON(self, fstr):

        js = json.loads(fstr) 

        self.username = js['username']
        self.password = js['password']

        del js['username']
        del js['password']



        self.input = pd.DataFrame(js)


