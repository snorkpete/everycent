
import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
@Injectable()
export class LoadingIndicatorService{

    public loadingIndicator: BehaviorSubject<boolean>;
    constructor(){
        this.loadingIndicator = new BehaviorSubject(true);
    }

    showLoadingIndicator(){
        this.loadingIndicator.next(true);
    }

    hideLoadingIndicator(){
        this.loadingIndicator.next(false);
    }
}