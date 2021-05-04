const hideAlert = () => {
  const alertElement = document.querySelector('.alert');
  if (alertElement) {
    alertElement.parentElement.removeChild(alertElement);
  }
};

export const showAlert = (type, message) => {
  //there are only two types of alerts i.e. success or error
  hideAlert();
  const html = `<div class="alert alert--${type}">${message}</div>`;
  // console.log(html);
  document.body.insertAdjacentHTML('afterbegin', html);
  // settimeout accepts a calback fn
  window.setTimeout(hideAlert, 3000);
};
