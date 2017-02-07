/* tslint:disable:no-unused-variable */

import {async, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {ApiGateway} from '../api/api-gateway.service';
import {ApiGatewayStub} from '../../test/api-gateway-stub';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: ApiGateway, useValue: ApiGatewayStub }
      ]
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'ec works!'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('ec works!');
  }));

  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('ec works!');
  }));
});
