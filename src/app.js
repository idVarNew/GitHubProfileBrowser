import './assets/scss/app.scss';
import $ from 'cash-dom';
import 'es6-promise/auto'
import 'isomorphic-fetch'


export class App {

  constructor() {

    this.userNameInput = $('.username.input');
    this.loadButton = $('.load-username');
    this.errorOnValidation = false;
    this.initializeApp();
  }

  initializeApp() {

    this.loadButton.on('click', (e) => {
      e.preventDefault();
      
      const userName = this.userNameInput.val();

      if (userName.match(/^[a-z0-9_-]+$/)) {

        this.errorOnValidation = false;

        if (!this.errorOnValidation) {
          this.removeErrorSign()
        }

        this.getUserProfile(userName);

      } else {
        this.addErrorSign("red");
        this.errorOnValidation = true;
      }
    })
  }

  getUserProfile(userName) {
    fetch('https://api.github.com/users/' + userName)
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((profile) => {
        this.updateProfile(profile)
      }).catch((error) => {
        console.log(error);
      })
  }

  addErrorSign() {
    this.userNameInput.addClass("is-validation-error");
    console.log(`
     Input value is invalid. Username name can only contains lowercase letter, numbers and _ -. Input cannot be empty.
    `)
  }

  removeErrorSign() {
    this.userNameInput.removeClass("is-validation-error");
    console.log(`
    Input value is invalid. Username name can only contains lowercase letter, numbers and _ -. Input cannot be empty.
  `)
  }

  updateProfile(profile) {
    $('#profile-name').text(profile.login)
    $('#profile-image').attr('src', profile.avatar_url)
    $('#profile-url').attr('href', profile.html_url).text(profile.login)
    $('#profile-bio').text(profile.bio || '(no information)')
  }
}