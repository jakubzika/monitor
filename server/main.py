import serial
import socket
import multiprocessing
import threading
import array
import time
import math
import json
import time


class DataServer:
    def __init__(self, port, ip,comPort,baudRate):
        self.port = port
        self.ip = ip
        self.arduino = serial.Serial(comPort, baudRate)
        self.arduino.readline()
        self.arduino.write('D0\n'.encode())
        self.incomingData = self.arduino.readline().rstrip().decode('utf-8').split(',')
        print(self.incomingData)
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.bind((ip,port))
        self.data = {}

        for sensor in self.incomingData:
            self.data[sensor] = array.array('f')

        self.bufferSize = 400

    def listen(self):
        self.socket.listen(30)
        testingProcess = threading.Thread(target=self.testingProcess, args=[])
        testingProcess.start()
        saveData = threading.Thread(target=self.saveData, args=[])
        saveData.start()
        while True:
            conn, addr = self.socket.accept()
            # incomingProcess = threading.Thread(target=self.incoming, args=[conn])
            outcomingProcess = threading.Thread(target=self.outcoming, args=[conn])

            # incomingProcess.start()
            outcomingProcess.start()


    def incoming(self, connection):
        end = False
        while not end:
            try:
                message = connection.recv(4096)
            except:
                end = True

    def outcoming(self, connection):
        end = False
        bufferedData = []
        initMessage = connection.recv(4096)
        print('got init message')
        initMessage = json.loads(initMessage.decode('utf-8'))
        print(initMessage)
        buffer = initMessage['buffer']
        sensors = initMessage['sensors'].split(',')
        skip = initMessage['skip']
        availableSensors = []

        for sensor in sensors:
            if(sensor in self.incomingData):
                availableSensors.append(sensor)



        while not end:
            try:
                message = {'data':{}}

                if((len(self.data[self.incomingData[0]])%(buffer*skip)) == 0):
                    for sensor in availableSensors:
                        index = self.incomingData.index(sensor)
                        data = self.data[self.incomingData[index]][int(-(buffer*skip)):].tolist()
                        # print(data)
                        data = data[::skip]
                        # print(len(data))
                        # print(data)
                        for i in range(len(data)):
                            data[i] = math.ceil(data[i]*100)/100
                        csv = ','.join(map(str,data))
                        message['data'][self.incomingData[index]] = csv
                    connection.send(json.dumps(message).encode())
                    time.sleep(0.1)

            except Exception as e:
                print('Error')
                end = True
                raise(e)

    def saveData(self):

        while True:
            data = self.arduino.readline().rstrip().decode('utf-8').split(',')
            file = open('./data/data.csv','a')
            index = 0
            # print(data,len(self.data['temperature']))

            if(len(self.data[self.incomingData[0]]) ==  self.bufferSize):
                toSave = ''
                for i in range(int(self.bufferSize/2)):
                    line = ''
                    for sensor in self.data:
                        # print(self.data[sensor][i])
                        line += str(math.ceil(self.data[sensor][i]*100)/100) + ','
                    line += '\n'
                    toSave += line
                file.write(toSave)
                for sensor in self.data:
                    del self.data[sensor][0:int(self.bufferSize/2)]

            for sensor in self.incomingData:
                self.data[sensor].append((math.ceil(float(data[index])*100)/100))
                # print(len(self.data[self.incomingData[0]]))
                index+=1


            # print(self.data['temperature'])


    def testingProcess(self):
        while True:
            time.sleep(1)
            # print(self.data['temperature'])

if __name__ == '__main__':
    a = DataServer(7500,'0.0.0.0','COM5',9600)
    a.listen()