/**
 * Author:    	Mecanik (https://mecanik.dev/)
 * Created:   	23.07.2022
 * Updated:   	23.07.2022
 * License: 	Apache License Version 2.0
 * Description: Main trigger (cron) entry point
 **/

import { cronRequest } from './cronhandler'

addEventListener('scheduled', event => {
  event.waitUntil(cronRequest(event))
})