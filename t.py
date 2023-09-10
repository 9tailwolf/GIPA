import pickle
from sentence_transformers import SentenceTransformer
import numpy as np
from keybert import KeyBERT
from kiwipiepy import Kiwi
import sys

def cos_sim(A, B):
    return np.dot(A, B)/(np.linalg.norm(A)*np.linalg.norm(B))


# NLP 모델 열기
with open('NLIModel.pt', 'rb') as f:
    model = pickle.load(f)
kw_model = KeyBERT(model)

    
# 데이터베이스 열기
with open('database.pkl', 'rb') as f:
    database = pickle.load(f)

input_datas = database['inputs']
inp = sys.argv[1] if len(sys.argv) > 1 else 'default_arg1'
final_title = sys.argv[2] if len(sys.argv) > 2 else 'default_arg1'



# 최근 100개 검색어 설정
if len(input_datas) > 100:
    input_datas.pop(0)
input_datas.append(inp)
    
    
# keyword 계산
keywordData = ""
for i in input_datas:
    keywordData += " " + i
keywords = kw_model.extract_keywords(keywordData, keyphrase_ngram_range=(1, 1), stop_words=None, top_n=6)


# 추천 게산
embedding = model.encode([database['rec'][i]['desc'] for i in range(len(database['rec']))])
inp = model.encode([inp])
sens = [(i,cos_sim(inp[0],embedding[i])) for i in range(len(database['rec']))]
sens.sort(key=lambda x:-x[1])
res = sens[0][0],sens[1][0],sens[2][0]


# 데이터베이스 업데이트
with open('database.pkl', 'wb') as f:
    pickle.dump(database, f)

    

result = "t"
for n in range(3):
    for i in database['rec'][res[n]].keys():
        result += '@' + database['rec'][res[n]][i]
    result += '#'
for i in keywords:
    result += '@' + i[0]
print(result)