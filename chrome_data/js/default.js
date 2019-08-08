chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('main.html', {
      id:'posture_eyecare',
      frame:"none",
      bounds:{
        width: 660,
        height: 450
      },
      minWidth: 660,
      minHeight: 450,

      maxWidth: 660,
      maxHeight: 450
    });
});

