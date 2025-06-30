export const pushToDataLayer = (eventData) => {
    // Make sure dataLayer exists
    window.dataLayer = window.dataLayer || [];
    
    // Push the event
    window.dataLayer.push(eventData);
    
    console.log('GTM Event Pushed:', eventData);
  };