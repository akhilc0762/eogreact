import { takeEvery, call, put, cancel, all } from "redux-saga/effects";
import API from "../api";
import * as actions from "../actions";

/*
  1. The weather service requires us to make a search by lat/lng to find its
  weather ID.
  2. We then use that weather ID to get the weather.

  This process is pretty well defined here with a saga.

  call invokes a method
  put dispatches an action
  takeEvery watches actions and executes a function

  Also -- the `*` in function is important; turns it into a "generator"

*/

function* watchDroneLocation(action) {
  const {error, data} = yield call(API.findDroneLocation);
  if(error) {
    yield put({ type: actions.API_ERROR, code: error.code });
    yield cancel();
    return;
  }
  const latestData = data;
  const {latitude, longitude, metric, timestamp} = latestData.data[latestData.data.length-1];
  const weatherData = yield call(API.findLocationByLatLng, parseFloat(latitude.toFixed(6)), parseFloat(longitude.toFixed(6)));
  if(weatherData.error) {
    yield put({ type: actions.API_ERROR, code: error.code });
    yield cancel();
    return;
  }
  const weatherDataMain = weatherData.data[0];
  const {woeid} = weatherDataMain;
  const weatherForecastData = yield call(API.findWeatherbyId, woeid);
  if(weatherForecastData.error) {
    yield put({ type: actions.API_ERROR, code: error.code });
    yield cancel();
    return;
  }
  yield put({ type: actions.WEATHER_DATA_RECEIVED, weatherForecastData });
  let metricData = [];
  if(action.metricLength === 0) {
    metricData = data.data.map(item=>{
      return {
        metric: item.metric,
        timestamp: item.timestamp
      }
    })
    yield put({type: actions.FETCH_DRONE_DATA_RECEIVED, data: {droneData: data, droneLocationWeather: weatherDataMain, metricArr: metricData}});
  } else {
    yield put({type: actions.FETCH_DRONE_DATA_RECEIVED, data: {droneData: data, droneLocationWeather: weatherDataMain, metric: {metric, timestamp}}});
  }
  
}

function* watchWeatherIdReceived(action) {
  const { id } = action;
  const { error, data } = yield call(API.findWeatherbyId, id);
  if (error) {
    yield put({ type: actions.API_ERROR, code: error.code });
    yield cancel();
    return;
  }
  yield put({ type: actions.WEATHER_DATA_RECEIVED, data });
}

function* watchFetchWeather(action) {
  const { latitude, longitude } = action;
  const { error, data } = yield call(
    API.findLocationByLatLng,
    latitude,
    longitude
  );
  if (error) {
    yield put({ type: actions.API_ERROR, code: error.code });
    yield cancel();
    return;
  }
  const location = data[0] ? data[0].woeid : false;
  if (!location) {
    yield put({ type: actions.API_ERROR });
    yield cancel();
    return;
  }
  yield put({ type: actions.WEATHER_ID_RECEIVED, id: location });
}

function* watchAppLoad() {
  yield all([
    takeEvery(actions.FETCH_WEATHER, watchFetchWeather),
    takeEvery(actions.WEATHER_ID_RECEIVED, watchWeatherIdReceived),
    takeEvery(actions.FETCH_DRONE_DATA, watchDroneLocation)
  ]);
}

export default [watchAppLoad];
