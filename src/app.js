import './assets/scss/app.scss';
import $ from 'cash-dom';
import 'es6-promise/auto'
import 'isomorphic-fetch'


export class App {

  constructor() {

    this.userNameInput = $('.username.input');
    this.loadButton = $('.load-username');
    this.userTimeline = $('#user-timeline');
    this.isInputValidate = false;
    this.spinner = $("#spinner");
    this.columns = $("#main-columns");
    this.initializeApp();
  }

  initializeApp() {

    this.loadButton.on('click', e => {
      e.preventDefault();

      const userName = this.userNameInput.val();

      if (userName.match(/^[a-z0-9_-]+$/)) {

        if (this.isInputValidate) {
          this.removeErrorSign();
          this.isInputValidate = false;
        }
        
        this.getUserProfile(userName);

      } else {
        this.addErrorSign("red");
        this.isInputValidate = true;
      }
    })
  }

  getUserProfile(userName) {

    this.isLoading(true);
    
    fetch(`https://api.github.com/users/${userName}`)
      .then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(profile => {
        this.updateProfile(profile);
        return fetch(`https://api.github.com/users/${userName}/events/public`);
      }).then(response => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then(events => {
        this.getEvents(events);
        this.isLoading(false)
      })
      .catch(error => {
        console.log(error);
        this.isLoading(false)
      })
  }

  isLoading(pending) {
    if (pending) {
      this.spinner.removeClass("is-hidden");      
    }else{
      this.spinner.addClass("is-hidden");
      this.columns.removeClass("is-hidden");
    }
  }

  addErrorSign() {
    this.userNameInput.addClass("is-validation-error");
    console.log(`
     Input value is invalid. Username can only contains lowercase letter, numbers and _ -. Input field cannot be empty.
    `);

  }

  removeErrorSign() {
    this.userNameInput.removeClass("is-validation-error");
  }


  convertDate(aDate) {
    const eventDate = new Date(aDate),
      monthNumber = eventDate.getMonth(),
      monthsNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];


    return {
      day: eventDate.getDate(),
      month: {
        monthNum: monthNumber + 1,
        monthShortName: monthsNames[monthNumber]
      },
      fullYear: eventDate.getFullYear()
    }
  }

  getEvents(events) {

    const event = events.filter(item => {
      if (
        (item.type === "PullRequestEvent" && (item.payload.action === 'opened' || item.payload.action === 'closed')) ||
        item.type === "PullRequestReviewCommentEvent"
      ) {
        return item;
      }
    });

    let eventsTemplates = "";


    event.forEach((event, index) => {
      const {
        day,
        month: {
          monthNum
        },
        month: {
          monthShortName: month
        },
        fullYear
      } = this.convertDate(event.created_at),
        primary = index === 1 ? "is-primary" : "",

        template = `
      <article class="timeline-item ${primary}">
       <h2 class="visuallyhidden">Event type: ${event.type}</h2>
        <div class="timeline-marker  ${primary}"></div>
        <div class="timeline-content">
         <time class="heading" datetime="${monthNum}-${day}-${fullYear}">
             ${month}, ${day}, ${fullYear}
         </time>        
          <div class="content">
          <img class="content-avatar" src="${event.actor.avatar_url}" alt="Avatar of ${event.actor.login}"/>
          <div class="content-info">
                <span class="gh-username">                
                  <a href="https://github.com/${event.actor.login}">${event.actor.login}</a>
                </span>
               ${event.payload.action}
            <a href="${event.payload.pull_request.html_url}">pull request</a>
            <p class="repo-name">
              <a href="https://github.com/${event.repo.name}">
                 <cite> ${event.repo.name} </cite>
              </a>
            </p>
          </div>
          </div>
        </div>
      </article>
  `
      eventsTemplates += template;


    })
    this.userTimeline.html(eventsTemplates);
 
  }


  updateProfile(profile) {
    $('#profile-name').text(profile.login)
    $('#profile-image').attr('src', profile.avatar_url)
    $('#profile-url').attr('href', profile.html_url).text(profile.login)
    $('#profile-bio').text(profile.bio || '(no information)')
  }
}