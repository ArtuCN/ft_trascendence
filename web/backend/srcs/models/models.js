export class User {
  constructor({ username = '', mail = '', psw = '', token = '', wallet = '', is_admin = false, google_id = '' }) {
    this.username = username;
    this.mail = mail;
    this.psw = psw;
    this.token = token;
    this.wallet = wallet;
    this.is_admin = is_admin;
    this.google_id = google_id;
  }
}

export default {User}