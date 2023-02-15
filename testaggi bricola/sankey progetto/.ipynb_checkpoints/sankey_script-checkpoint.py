import pandas as pd
source_file = "2000.csv";
country = "Argentina";
df = pd.read_csv(source_file);

link_list = []
start_row = 3
end_row = 205
start_col = 1
end_col = 3
table_output = []
table_output.append(['All Causes', 'Communicable, maternal, perinatal and nutritional conditions', df.loc[3, country]])
table_output.append(['All Causes', 'Noncommunicable diseases', df.loc[64, country]])
table_output.append(['All Causes', 'Injuries', df.loc[192, country]])
for i in range(start_row,end_row):
    for j in range(start_col,end_col):
        elem = df.iloc[i,j];
        right_elem = df.iloc[i,j+1];
        num_cases = df.loc[i, country]
        if num_cases=="." or num_cases=="0" or pd.isna(df.iloc[i,j+1]):
            num_cases = "0.0"
        tuple_ = (elem, right_elem)
        if tuple_ not in link_list:
            link_list.append(tuple_)
            table_output.append([elem, right_elem, num_cases])
table_output = pd.DataFrame(table_output, columns=['source', 'target', 'value'])
table_output = table_output.dropna(how='any', axis=0)
table_output.to_csv("argentina_sankey.csv")