
import {Component, Input, OnInit} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs";
import {LoadingIndicatorService} from "../core/loading-indicator.service";
@Component({
    selector: 'ec-loading-indicator',
    styles:[`
        div.container{
            width: 100%;
            margin-left:10px;
        }
        md-progress-circle{
            width: 25px;
            height: 25px;
        }
        md-progress-bar{
        }
    `],
    template: `
         <div *ngIf="showLoading | async" class="loading-container">
            <md-progress-bar mode="indeterminate" color="accent"></md-progress-bar>
        </div>
    `
})
export class LoadingIndicatorComponent implements OnInit{
    public showLoading: Observable<boolean>;

    constructor(
        private loadingIndicatorService: LoadingIndicatorService
    ){}

    ngOnInit(){
        this.showLoading = this.loadingIndicatorService.loadingIndicator;
    }
}