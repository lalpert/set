/**
 * Created by russell on 4/15/16.
 */
export default (dispatch, statusUrl) => {

  const checkConnectivity = async () => {
    console.log(`Checking connectivity ${statusUrl}`);
    try {
      let response = await fetch(statusUrl);
      let json = await response.json();
      if (json.status == "OK") {
        dispatch({type: "CONNECTION_STATUS", connected: true});
      } else {
        dispatch({type: "CONNECTION_STATUS", connected: false});
      }
    } catch (error) {
      console.log("Connection error: ", error);
      dispatch({type: "CONNECTION_STATUS", connected: false, reason: error});
    }
  };

  return {checkConnectivity};
}
