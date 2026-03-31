import React, { useEffect } from 'react';

export function HubspotCalendar() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // Add custom styling for the HubSpot iframe
    const style = document.createElement('style');
    style.textContent = `
      .meetings-iframe-container iframe {
        width: 100% !important;
        height: 750px !important;
        border: none !important;
        background: transparent !important;
      }
      .meetings-iframe-container {
        max-width: 100%;
        margin: 0 auto;
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-1 lg:px-1">
      <div 
        className="meetings-iframe-container" 
        data-src="https://meetings.hubspot.com/etsy?embed=true"
      ></div>
    </div>
  );
}