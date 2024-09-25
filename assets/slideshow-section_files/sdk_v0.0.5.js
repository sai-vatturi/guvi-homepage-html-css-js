"use strict";

(function (win, doc) {
  const isFetchSupported = typeof fetch !== 'undefined' && fetch !== null;

  const httpCall = function (url, method, headers, payload, callback) {
    if (isFetchSupported) return fetchWrapper(url, method, headers, payload, callback);
    return invokeXHR(url, method, headers, payload, callback);
  };

  const invokeXHR = function (url, method, headers, payload, callback) {
    const xhr = new XMLHttpRequest();
    if (method === "POST") xhr.withCredentials = true; // Allow sending of cookies
    xhr.open(method, url, true); // Async call for both OLD and NEW browsers
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 200) {
          const responseData = JSON.parse(this.responseText);
          return callback({ status: "success", response: responseData });
        } else {
          return callback({ status: "error", response: "XHR request failed" });
        }
      }
    };

    xhr.send(payload);
  };

  const fetchWrapper = function (url, method, headers, payload, callback) {
    const config = {
      method: method,
      cache: "reload", // Ensure bypassing the cache
      headers: headers,
      body: payload
    };
    if (method === "POST") config.credentials = "include";
    fetch(url, config).then(async (res) => {
      const responseData = await res.json();
      return callback({ status: "success", response: responseData });
    }).catch((error) => {
      return callback({ status: "error", response: error });
    });
  };

  const loadCustomScript = function (config) {
    (function (win, d, t, s, obj, oe, st) {
      win["chateleonCustomScript"] = obj;
      oe = d.createElement(t);
      st = d.getElementsByTagName("script")[0];
      oe.async = 1;
      oe.src = s;
      oe.id = "chateleon-custom-script";
      st.parentNode.insertBefore(oe, st);
    })(window, document, "script", config.filePath, "chateleonCustom");
    
    var customScript = document.querySelector("#chateleon-custom-script");
    customScript.addEventListener("load", function () {
      chateleonCustom(config);
    });
  };

  const loadScripts = function (dependencies) {
    dependencies.forEach(dependency => { // forEach not supported in >=IE9
      let script = document.getElementById(dependency.id);
      if (!script) {
        script = document.createElement('script');
        script.src = dependency.url;
        script.type = dependency.type || 'text/javascript';
        script.id = dependency.id;
        script.async = true;
        doc.body.appendChild(script);
      }
    });
  };

  const loadRiveAnimation = function (responseData, MASCOT_CONTAINER_ID) {
    const dependencies = [
      {
        id: 'rive-dependency-script',
        url: 'https://unpkg.com/@rive-app/canvas@2.7.0/rive.js',
      }
    ];

    loadScripts(dependencies);

    const createRiveElement = function () {
      const canvas = document.getElementById('rive-animation');

      if (!canvas) {
        const riveAnimationContainer = document.createElement('canvas');
        riveAnimationContainer.className = MASCOT_CONTAINER_ID + '-rive';
        doc.body.appendChild(riveAnimationContainer);
      }

      const isLoadedIntervalId = setInterval(function () {
        const riveScript = doc.getElementById('rive-dependency-script');
        try { rive; } catch { return; }
        if (!riveScript && !rive) return;
        clearInterval(isLoadedIntervalId);
        new rive.Rive({
          src: responseData,
          canvas: document.querySelector('.' + MASCOT_CONTAINER_ID + "-rive"),
          autoplay: true,
        });
      }, 200);

    }
    console.log('Rive Dependencies Loaded Successfully');
    createRiveElement();
  }

  const loadLottieAnimation = function (responseData, MASCOT_CONTAINER_ID) {
    const dependencies = [
      {
        id: 'lottie-dependency-script',
        url: 'https://unpkg.com/@dotlottie/player-component@1.3.0/dist/dotlottie-player.js'
      }
    ];

    loadScripts(dependencies);

    const lottieScript = doc.getElementById('lottie-dependency-script');
    const createLottieElement = function () {
      const lottieAnimationContainer = document.createElement('dotlottie-player');
      lottieAnimationContainer.src = responseData;
      lottieAnimationContainer.className = MASCOT_CONTAINER_ID + '-lottie';
      lottieAnimationContainer.loop = true;
      lottieAnimationContainer.autoplay = true;
      doc.body.appendChild(lottieAnimationContainer);
    }

    if (lottieScript) {
      console.log('Lottie Dependencies Loaded Successfully');
      createLottieElement();
    } else {
      console.log('Unable to load lottie dependency');
    }
  }

  const loadGifAnimation = function (responseData, MASCOT_CONTAINER_ID) {
    const gifAnimationContainer = new Image();
    gifAnimationContainer.src = responseData;
    gifAnimationContainer.className = MASCOT_CONTAINER_ID + '-gif';
    doc.body.appendChild(gifAnimationContainer);
  };

  const chateleon = function (...args) {
    let config = {
      apiId: '',
      event: '',
      customScript: args[0].customScript || false,
      filePath: args[0].filePath || undefined,
      position: args[0].position || {
        type: "fixed",
        right: "0%",
        bottom: "0%",
      },
      dimensions: args[0].dimensions || {
        height: "150px",
        width: "260px",
        zIndex: 500,
      },
      meta: args[0].meta || {
        position: {
          type: "absolute",
          right: "0%",
          bottom: "0%",
        },
        dimensions: {
          height: "150px",
          width: "260px",
          zIndex: 500
        },
        append: {
          id: undefined,
          class: undefined
        }
      }
    }
    if (typeof args[0] === 'object') {
      config.apiId = args[0].apiId || console.log('Invalid api key');
      config.event = args[0].event || "create";
    } else {
      // On calling sdk from custom script 
      config.apiId = args[1] || console.log('Invalid api key');
      config.event = args[0] || "create";
      config.customImpl = args[4] || undefined;
    }

    // BASE_URL should be replaced using a script like github workflow
    const BASE_URL = "https://sdk-api.chateleon.com";
    const SERVE_PATH = "/serve";
    const TRACK_SERVE_PATH = "/track/serve";
    const TRACK_INTERACTION_PATH = "/track/interaction";
    const MASCOT_CONTAINER_ID = config.id ? ["chateleon-container", config.id].join("-") : "chateleon-container";
    const METHOD = "POST";
    console.info("Chateleon SDK loaded");
    const chateleonContainer = document.createElement("div");
    chateleonContainer.id = MASCOT_CONTAINER_ID;
    if (config.customScript) {
      loadCustomScript(config);
    }
    switch (config.event) {
      case "move":
        moveGif([config.apiId], MASCOT_CONTAINER_ID);
        break;
      case "create":
        // Do an API call with the key and validate
        var url = BASE_URL + SERVE_PATH;
        var headers = {
          "Content-Type": "application/json",
          "x-api-key": config.apiId
        };
        var method = METHOD;
        var payload = null;
        // Call to `/serve` API
        httpCall(url, method, headers, payload, serverApiCallbackHandler);
        break;
      default:
        console.warn("Chateleon Warning : Invalid event : " + config.event);
    }

    function serverApiCallbackHandler(res) {
      var response = res.response;
      if (res.status === 'success') {
        // handle success response
        win.chateleonIsLoaded = true;
        switch (response.data.gifs[0].mascotExtension) {
          case 'RIVE':
            processRiveAnimation(response);
            break;
          case 'LOTTIE_JSON':
            processLottieJsonAnimation(response);
            break;
          case 'LOTTIE':
            processLottieAnimation(response);
            break;
          default:
            processGifAnimation(response);
        }
      } else {
        // Handle error response
        win.chateleonIsLoaded = false;
        console.error(response);
      }
    };

    function processRiveAnimation(response) {
      const mascot = response.data.gifs[0].original;
      if (mascot) {
        loadRiveAnimation(mascot, MASCOT_CONTAINER_ID);
        const riveAnimation = document.querySelector('.' + MASCOT_CONTAINER_ID + "-rive");
        addStyles(riveAnimation, config);
      }
    }

    function processLottieJsonAnimation(response) {
      var url = response.data.gifs[0].original;
      if (url) {
        var headers = {};
        var method = "GET";
        var payload = null;
        // Fetch Lottie JSON dependent script
        httpCall(url, method, headers, payload, lottieJsonCallbackHandler);
      }
    }

    function lottieJsonCallbackHandler(response) {
      const JSONbody = response.response;
      loadLottieAnimation(JSONbody, MASCOT_CONTAINER_ID);
      const lottieAnimation = document.querySelector('.' + MASCOT_CONTAINER_ID + "-lottie");
      addStyles(lottieAnimation, config);
    }

    function processLottieAnimation(response) {
      const mascot = response.data.gifs[0].original;
      if (mascot) {
        loadLottieAnimation(mascot, MASCOT_CONTAINER_ID);
        const lottieAnimation = document.querySelector('.' + MASCOT_CONTAINER_ID + "-lottie");
        addStyles(lottieAnimation, config);
      }
    }

    function processGifAnimation(response) {
      const mascot = response.data.gifs[0].original;
      if (mascot) {
        loadGifAnimation(mascot, MASCOT_CONTAINER_ID);
        const gifAnimation = document.querySelector('.' + MASCOT_CONTAINER_ID + "-gif");
        addStyles(gifAnimation, config);
      }
    }

    function addStyles(mascot, config) {
      if (mascot) {
        if (config.customImpl) {
          config.customImpl(mascot, MASCOT_CONTAINER_ID, trackEvent);
        } else {
          createAndAppendElementInDOM(mascot, MASCOT_CONTAINER_ID);
        }
        trackServe();
      }
    }

    function createAndAppendElementInDOM(mascot, containerId) {
      let chateleonContainer = document.getElementById(containerId);
      if (!chateleonContainer) {
        chateleonContainer = document.createElement("div");
      }
      if(config.meta.dimensions){
        mascot.style.height = config.meta.dimensions.height || config.dimensions.height || 150 + "px";
        mascot.style.width = config.meta.dimensions.width || config.dimensions.width || 260 + "px";
      } else {
        mascot.style.height = config.dimensions.height || 150 + "px";
        mascot.style.width = config.dimensions.width || 260 + "px";
      }
      mascot.onclick = trackEvent;
      mascot.onmouseover = trackEvent;
      chateleonContainer.id = containerId;
      chateleonContainer.style.position = config.position.type || "fixed";
      chateleonContainer.style.right = config.position.right || 0 + "px";
      chateleonContainer.style.bottom = config.position.bottom || 0 + "px";
      chateleonContainer.style.height = mascot.style.height || config.dimensions.height || 150 + "px";
      chateleonContainer.style.width = mascot.style.width || config.dimensions.width || 260 + "px";
      chateleonContainer.style.zIndex = config.dimensions.zIndex || 500;
      doc.body.appendChild(chateleonContainer);

      const isAppending = !!config.meta.append;
      switch (isAppending) {
        case true:
          const elementHasId = config.meta.append.id !== undefined;
          appendAnimation(elementHasId, mascot,chateleonContainer);
          break;
        case false:
          chateleonContainer.appendChild(mascot);
          break;
      }
    }

    function appendAnimation(elementHasId, mascot, chateleonContainer) {
      let element;
      chateleonContainer.appendChild(mascot);
      switch (elementHasId) {
        case true:
          element = document.getElementById(config.meta.append.id);
          if(element){
            element.appendChild(chateleonContainer);
          }
          break;
        case false:
          const elementHasClass = config.meta.append.class !== undefined;
          if(elementHasClass){
            element = document.querySelector("." + config.meta.append.class);
            if(element) {
              element.appendChild(chateleonContainer);
            }
          }
          break;
      }
    }

    function serveAndInteractionCallback(res) {
      const response = res.response
      if (res.status === "error") {
        console.error(res.status + ": " + response);
      }
    }

    function trackServe() {
      var url = BASE_URL + TRACK_SERVE_PATH;
      var headers = {
        "Content-Type": "application/json",
        "x-api-key": config.apiId
      };
      var method = METHOD;
      var payload = null;
      // Call to `track/serve` API
      httpCall(url, method, headers, payload, serveAndInteractionCallback);
    }

    function trackInteraction(eventData) {
      var url = BASE_URL + TRACK_INTERACTION_PATH;
      var headers = {
        "Content-Type": "application/json",
        "x-api-key": config.apiId
      };
      var method = METHOD;
      var payload = JSON.stringify({
        eventData: {
          type: eventData.type,
        }
      });
      // Call to `track/interaction` API
      httpCall(url, method, headers, payload, serveAndInteractionCallback);
    }

    function moveGif(data, id) {
      const gifContainer = doc.querySelector("#" + id);
      // TODO: Data validation pending

      // Loop through each property in data
      for (let prop in data) {
        // Check if the property exists in data and is not null or undefined
        if (data.hasOwnProperty(prop) && data[prop] !== null && data[prop] !== undefined) {
          gifContainer.style[prop] = data[prop];
        } else {
          gifContainer.style[prop] = null;
        }
      }
    }

    const trackEvent = function (event) {
      // Do an API call and store the tracking information
      trackInteraction(event);
    };
  };

  win.chateleon = chateleon;
})(window, document);
