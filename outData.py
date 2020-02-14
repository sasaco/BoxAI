import json
from tensorflow.keras.layers import Activation, Dense, Dropout
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.optimizers import Adam

from sklearn.preprocessing import MinMaxScaler

import pandas as pd
import numpy as np

class outData:

    def __init__(self, inp):

        self.inp = inp.input
        
        #csvの読み取り
        train_csv  = pd.read_csv("List of box culvert construction results.csv", index_col='id')
        # NaN データを 0 に置き換える
        train_csv = train_csv.fillna(0)
        # train データから thickness of top slab列 ～ thickness of middle wall2列 を 抽出する
        train_csv_labels = train_csv[["thickness of top slab","thickness of bottom slab","thickness of wall","thickness of middle wall1","thickness of middle wall2"]]
        # thickness of top slab列 ～ thickness of middle wall2列 を削除
        train_csv_data = train_csv.copy()
        del train_csv_data["thickness of top slab"]
        del train_csv_data["thickness of bottom slab"]
        del train_csv_data["thickness of wall"]
        del train_csv_data["thickness of middle wall1"]
        del train_csv_data["thickness of middle wall2"]
        # 訓練データの正規化
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.scaler.fit(train_csv_data)
        # 答えも正規化する
        self.label_scaler = MinMaxScaler(feature_range=(0, 1))
        self.label_scaler.fit(train_csv_labels)

        # モデルの作成
        n_in = len(train_csv_data.columns) 
        nn= n_in * 2
        n_out = len(train_csv_labels.columns) 

        self.model = Sequential()
        self.model.add(Dense(nn, activation='relu', input_shape=(n_in, )))
        self.model.add(Dense(nn, activation='relu'))
        self.model.add(Dense(nn, activation='relu'))
        self.model.add(Dense(n_out))

        # モデルのロード
        self.model.load_weights('model.h5')
        #self.model = load_model('model.h5')


    def getPrediction(self):

        train_csv_data = self.inp 

        # 推論用データを正規化する
        test_norm = self.scaler.transform(train_csv_data)
        test_data_normal = pd.DataFrame(data=test_norm, index=train_csv_data.index.values, columns=train_csv_data.columns)
        # ニュートラルネットワークに推論用データ(正規化した test_data_normal)を入力して回答を得る
        test_predictions_norm = self.model.predict(test_data_normal)
        # 正規化を元に戻す
        test_predictions = self.label_scaler.inverse_transform(test_predictions_norm)

        result_list = test_predictions.tolist()

        top = []
        bottom = []
        wall = []
        middle1 = []
        middle2 = []

        for l in result_list:
            top.append(l[0])
            bottom.append(l[1])
            wall.append(l[2])
            middle1.append(l[3])
            middle2.append(l[4])

        result_dict = {}
        result_dict['thickness of top slab'] = top
        result_dict['thickness of bottom slab'] = bottom
        result_dict['thickness of wall'] = wall
        result_dict['thickness of middle wall1'] = middle1
        result_dict['thickness of middle wall2'] = middle2
        
        return result_dict
 
