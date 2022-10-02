(async () => {

  // Check if the user has a current session. If they do we want to return out of the function.
  // This will limit the amount of API requests we make & decrease the amount of Javascript we are running.
  const redirectSession = sessionStorage.getItem('dontRedirect');
  
  if(redirectSession) return;

  // Establish our store objects
  const stores = [
    {
      store: `http://mystore.com`,
      countries: {
        "AU": "Australia",
        "NZ": "New Zealand",
      }
    },
    {
      store: `http://us.mystore.com`,
      countries: {
        "US": "United States",
        "UM": "United States Outlying Islands",
      }
    },
    {
      store: `http://eu.mystore.com`,
      countries: {
        "AL": "Albania",
        "NL": "Netherlands",
      }
    },
  ];

  // Making GET request to IP lookup API. The response will include the status as well as the clients countryCode.
  // If the response status is not a success, we are returning a default countryCode.
  const getClientCountryCode = async () => {
    const response = await fetch('http://ip-api.com/json/?fields=status,message,countryCode');
    const result = await response.json();
    return result.status === 'success' ? result : {countryCode: 'AU'};
  }

  // Destructuring countryCode from the return value of our getClientCountryCode function.
  const { countryCode } = await getClientCountryCode();
  const clientCountryCode = countryCode;

  // Match clientCountryCode to corresponding store location to get the correct URL.
  // If no store is found, set a default.
  const clientStoreUrl = stores.find(store => store.countries[clientCountryCode]).store || `http://mystore.com`;

  // Once we have the client's store, we want to set a piece of state in the sessionStorage that we can reference later.
  // This will allow us to check if we have previously confirmed that the client is on the correct store.
  sessionStorage.setItem('dontRedirect', true);

  // The client's current URL. This does not include the path.
  // For example this would be https://mystore.com
  const currentUrl = `https://${window.location.hostname}`;

  // Checking if the currentUrl equals the clientStoreUrl.
  // If it does there is no need to redirect and we can simply return out of the function.
  if(currentUrl.includes(clientStoreUrl)) return;

  // Constructing our redirect path. It's important to check if the URL has a path and a search.
  // This way if we send the client to a product page from an AD, and they are on the wrong store,
  // it will redirect them to the correct stores product page. Not just the home page.
  const path = window.location.pathname === '/' ? '' : window.location.pathname;
  const search = window.location.search;
  window.location.href = clientStoreUrl + path + search;
})();