import './assets/scss/app.scss';
import $ from 'cash-dom';
import moment from 'moment';

export class App {
  initializeApp() {
    $('.load-username').on('click', () => {
      $('.username.input').removeClass('is-danger');
      $('#spinner').removeClass('is-hidden');
      const userName = $('.username.input').val();
      const isUserNameValid = (/^[a-zA-Z0-9\-\_]+$/).test(userName);
      if (isUserNameValid) {
        fetch(`https://api.github.com/users/${userName}`)
        .then((response) => {
          if (!!response.ok) {
            return response.json();
          }
            throw response.json();
        })
        .then((body) => {
          this.profile = body;
          this.update_profile();
        })
        .catch((errorPromise) => errorPromise.then((error) => {
          alert(error.message);
          $('#spinner').addClass('is-hidden');
        }));
      } else {
        $('.username.input').addClass('is-danger');
      }
    });
  }

  update_profile() {
    $('#profile-name').text(this.profile.name);
    $('#profile-image').attr('src', this.profile.avatar_url);
    $('#profile-url').attr('href', this.profile.html_url).text(this.profile.login);
    $('#profile-bio').text(this.profile.bio || '(no information)');
    $('.profile-container').removeClass('is-hidden');
    this.load_user_history();
  }

  load_user_history() {
    const template = (user, type, message, date, repo) => (
      `<div class="timeline-item ${type && type}">
          <div class="timeline-marker ${type && type}"></div>
          <div class="timeline-content">
            <p class="heading">${moment(date).format('ll')}</p>
            <div class="content">
              <div class="gh-event">
                <div class="gh-event__action">
                  <div class="gh-event__user">
                    <img width="32" src="${user.avatar_url}"/>
                  </div>
                  <div class="gh-event__message">
                    <a href="${user.url}">${user.display_login}</a>
                    ${message}
                  </div>
                </div>
                <div class="gh-event__repo">
                  <a href="${repo.url}">${repo.name}</a>
                </div>
              </div>
            </div>
          </div>
        </div>`
    );
    fetch(`https://api.github.com/users/${this.profile.login}/events/public`)
    .then((response) => {
      if (!!response.ok) {
        return response.json();
      }
        throw response.json();
    })
    .then((body) => {
      $('#user-timeline').html('');
      $('#spinner').addClass('is-hidden');
      $('.events-container').removeClass('is-hidden');
      body.map((event) => {
        switch(event.type) {
          case 'PullRequestEvent': {
            const {repo, payload, actor, created_at} = event;
            const message = (
              `${payload.action} <a href="${payload.pull_request.url}">pull request</a>`
            );
            $('#user-timeline').append(template(actor, false, message, created_at, repo))
            break;
          }
          case 'PullRequestReviewCommentEvent': {
            const {repo, payload, actor, created_at} = event;
            const message = (
              `created <a href="${payload.comment.url}">comment</a> to <a href="${payload.pull_request.url}">pull request</a>`
            );
            $('#user-timeline').append(template(actor, 'is-primary', message, created_at, repo))
            break;
          }
        }
      });
    })
    .catch((errorPromise) => errorPromise.then((error) => {
      $('#spinner').addClass('is-hidden');
      alert('Failed to receive user history, please try again later');
    }))
  }
}
