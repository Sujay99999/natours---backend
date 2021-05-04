import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { login, logout } from './auth.js';
import { displayMap } from './mapbox.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe.js';

const loginFormElement = document.querySelector('#login-form');
const mapElement = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');
const bookTourBtn = document.getElementById('book-tour');

if (logoutBtn) {
  logoutBtn.addEventListener('click', (event) => {
    logout();
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    // get the lastest passowrd feild into a obj as currentPassword, password and confirmPassword
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    document.querySelector('#btn-update-password').textContent = 'Updating...';
    await updateSettings('password', {
      currentPassword: currentPassword,
      password: newPassword,
      confirmPassword: confirmPassword,
    });
    document.querySelector('#btn-update-password').textContent =
      'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (updateDataForm) {
  updateDataForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // get the latest email,name and the photo on the input and create a formdata object
    // The formdata object is very important so, that the multer can recognize it
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    // The file type input always exists as a array
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings('data', form);
  });
}

if (loginFormElement) {
  loginFormElement.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

//now , we need to get the locations of the tour, for which we are displaying the map using the datasets property
if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}

// Adding th event listner for the book-tour btn
if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (event) => {
    const checkoutTourId = event.target.closest('#book-tour').dataset.tourId;
    bookTour(checkoutTourId);
  });
}
