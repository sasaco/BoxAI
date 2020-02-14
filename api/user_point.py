import requests
import json

class user_point:

    def __init__(self, username, password):
        self.usr = username
        self.psw = password
        self.id = -1
        #self.url = "http://structuralengine.com"
        self.url = "http://172.16.0.10"

    def get_points_balance(self):

        #GETパラメータはparams引数に辞書で指定する
        response = requests.get(
            self.url + "/my-module/get_points_balance.php",
            params={
                'id': self.usr,
                'ps': self.psw
                })

        #レスポンスオブジェクトのjsonメソッド
        rejson = response.json()
        if "user_id" in rejson:
            self.id = int(rejson["user_id"])

        return rejson
   

    def deduct_points_balance(self, deduct_points):

        #get_points_balance の取得に失敗している場合は、-1 を返す
        if self.id < 0:
            return -1

        #GETパラメータはparams引数に辞書で指定する
        response = requests.get(
            self.url + "/my-module/deduct_points_balance.php",
            params={
                'id': self.id,
                'pt': deduct_points
                })

        #レスポンスオブジェクトのjsonメソッド
        return response.json()




    
