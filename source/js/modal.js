var overlay = document.querySelector('.overlay');
var contactsLink = document.querySelector('.contacts__link');
var modal = overlay.querySelector('.modal');
var closeButton = modal.querySelector('.modal__button');
var form = modal.querySelector('.modal__form');
var inputLogin = modal.querySelector('#user-name');
var inputMail = modal.querySelector('#user-mail');
var submitButton = modal.querySelector('.modal__submit');
var isStorageSupport = true;
var storage = "";

try {
  storage = localStorage.getItem('login');
} catch (error) {
  isStorageSupport = false;
}

contactsLink.addEventListener('click', function (evt) {
  evt.preventDefault();
  overlay.classList.add('overlay--active');

  if (storage) {
    inputLogin.value = storage;
    inputMail.focus();
  } else {
    inputLogin.focus();
  }
});

closeButton.addEventListener('click', function (evt) {
  evt.preventDefault();
  overlay.classList.remove('overlay--active');
});

form.addEventListener('submit', function (evt) {
  if (!inputLogin.value || !inputMail.value) {
    evt.preventDefault();
    console.log('Введите ваше имя и пароль');
  } else {
    if (isStorageSupport) {
      storage = localStorage.setItem('login', inputLogin.value);
    }
  }
});

window.addEventListener('keydown', function (evt) {
  if (evt.keyCode === 27) {
    overlay.classList.remove('overlay--active');
  }
});
