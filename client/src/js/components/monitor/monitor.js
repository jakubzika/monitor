import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import * as d3 from 'd3';
import _ from 'lodash';

let chart = {};

let height = 200;

function invert(value) {
  return ((height/2)-value)+(height/2);
}

chart.create = function (selector,data) {

  chart.height = 200;
  let svg = d3.select('.chart')
    .append('svg')
    .attr('class','d3')
    .attr('width','800px')
    .attr('height',height+'px')
    .style('background-color','whitesmoke')
    .append('g')
    .attr('class','d3-data')
    .append('path')
    .attr('class','light')
    .attr('d','');

  d3.select('.d3-data')
    .append('path')
    .attr('class','temperature')
    .attr('d','');


  this.update(selector,data);
};

chart.update = function (selector,data) {

  this.draw(selector,data);
};

chart.draw = function (selector,data) {



    // .attr('class','d3-point')
    // .attr('cx',(d)=> {console.log(d); return '5px' })
    // .attr('cy',(d)=> { return '20px' })
    // .attr('r', (d)=> { return '5px' })
    //
  // console.log()
    let xLight = d3.scaleLinear()
      // .domain([_.min(_.map(data.light,(value)=>{return value.y})),_.max(_.map(data.light,(value)=>{return value.y}))])
      .domain([0,1024])
      .range([0,height]);

    let xTemperature = d3.scaleLinear()
      // .domain([_.min(_.map(data.temperature,(value)=>{return value.y})),_.max(_.map(data.temperature,(value)=>{return value.y}))])
      .domain([-20,50])
      .range([0,height]);

    let xPosition = 0;
    let xPositionTemperature = 0;

    let chart = d3.select('.d3-data');
    let lineFunctionLight = d3.line()
      .x((d)=>{xPosition+=2;return xPosition})
      .y((d)=>{return invert(xLight(d.y))});


  let lineFunctionTemperature = d3.line()
      .x((d)=>{xPositionTemperature+=2;return xPositionTemperature})
      .y((d)=>{return invert(xTemperature(d.y))});
      // .interpolate('linear');

    chart.select('.temperature')
      // .data(data.light)
      // .append('path')
      // .data(data.light)
      .attr('d',lineFunctionLight(data.light))
      .attr('stroke','#492c5a')
      .attr('stroke-width',2)
      .attr('fill','none')
      .exit().remove();

  chart.select('.light')
      .attr('d',lineFunctionTemperature(data.temperature))
      .attr('stroke','red')
      .attr('stroke-width',2)
      .attr('fill','none')
      .exit().remove();

  
};

class Monitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ws:0,
      data:{
        // temperature: [{id:0,x:0,y:1},{id:1,x:10,y:2},{id:2,x:20,y:3}],
        // light: [{id:0,x:0,y:1},{id:1,x:10,y:2},{id:2,x:20,y:3}]
        temperature: [],
        light: []
      }
    };
    this.message= this.message.bind(this);

    this.state.ws = new WebSocket(`ws://${window.location.hostname}:8888/websocket`);
    this.state.ws.onmessage = this.message;
  }

  message(evt) {

    let newState = this.state;
    let dataCsv = JSON.parse(evt.data);
    let data = newState.data;
    _.forEach(dataCsv,(sensorData,key)=>{
      if(data[key].length > 400) {
        data[key].splice(0, sensorData.split(',').length);
      }

        let index = 0;
        _.forEach(sensorData.split(','),(value)=>{
          data[key].push({
            id: index,
            x: index*10,
            y: (value)
          });

          index++;
        });

    });
    // console.log(newState);
    newState.data = data;
    this.setState(newState);
  }

  componentDidMount() {

    chart.create('.d3-monitor',this.state.data);

  }

  componentDidUpdate() {
    chart.update('.d3-monitor',this.state.data);
  }

  render() {




    return (<div className="monitor"><div className="chart"></div></div>)
  }

}

export default Monitor;
