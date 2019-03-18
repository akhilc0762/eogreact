import * as actions from "../actions";

const initialState = {
  loading: false,
  weatherId: null,
  name: "",
  temperature: "",
  weather_state_name: "",
  latitude: null,
  longitude: null,
  data: {},
  droneData: [],
  droneCurrentData: {},
  droneLocationWeather: {},
  metric: []
};

const toF = c => (c * 9) / 5 + 32;

const startLoading = (state, action) => {
  return { ...state, loading: true };
};

const weatherIDReceived = (state, action) => {
  return { ...state, weatherId: action.id };
};

const droneDataRecevied = (state, action) => {
  let metricData = [];
  if(action.data.metricArr) {
    metricData = action.data.metricArr;
  } else {
    metricData = [...state.metric, action.data.metric]
  }
  return {
    ...state,
    droneData: action.data.droneData,
    droneCurrentData: action.data.droneData && action.data.droneData.data[action.data.droneData.data.length-1],
    droneLocationWeather: action.data.droneLocationWeather,
    metric: metricData
  }
}

const weatherDataRecevied = (state, action) => {
  const { data } = action;
  if (!data["consolidated_weather"]) return state;
  const weather = data.consolidated_weather[0];
  const { weather_state_name, the_temp } = weather;
  const { latt_long, title: name } = data;
  const [latitude, longitude] = latt_long.split(",");

  return {
    ...state,
    loading: false,
    latitude,
    longitude,
    temperatureinCelsius: the_temp,
    temperatureinFahrenheit: toF(the_temp),
    weather_state_name,
    name,
    data: action.data
  };
};

const handlers = {
  [actions.FETCH_WEATHER]: startLoading,
  [actions.WEATHER_ID_RECEIVED]: weatherIDReceived,
  [actions.WEATHER_DATA_RECEIVED]: weatherDataRecevied,
  [actions.FETCH_DRONE_DATA_RECEIVED]: droneDataRecevied,
};

export default (state = initialState, action) => {
  const handler = handlers[action.type];
  if (typeof handler === "undefined") return state;
  return handler(state, action);
};
