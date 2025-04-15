const port = browser.runtime.connectNative('dev.hakancelik.siteseeker');

port.onMessage.addListener((message) => {
  console.log('Received message from native app:', message);
});

port.onDisconnect.addListener(() => {
  console.log('Disconnected from native app');
});

browser.history.onVisited.addListener((result) => {
  port.postMessage({
    type: 'visit',
    data: {
      url: result.url,
      title: result.title,
      timestamp: Date.now()
    }
  });
});

browser.history.onVisitRemoved.addListener((removed) => {
  port.postMessage({
    type: 'remove',
    data: {
      allHistory: removed.allHistory,
      urls: removed.urls
    }
  });
}); 