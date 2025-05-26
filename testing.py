import pandas as pd

df = pd.read_csv('resources_dataset/1_data/survey_data/survey_dates.csv')
print(df.dtypes)
print(df.head())