import tornado.ioloop
import tornado.web
import tornado.websocket
import serial
import threading
import socket
import json

def requestDataFromSensor(sendFnc):

    sensor = SensorData('localhost',7500,2,'temperature,light',16)
    while True:
        data=(sensor.receiveData())
        # print(data['temperature'])
        sendFnc(json.dumps(data))

class SensorData:
    def __init__(self, ipAddress,port,buffer,sensors,skip):
        self.socket = socket.socket()
        try:
            self.socket.connect((ipAddress,port))
            initMessage = {
                'buffer': buffer,
                'sensors': sensors,
                'skip':skip
            }
            self.socket.send(json.dumps(initMessage).encode())
        except Exception as e:
            print('Could not connect to sensor server')
            raise(e)

    def receiveData(self):
        message = self.socket.recv(32786)
        message = json.loads(message.decode('utf-8'))
        return message['data']

class Websocket(tornado.websocket.WebSocketHandler):
    def open(self):
        sendingThread = threading.Thread(target=requestDataFromSensor, args=[self.write_message])
        sendingThread.daemon = True
        sendingThread.start()
        # self.write_message()

    def on_message(self, message):
        pass

    def on_close(self):
        pass

    def check_origin(self, origin):
        return True

application = tornado.web.Application([
    (r"/websocket", Websocket),
])

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
