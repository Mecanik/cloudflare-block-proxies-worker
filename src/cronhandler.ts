/**
 * Author:    	Mecanik (https://mecanik.dev/)
 * Created:   	23.07.2022
 * Updated:   	23.07.2022
 * License: 	Apache License Version 2.0
 * Description: Main trigger (cron) handler
 **/
 
import Utils from './Utils'
const ipRegex = require('ip-regex');

export async function cronRequest(event) 
{
   	try
	{
		let scraped = [];
		
		for (const scraping of Utils.ScrapeList) 
		{
			const init = {
				headers: {
					"Accept": "application/json", 
					"content-type": "application/json;charset=UTF-8",
					"x-info": "Please don't block me, I am an utility to dissallow Proxies on some websites",
					"x-author": "https://mecanik.dev/",
				},
			};
			
			// https://web.scraper.workers.dev/
			const url = `https://web.scraper.workers.dev/?url=${scraping[0]}&selector=${encodeURIComponent(scraping[1])}&scrape=text&pretty=true`;
			
			const hostname = Utils.getHostnameFromRegex(scraping[0]);
			
			const response: any = await fetch(url, init).then(response => {
				if (!response.ok) {
				  throw new Error(response.statusText)
				}
				return response.json();
			});

			for (const [key, value] of Object.entries(response.result[scraping[1]])) 
			{
				if (ipRegex.v4({exact: true}).test(value) || ipRegex.v6({exact: true}).test(value))
				{
					if(!scraped.some(o => value === o.key)) {
						scraped.push({ key: value, value: hostname ? hostname : "no hostname"});
					}
				}
			}       
		};
		
		const scraped_total = Object.keys(scraped).length;
		console.log(`[scraped] retrieved proxies: ${scraped_total}`);
		
		let downloaded = [];
		
		for (const raw of Utils.RawList) 
		{
			const init = {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
					"x-info": "Please don't block me, I am an utility to dissallow Proxies on some websites",
					"x-author": "https://mecanik.dev/",
				},
			};
			
			const response = await fetch(raw[0], init).then(response => {
				if (!response.ok) {
				  throw new Error(response.statusText)
				}
				return response;
			});
			
			const results = await Utils.gatherResponse(response);

			const lines = results.toString().replace(/\r\n/g,'\n').split('\n');

			for(let line of lines)
			{
				const ip = await Utils.getIPFromLine(line);
				
				if(ip !== null && !downloaded.some(o => ip === o.key))
					downloaded.push({ key: ip, value: raw[1] });
			}       
		};
		
		const downloaded_total = Object.keys(downloaded).length;
		console.log(`[downloaded] retrieved proxies: ${downloaded_total}`);
		
		// Fastest solution I could find.
		scraped.push(...downloaded);
		
		console.log(`[merged]: ${Object.keys(scraped).length}`);
		
		// Fastest solution I could find.
		let obj = scraped.reduce((obj, item) => (obj[item.key] = item.value, obj) ,{});
		
		const saved_ok = await PROXIES_COMBINED_LIST.put("ipset", JSON.stringify(obj), {
			// This is just some extra information in case you need it...
			// Free of cost of course...
			metadata: { 
				info: JSON.stringify(new Object({
					'scraped': scraped_total,
					'downloaded': downloaded_total,
				}))
			},
			// This is to ensure that if something goes wrong with the cron and the list was not updated in a week, the list will expire. 
			// It wouldn't be a good idea to keep blocking IP's if we don't know that they are still part of the TOR Network. 
			// Ammend this as needed...
			expirationTtl: 604800
		});
		
		console.log(`[saved_ok]: ${saved_ok}`);
	} 
	catch(e) 	
	{
		console.log(e.message);
		//console.log(e.stack);
	}
}