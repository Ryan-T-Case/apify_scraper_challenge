const Apify = require('apify');
const util = require('util');
const parser = require('parse-address');


Apify.main(async () => {

    // Get queue and enqueue first url.
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest(new Apify.Request({ url: 'https://www.visithoustontexas.com/event/zumba-in-the-plaza/59011/' }));

    // Create crawler.
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,

        // This page is executed for each request.
        // If request fails then it's retried 3 times.
        // Parameter page is Puppeteers page object with loaded page.
        handlePageFunction: getEventData,

        // If request failed 4 times then this function is executed.
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request ${request.url} failed 4 times`);
        },
    });

    // Run crawler.
    await crawler.run();
    
});



const getEventData = async ({ page, request }) => {

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
        url: await page.$eval('*[data-seo-website]', element => element.href),
        name: await page.$eval('h1', element => element.innerText),
        description: await page.$eval('div.description > p', element => element.innerText),
        date: await page.$eval('div.dates:first-of-type', element => element.innerText),
        time: await page.$eval('.detail-c2.left > div:nth-child(8)', element => element.lastChild.textContent),
        recurring: await page.$eval('div.dates:nth-of-type(2)', element => element.innerText),
        place: {
            street: handleStreetAddress(),
            city: parsed.city,
            state: parsed.state,
            postal: parsed.zip
        },
        details: {
            contact: await page.$eval('.detail-c2.left > div:nth-child(6)', element => element.lastChild.textContent),
            phone: await page.$eval('.detail-c2.left > div:nth-child(7)', element => element.lastChild.textContent),
            admission: await page.$eval('.detail-c2.left > div:nth-child(9)', element => element.lastChild.textContent),
        },
        timestamp: Date.now(),
    }

    // Log data (util is a tool that nicely formats objects in the console)
    console.log(util.inspect(event, false, null));
}


