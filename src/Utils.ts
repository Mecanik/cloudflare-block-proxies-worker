/**
 * Author:    	Mecanik (https://mecanik.dev/)
 * Created:   	23.07.2022
 * Updated:   	23.07.2022
 * License: 	Apache License Version 2.0
 * Description: Utilies
 **/
 
const ipRegex = require('ip-regex');

export default class Utils 
{
	static ScrapeList: Map<string, string> = new Map([
	  ['https://www.us-proxy.org/', '#list > div > div.table-responsive > div > table > tbody > tr > td:nth-child(1)'],
	  ['https://www.sslproxies.org/', '#list > div > div.table-responsive > div > table > tbody > tr > td:nth-child(1)'],
	  ['https://www.socks-proxy.net/', '#list > div > div.table-responsive > div > table > tbody > tr > td:nth-child(1)'],
	  ['https://www.free-proxy-list.net/', '#list > div > div.table-responsive > div > table > tbody > tr > td:nth-child(1)'],
	  // The below need to be revised because they are using Datatables and we are not scraping all proxies
	  ['https://www.proxy-list.download/HTTP', '#tabli > tr > td:nth-child(1)'],
	  ['https://www.proxy-list.download/HTTPS', '#tabli > tr > td:nth-child(1)'],
	  ['https://www.proxy-list.download/SOCKS4', '#tabli > tr > td:nth-child(1)'],
	  ['https://www.proxy-list.download/SOCKS5', '#tabli > tr > td:nth-child(1)'],
	]);
	
	static RawList: Map<string, string> = new Map([
	  ['https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt', 'spys.me'],
	  ['https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt', 'http'],
	  ['https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt', 'socks4'],
	  ['https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt', 'socks5'],
	  ['https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all', 'http'],
	  ['https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks4&timeout=10000&country=all', 'socks4'],
	  ['https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=10000&country=all', 'socks5'],
	]);
	
	// https://stackoverflow.com/a/54947757/6583298
	static getHostnameFromRegex = (url) => {
	  // run against regex
	  const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
	  // extract hostname (will be null if no match is found)
	  return matches && matches[1];
	}
	
	static async getIPFromLine(ip_address): Promise<string>
	{
		let address_matches :any[] = [];

		const regex = /^\[?([0-9a-f:.]*)]?:\d+$/gm;
		let m;

		while ((m = regex.exec(ip_address)) !== null) 
		{
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			m.forEach((match, groupIndex) => {
				address_matches = [...address_matches, match]; 
			});
		}

		if (address_matches.length === 2) 
		{
			const address = address_matches[1];
			
			if (ipRegex.v4({exact: true}).test(address) || ipRegex.v6({exact: true}).test(address)) 
			{
				return address;
			}
		}
		
		return null;
	}
	
	/**
	 * gatherResponse awaits and returns a response body as a string.
	 * Use await gatherResponse(..) in an async function to get the response body
	 * @param {Response} response
	 */
	static async gatherResponse(response) 
	{
	  const { headers } = response;
	  const contentType = headers.get('content-type') || '';
	  if (contentType.includes('application/json')) {
		return JSON.stringify(await response.json());
	  } else if (contentType.includes('application/text')) {
		return response.text();
	  } else if (contentType.includes('text/html')) {
		return response.text();
	  } else {
		return response.text();
	  }
	}
}