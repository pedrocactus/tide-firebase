from bs4 import BeautifulSoup
from urllib.request import urlopen
import re
import datetime
from datetime import date

start_date = date(2018,1,1)
end_date = date(2018,12,31)
delta = datetime.timedelta(days=1)

html = urlopen("http://maree.info")
#print(html)
soup = BeautifulSoup(html)
regex = re.compile('.*Port.*')

file = open("info.json","w")

file.write("{\n'ports' :[\n")

for p in soup.find_all('a', {"class" : regex},href=True):
    file.write("{'port': '"+p.text+"',\n 'days' :[ \n")
    d = start_date
    while d <= end_date:
        #print(d.strftime("%Y%m%d"))
        day = d.strftime("%Y%m%d")
        file.write("{\n'day' : '"+day+"',\n")
        dev = "http://maree.info"+p['href']+"?d="+day
        print(dev)
        html2 = urlopen(dev)
        soup2 = BeautifulSoup(html2)
        d += delta
        ff = soup2.find_all('td', {"class" : "SEPV"})
        hours = ff[0].text
        meters = ff[1].text.split("m")
        file.write("'hours' : [")
        file.write("["+"'"+hours[0:5]+"'"+",")
        file.write("'"+meters[0]+"'"+"],")

        file.write("["+"'"+hours[5:10]+"'"+",")
        file.write("'"+meters[1]+"'"+"],")

        file.write("["+"'"+hours[10:15]+"'"+",")
        file.write("'"+meters[2]+"'"+"]")

        if len(hours) == 20 :
            file.write(",["+"'"+hours[15:20]+"'"+",")
            file.write("'"+meters[3]+"'"+"]")

        file.write("],\n")

        for p3 in soup2.find_all('td', {"class" : "Coef"}):
            coeffs = p3.text.split()
            print(coeffs[0])
            file.write("'coeff' : [")
            if len(coeffs) == 2 :
                file.write(coeffs[0]+",")
                file.write(coeffs[1]+"]},\n")
            else:
                file.write(coeffs[0]+"]},\n")


    size = file.tell() -1
    print(size)

    file.truncate(size)
    file.seek(size-1)
    file.write("]},\n")

file.close()


#file = open(“.txt”,”w”)
