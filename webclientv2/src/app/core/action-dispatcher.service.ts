import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable()
export class ActionDispatcher{

  // private behaviour subject used for sending actions
  private _action$ = new BehaviorSubject<Action>({type: ''});

  // public shared observable so we only get one instance even with multiple subscriptions
  public action$ = this._action$.share();
  constructor(){

  }

  dispatch(action: Action){
    this._action$.next(action);
  }

  payloadByActionType$(type: string){
    return this._action$.filter(action => action.type == type).map(action => action.payload);
  }
}

export interface Action{
  type: string,
  payload?: any
}


