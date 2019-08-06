const Apify = require('apify');
const util = require('util');
const parser = require('parse-address');


Apify.main(async () => {

    //Build request list including each event page
    const sources = [
        'https://www.visithoustontexas.com/events/?page=1',
        'https://www.visithoustontexas.com/events/?page=2',
        'https://www.visithoustontexas.com/events/?page=3',
        'https://www.visithoustontexas.com/events/?page=4',
        'https://www.visithoustontexas.com/events/?page=5',
        'https://www.visithoustontexas.com/events/?page=6',
        'https://www.visithoustontexas.com/events/?page=7',
        'https://www.visithoustontexas.com/events/?page=8',
        'https://www.visithoustontexas.com/events/?page=9',
    ];

    // Open up the request list and request queue
    const requestList = await Apify.openRequestList('pages', sources);
    const requestQueue = await Apify.openRequestQueue();

    // Create crawler.
    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        requestQueue,

        // This page is executed for each request.
        // If request fails then it's retried 3 times.
        // Parameter page is Puppeteers page object with loaded page.
        handlePageFunction: async ({ page, request }) => {

            console.log(`Processing ${request.url}`);
        
            //Only enqueue event links from the Houston Events Calendar pages
            if (!request.userData.eventDetailsPage) {
                await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: '.item-int > .info > .title > a',
                    transformRequestFunction: req => {
                        req.userData.eventDetailsPage = true;
                        return req;
                    },
                });
            }
        
            //If the page is an enqueued event details page, then scrape it for event data
            if (request.userData.eventDetailsPage) {
        
                //Handling parsing of address string
                let address = await page.$eval('.adrs', element => element.textContent);
                let parsed = parser.parseLocation(address);
        
                //Function so that prefix is only included in address when it is defined
                const handleStreetAddress = () => {
                    if (parsed.prefix === undefined) {
                        const streetAddress = (parsed.number + " " + parsed.street + " " + parsed.type);
                        return streetAddress;
                    } else {
                        const streetAddress = (parsed.number + " " + parsed.prefix + " " + parsed.street + " " + parsed.type);
                        return streetAddress;
                    }
                }
        
                // Populate extracted data from page into an event object
                let event = {
                    url: await page.$eval('*[data-seo-website]', element => element.href), //selector error on some events
                    name: await page.$eval('h1', element => element.innerText),
                    description: await page.$eval('div.description > p', element => element.innerText),
                    date: await page.$eval('div.dates:first-of-type', element => element.innerText), //selector error on some events
                    time: await page.$eval('.detail-c2.left > div:nth-child(8)', element => element.lastChild.textContent), //selector error on some events
                    recurring: await page.$eval('div.dates:nth-of-type(2)', element => element.innerText), //selector error on some events
                    place: {
                        street: handleStreetAddress(), //Function currently not accounting for when the event is missing street address data
                        city: parsed.city, //If value is missing, it currently returns undefined
                        state: parsed.state, //If value is missing, it currently returns undefined
                        postal: parsed.zip //If value is missing, it currently returns undefined
                    },
                    details: {
                        contact: await page.$eval('.detail-c2.left > div:nth-child(6)', element => element.lastChild.textContent),
                        phone: await page.$eval('.detail-c2.left > div:nth-child(7)', element => element.lastChild.textContent),
                        admission: await page.$eval('.detail-c2.left > div:nth-child(9)', element => element.lastChild.textContent), //selector error on some events, targeting based on order of appearance may not be best due to data sometimes being missing on different events.
                    },
                    timestamp: Date.now(),
                }
        
                // Log data (util is a tool that nicely formats objects in the console)
                console.log(util.inspect(event, false, null));
        
            }
        },

        // If request failed 4 times then this function is executed.
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request ${request.url} failed 4 times`);
        },
    });

    // Run crawler.
    await crawler.run();
    
});


