import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signupUsers: any[] = [];
  signupObj: any = {
    email: '',
    password: '',
    confirm: ''
  };

  loginObj: any = {
    email: '',
    password: ''
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Lecture des données enregistrées dans le localStorage
    const localData = localStorage.getItem('signUpUsers');
    if (localData) {
      this.signupUsers = JSON.parse(localData);
    }
  }

  onSignUp() {
    // Vérifier si les mots de passe correspondent
    if (this.signupObj.password !== this.signupObj.confirm) {
      alert('Passwords do not match!');
      return;
    }

    // Ajouter l'utilisateur à la liste et sauvegarder dans le localStorage
    this.signupUsers.push({
      email: this.signupObj.email,
      password: this.signupObj.password
    });
    localStorage.setItem('signUpUsers', JSON.stringify(this.signupUsers));

    // Réinitialiser l'objet
    this.signupObj = {
      email: '',
      password: '',
      confirm: ''
    };
    alert('Signup successful!');
  }

  onLogin() {
    // Trouver l'utilisateur correspondant
    const foundUser = this.signupUsers.find(
      (user) => user.email === this.loginObj.email && user.password === this.loginObj.password
    );

    if (foundUser) {
      alert('Login Successful');
      this.router.navigate(['/home']);
    } else {
      alert('Invalid Credentials');
    }

    // Réinitialiser l'objet
    this.loginObj = {
      email: '',
      password: ''
    };
  }
}
