import React, {Component, PureComponent} from 'react';
import { withStyles } from "@material-ui/core/styles";
import {connect} from 'react-redux';
import * as actions from "../store/actions";
import {Line} from 'react-chartjs-2';

class Dronedata extends Component {
  state = {
    chartdata: [],
    labels: []
  }
  componentDidMount() {
    setInterval(()=>{
      this.getDroneData();
      this.setState({
        chartDisplay: false
      })
    }, 4000)
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.metric.length !== nextProps.metric.length) {
      let data = [];
      let metrics = [];
      data = nextProps.metric.map((item, index)=>{
        return new Date(item.timestamp).toLocaleTimeString();
      })
      metrics = nextProps.metric.map((item)=>{
        return item.metric
      })
      this.setState({
        chartdata: metrics,
        labels: data
      })
    }
  }
  getDroneData() {
    this.props.getDroneData(this.props.metric.length);
  }
  render() {
    const {latitude, longitude} = this.props.droneCurrentData;
    const {title} = this.props.droneLocationWeather;
    const data = {
      labels: this.state.labels,
      datasets: [
        {
          label: 'Metrics',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: this.state.chartdata
        }
      ]
    }
    return (
      <div>
        Drone data
        <button onClick={this.getDroneData.bind(this)}>Get Drone Data</button>
        <div>
          <div>
            <h3>Current Drone Location</h3>
          </div>
          <label>Latitude: {latitude || '0'}, Longitude: {longitude || '0'}</label>
          <div>
            <h4>Weather</h4>
            <div>
              <table style={{width: '100%'}}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Min Temp.</th>
                    <th>Max Temp.</th>
                    <th>Weather State</th>
                    <th>Air Pressure</th>
                    <th>Wind Speed</th>
                    <th>Wind Direction (Compass)</th>
                    <th>Wind Direction</th>
                    <th>Humidity</th>
                    <th>Predictability</th>
                    <th>Visibility</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.props.consolidated_weather && this.props.consolidated_weather.map(item=>{
                      return <tr style={{textAlign: 'center'}}>
                        <td>{item.applicable_date}</td>
                        <td>{new Date(item.created).toLocaleTimeString()}</td>
                        <td>{item.min_temp.toFixed(2)}</td>
                        <td>{item.max_temp.toFixed(2)}</td>
                        <td>{item.weather_state_name}</td>
                        <td>{item.air_pressure}</td>
                        <td>{(item.wind_speed).toFixed(2)}</td>
                        <td>{item.wind_direction_compass}</td>
                        <td>{item.wind_direction.toFixed(2)}</td>
                        <td>{item.humidity}</td>
                        <td>{item.predictability}</td>
                        <td>{(item.visibility).toFixed(2)}</td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <Line data={data} width={50} height={10}/>
        </div>
      </div>
    )
  }
}

const styles = {

}

const mapStateToProps = (state) => {
  const {weather} = state;
  const {droneData, droneCurrentData, droneLocationWeather, metric, data} = weather;
  return {
    weather,
    droneData,
    droneCurrentData,
    droneLocationWeather,
    metric,
    consolidated_weather: data.consolidated_weather
  }
}

const mapDispatch = dispatch => ({
  getDroneData: (length) =>
    dispatch({
      type: actions.FETCH_DRONE_DATA,
      metricLength: length
    })
});

// export default withStyles(styles)(Dronedata);
export default connect(mapStateToProps, mapDispatch)(withStyles(styles)(Dronedata))