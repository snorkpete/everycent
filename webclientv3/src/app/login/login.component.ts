import {Component, OnInit} from '@angular/core';
import {MainToolbarService} from '../shared/main-toolbar/main-toolbar.service';
import {AuthService} from '../shared/auth/auth.service';
import {MessageService} from '../message-display/message.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ec-login',
  styles: [`
    mat-card {
        width: 300px;
        margin: auto;
        margin-top: 15px;
        box-shadow: 10px 10px 10px #888888;
    }
    mat-card-actions {
        margin: 0;
    }
    mat-toolbar{
        margin-bottom: 15px;
    }
  `],
  template: `
    <form (ngSubmit)="login()">
    <mat-card>
        <mat-card-title color=""><mat-icon>lock </mat-icon> EveryCent - Log In</mat-card-title>
        
        <mat-divider></mat-divider>
        
        <mat-card-content fxLayout="column">
            <mat-input-container>
                <input matInput placeholder="Email" type="text" name="email" [(ngModel)]="email" class="email"/>
            </mat-input-container>
            
            <mat-input-container>
                <input matInput placeholder="Password" type="password" name="password" [(ngModel)]="password" class="password"/>
            </mat-input-container>
        </mat-card-content>
        
        <mat-divider></mat-divider>
        
        <mat-card-actions>
            <button mat-raised-button color="primary" type="submit" class="login">Log In</button>
            <button mat-raised-button color="" type="reset">Cancel</button>
        </mat-card-actions>
    </mat-card>
    </form>
  `
})
export class LoginComponent implements OnInit {

  email: string;
  password: string;

  constructor(
    private mainToolbarService: MainToolbarService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.mainToolbarService.hideToolbar();
  }

  login(): Promise<any> {
    this.messageService.clear();

    return this.authService
      .logIn(this.email, this.password)
      .then(result => this.router.navigateByUrl('/'))
      .catch(error => this.messageService.setErrorMessage(error)) ;
  }

}
