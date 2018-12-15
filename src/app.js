import './assets/scss/app.scss';
import $ from 'cash-dom';

export class App {
  initializeApp() {
    $('.load-username').on('click', () => {
      $('.username.input').removeClass('is-danger');
      const userName = $('.username.input').val();
      const isUserNameValid = (/^[a-zA-Z0-9\-\_]+$/).test(userName);
      if (isUserNameValid) {
        $('#spinner').removeClass('is-hidden');
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
        .catch((error) => {
            alert('User does not exist or api limit was reached');
        });
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
            <p class="heading">${date}</p>
            <div class="content">
              <div class="gh-event">
                <div class="gh-event__action">
                  <div class="gh-event__user">
                    <img width="32" src="${user.avatar_url}"/>
                  </div>
                  <div class="gh-event__message">
                    <a href="${this.profile.html_url}">${user.display_login}</a>
                    ${message}
                  </div>
                </div>
                <div class="gh-event__repo">
                  <a href="https://github.com/${repo.name.toLowerCase()}">${repo.name}</a>
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
              `${payload.action} <a href="${payload.pull_request.html_url}">pull request</a>`
            );
            const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(created_at));
            $('#user-timeline').append(template(actor, false, message, date, repo))
            break;
          }
          case 'PullRequestReviewCommentEvent': {
            const {repo, payload, actor, created_at} = event;
            const message = (
              `created <a href="${payload.comment.html_url}">comment</a> to <a href="${payload.pull_request.html_url}">pull request</a>`
            );
            const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(created_at));
            $('#user-timeline').append(template(actor, 'is-primary', message, date, repo))
            break;
          }
        }
      });
    })
    .catch((error) => {
        $('#spinner').addClass('is-hidden');
        alert('Failed to receive user history, please try again later');
    });
  }
}
