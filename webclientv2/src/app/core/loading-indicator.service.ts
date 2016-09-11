
import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
@Injectable()
export class LoadingIndicatorService{

    public loadingIndicator: BehaviorSubject<boolean>;
    constructor(){
        this.loadingIndicator = new BehaviorSubject(false);
    }

    show(){
      this.loadingIndicator.next(true);
    }

    hide(){
      this.loadingIndicator.next(false);
    }
}