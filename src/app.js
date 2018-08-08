import './assets/scss/app.scss';
import $ from 'cash-dom';
import 'es6-promise/auto'
import 'isomorphic-fetch'


export class App {

  constructor() {
    this.initializeApp();
    this.usernameInput = $('.username.input')
  }

  initializeApp() {

    $('.load-username').on('click', (e) => {
      const userName = this.usernameInput.val()

      fetch('https://api.github.com/users/' + userName)
        .then((response) => {
          if (!response.ok) throw Error(response.statusText);
          return response.json()
        })
        .then((profile) => {
          this.updateProfile(profile)
        }).catch((error) => {
          console.log(error);
        })
    })
  }


  updateProfile(profile) {
    $('#profile-name').text(this.usernameInput.val())
    $('#profile-image').attr('src', profile.avatar_url)
    $('#profile-url').attr('href', profile.html_url).text(profile.login)
    $('#profile-bio').text(profile.bio || '(no information)')
  }
}