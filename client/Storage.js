/**
 * Created by russell on 3/22/16.
 */
import { AsyncStorage } from 'react-native'
const StorageKeyName = "name";
const StorageKeyConfig = "config";

const getName = async () => {
  console.log("retrieving name");
  return await AsyncStorage.getItem(StorageKeyName);
};

const setName = async (name) => {
  console.log("setting: ", name);
  return await AsyncStorage.setItem(StorageKeyName, name);
};

const getConfig = async () => {
  const config = AsyncStorage.getItem(StorageKeyConfig);
  if (config) {
    try {
      return JSON.parse(config);
    } catch (e) {
      await clearConfig();
      return null;
    }

  } else {
    return null;
  }
};

const setConfig = async (id, secret) => {
  const json = JSON.stringify({id, secret});
  return await AsyncStorage.setItem(StorageKeyConfig, json);
};

const clearConfig = async () => {
  return await AsyncStorage.removeItem(StorageKeyConfig);
};

export default {getName, setName, getConfig, setConfig, clearConfig};