import axios from 'axios';
import { showAlert } from './alert.js';

export const updateSettings = async (type, dataObj) => {
  try {
    // Even though the data object is a formData object, the axios can
    // recognize and send to the url
    let url;
    if (type === 'data') {
      url = '/api/v1/users/updateMe';
    }
    if (type === 'password') {
      url = '/api/v1/users/updateMyPassword';
    }

    // send a update request to the api
    const response = await axios({
      method: 'patch',
      url: url,
      data: dataObj,
    });

    // const updatedUser = response.data.data.user;
    if (response.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} Updated successfully`);
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert('error', err.response.data.message);
  }
};
