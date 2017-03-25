import {environment} from "../environments/environment";

let BASE_URL = '';
if (environment.production) {
  BASE_URL = '';
} else {
  BASE_URL = 'http://localhost:3000';
}

export {BASE_URL};

