# Apify Scraper Challenge

By [Ryan Case](https://www.linkedin.com/in/ryan-t-case/)

[Check out my Portfolio](https://ryan-t-case.github.io/)

## Instructions

1. Navigate to [repo](https://github.com/Ryan-T-Case/apify_scraper_challenge)
2. Clone locally using
   `git clone https://github.com/Ryan-T-Case/apify_scraper_challenge.git`
3. Navigate to the project directory using `cd apify_scraper_challenge`
3. Install Node.js dependencies using `npm install`
5. Run the code using `node main.js`
6. If the code begins running successfully, the Apify SDK Puppeteer Crawler will open a browser window and begin scraping through each event page on the Visit Houston website, starting with [page 1](https://www.visithoustontexas.com/events/?page=1)
7. Links to each event on the page will be grabbed and enqueued into the requestQueue to be processed once all 9 events pages have finished processing. 
8. Event data will be scraped from each event details page and populated into an event object, which will be outputted to the console.
9. Enjoy!


## Discussion

I used the Apify SDK web crawling and scraping library, as well as the following packages.

#### Additional Packages Used

- I used [parse-address](https://www.npmjs.com/package/parse-address) to assist with handling parsing of scraped address strings. This made it easy to break up the address into components before it is populated into the event object.


## Objectives

#### 1. Utilizing the demo apify puppeteer crawler to scrape the data from this event page: https://www.visithoustontexas.com/event/zumba-in-the-plaza/59011/ , change up the selectors	and	the	functionality of the event data	function to	handle Visit Houston. The specific data points that	should be extracted	from this event	are	the	event name,	the	date and time, whether the event is	recurring or not, the address of the	event, the event details/description, the source url of	the	event, and contact info of the organizer.

I updated the selectors so that they would target the correct data on the Visit Houston event page, and populated an event object with all of this scraped data. Several elements that had data I needed to scrape did not have a class or an id. Thus, I had to use nth-of-child and nth-of-type selectors to grab data from some elements. Since the address data was a single string inside an element on the page, I decided to use the parse-address package to simplify parsing the address string before populating the event object with the address data.

#### 2. Utilize the demo apify puppeteer crawler as well as Apify SDK documentation to develop a second function which paginates the event pages and grabs the event links here: https://www.visithoustontexas.com/events/

I used a requestList to paginate through each of the events pages and grab links to each of the events on the page. I did this so that I could make sure that the requestList ran first, before the requestQueue of links to the events was ran. I also wanted to make sure that the events pages and the event details pages were handled differently by the scraper.

#### 3. Assuming the getEventData function you created from part 1 is generalizable enough to handle Visit Houston event urls other than the one we provided, connect your pagination function in part 2 to feed event links to the function from part 1. The goal of this is to connect your two functions in your apify script so that the script will paginate and collect eventlinks, and then extract the event details from each of the events grabbed in the pagination.

As the scraper paginates through each events page, and before it enqueues each event link to the requestQueue, I used transformRequestFunction to update each Request's userData with a property of eventDetailsPage and a value of true. This is to ensure that when the scraper starts processing the requestQueue, each request will be handled with the logic that scrapes event data from each page. It also ensures that the scraper only attempts to enqueue links from the events pages and not the event detail pages. When I run the scraper, not all pages scrape successfully. The first time I ran the scraper, 57 out of 107 of the pages succeeded, meaning 50 of them failed. I found that this was due to my selectors not being generalizeable enough across each event detail page, particularly with my nth-of-child and nth-of-type selectors. With some elements being missing on one page and present on another, I can see how this caused an issue. I looked into using XPaths for a more generalizeable selector, but was unsuccessful within the time frame of this challenge, and submitted as-is.

#### 4. Utilize the node library moment.js to parse the date that is grabbed in the getEventData function of part 1.

I was unable to get to this goal in the challenge.


## Special Thanks

I would like to thank [OccasionGenius](https://occasiongenius.com/) for the opportunity to attempt this challenge. I learned a lot from this experience, and look forward to learning more about web crawling and scraping with Apify SDK and the best practices behind it. I am particularly curious about how to best implement XPath selectors with the Puppeteer Crawler.



