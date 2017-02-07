#include <Servo.h>
#include <LiquidCrystal.h>

LiquidCrystal lcd(12,11,5,4,3,2);

const int potenciometrPin = A1;
const int ledPin = 9;
int potenciometrValue;
int lightSensorValue;
int lightSensor,temperatureSensor,potenciometrSensor;
int angle;

const int LIGHT_SENSOR_PIN = A0;
const int TEMPERATURE_SENSOR_PIN = A1;
//const int POTENCIOMETR_SENSOR_PIN = A1;

Servo scratcher;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(10,OUTPUT);
  pinMode(13,OUTPUT);
  lcd.begin(16,2);
//  scratcher.attach(11);
  Serial.println("ok");
}

float convertSensorValueToDegrees(int value) {
  float convertedValue = (value/1024.0)*5.0;
  convertedValue = (convertedValue - 0.5)*100;
  return convertedValue;
}
float convertSensorValueToLumens(int value) {
}

int getE(int e){
  int number=1;
  for(int i;i<e;i++)
    {number = number*10;}
  
  return number;
  }
  

void requestOrder() {

  if(Serial.available()>0) {

      char incomingCharacter;
      int instructionParameterNumber[10];
      int incomingByte;
      int numberLength;
      int instructionNumber=0;
      int index = 0;
      
      incomingCharacter = Serial.read();
      
      incomingByte = Serial.read();
      
      while(incomingByte != 10) {
        instructionParameterNumber[index] = incomingByte;
        incomingByte = Serial.read();
        index++;
        //Serial.print('.');
        delay(3);
      }
      for(int k=0;k<index;k++) {
        instructionNumber += (instructionParameterNumber[k]-48)*getE(index-(k+1));
      }
      switch(incomingCharacter) {
        case 'A':
//          scratcher.write(instructionNumber);
          break;
        case 'B':
          //tone(10,instructionNumber);
          break;
        case 'C':
            lcd.clear();
          if (instructionNumber == 0) {
            digitalWrite(13,LOW);
            lcd.print("Nemyslim na tebe");
            lcd.setCursor(0,1);
            lcd.print("Zolo!");
          }
          else {
            digitalWrite(13,HIGH);
            lcd.print("Myslim na tebe");
            lcd.setCursor(0,1);
            lcd.print("Zolo!");
          }
          break;
        case 'D':
          Serial.println("temperature,light");
          break;
        }
        delay(100);
    }
}
int sendDataInterval = 8;
int interval = 0;
int i=0;

void sendData() {
  
   interval++;
   if(sendDataInterval == interval) {
     lightSensorValue = analogRead(LIGHT_SENSOR_PIN);
     Serial.print(convertSensorValueToDegrees(analogRead(TEMPERATURE_SENSOR_PIN)));
     Serial.print(",");
     Serial.print(lightSensorValue);
     Serial.println();
     interval = 0;

//     lcd.clear();
     lcd.setCursor(0,0);
     lcd.print(i++);

   }

  }

void loop() {
  
   digitalWrite(10,HIGH);
   requestOrder();
   digitalWrite(10,LOW);
//   delay(analogRead(A3));
   delay(20);
   sendData();
   
}
