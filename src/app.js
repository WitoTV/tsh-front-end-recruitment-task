import './assets/scss/app.scss';
import $ from 'cash-dom';

export class App {
  initializeApp() {
    $('.load-username').on('click', () => {
      $('.username.input').removeClass('is-danger');
      const userName = $('.username.input').val();
      const isUserNameValid = (/^[a-zA-Z0-9\-\_]+$/).test(userName);
      if (isUserNameValid) {
        fetch('https://api.github.com/users/' + userName)
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
  }
}
