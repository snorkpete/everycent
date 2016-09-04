
import {Component, Input, OnInit} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs";
import {LoadingIndicatorService} from "./loading-indicator.service";
@Component({
    selector: 'gg-loading-indicator',
    styles:[`
        div.backdrop {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: block;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 2500;
        }
        div.loading-text{
            background-color: #464843;
            font-weight: bold;
            border: 2px solid white;
            color: white;
            margin: auto;
            text-align: center;
            width: 100px;
            top: 400px;
            margin-top: 400px;
            padding: 10px;
        }
    `],
    template: `
         <div class="backdrop" *ngIf="showLoading | async">
            <div class="loading-text">Loading...</div>
        </div>
    `
})
export class LoadingIndicatorComponent implements OnInit{
    public showLoading: Observable<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private loadingIndicatorService: LoadingIndicatorService
    ){}

    ngOnInit(){
        this.showLoading = this.loadingIndicatorService.loadingIndicator;
        //this.showLoading = showLoading$.debounceTime(300);
    }
}