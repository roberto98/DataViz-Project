
def RemoveElements(myList, indexes): 
    for i in sorted(indexes, reverse=True):  
        del myList[i] 
    return myList 