import axios from 'axios';
import { showAlert } from './alert.js';

export const login = async (email, password) => {
  try {
    // perform a axios post request to the login api endpoint, and save the cookie returened by it
    const response = await axios({
      method: 'post',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    // if the login is successfull, then redirect him to the home page
    // console.log(response.data.status);
    if (response.data.status === 'success') {
      showAlert('success', 'Logged in Successfully');
      window.setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  } catch (err) {
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  // console.log('logout');
  // send a get request to the logout endpoint, so that, the prev cookie of the name
  // jwtToken gets replaced with a dummy one
  const response = await axios({
    method: 'get',
    url: '/api/v1/users/logout',
  });
  // console.log(response);
  if (response.data.status === 'success') {
    showAlert('success', 'Successfully logged out');
    // Also must initiate a reload from the server
    window.setTimeout(() => {
      window.location.reload({
        forcedReload: true,
      });
      window.location.href = '/';
    }, 1500);
  } else {
    showAlert('error', 'There is a problem in logging out. Please try again');
  }
};
