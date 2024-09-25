(function (win, doc) {

  win.chateleonCustom = (function () {

      console.info("Chatleon Custom SDK loaded");
      function chateleonCustom(apiId) {
          var chateleonContainer = document.getElementById('chateleon-container');
          var ymPluginDivContainerInitial;
          var isChateleonCalled = false;

          const addGuviClickListener = () => {
              var chateleonContainer = document.getElementById('chateleon-container');
              var ymDivBarContainer = document.getElementById('ymDivBar');

              chateleonContainer.addEventListener('click', function () {
                  ymDivBarContainer.click();
              });
          };

            ymPluginDivContainerInitial = document.getElementById('ymPluginDivContainerInitial');

            // Callback function to execute when mutations are observed
            const bodyCallback = (mutationList, observer) => {
              for (const mutation of mutationList) {
                    if (ymPluginDivContainerInitial || mutation.addedNodes[0]?.id == 'ymPluginDivContainerInitial') {
                        console.log('ymPluginDivContainerInitial container added');
                        chateleonContainer = document.getElementById('chateleon-container');
                        if (!chateleonContainer && !isChateleonCalled) {
                          chateleon('create', apiId, null, null, customImpl);
                          isChateleonCalled = true;
                        }
                        // Add mutation observer for chatBox
                        addChatBoxObserver();
                        observer.disconnect();
                    }
              }
            };

            const guviBodyNode = document.body;
            const config = { childList: true };
            const bodyObserver = new MutationObserver(bodyCallback);
            bodyObserver.observe(guviBodyNode, config);

          const chatBoxCallback = (mutationList, observer) => {
            if (window.chateleonIsLoaded) {
              for (const mutation of mutationList) {
                  if (mutation.type === "attributes") {
                      // console.log(`The ${mutation.attributeName} attribute was modified.`);
                      if (mutation.attributeName === 'style') {
                          if (mutation.target.id === 'ymDivBar') {
                              var guviChatImage = document.querySelector('#ymDivBar img');
                              guviChatImage.style.display = 'none';
                              var chateleonContainer = document.getElementById('chateleon-container');
                              if (chateleonContainer && mutation.target.style.display === 'none') {
                                  chateleonContainer.style.display = 'none';
                              } else if (chateleonContainer) {
                                  chateleonContainer.style.display = 'block';
                              }
                          }
                      }
                  }
              }
            }
          };

          const customImpl = (filteredGif, id, trackEvent) => {
            chateleonContainer = document.getElementById(id);
            if (!chateleonContainer) {
              var elem = filteredGif;
              elem.className = 'chateleon-animation ' + filteredGif.className;
              elem.style.cssText = 'height: 117px; width: 135px';
              elem.onmouseover = trackEvent;
              elem.onclick = trackEvent;
              var elemDiv = document.createElement('div');
              elemDiv.id = id;
              elemDiv.style.cssText = 'position: fixed; bottom: 0px; right: 0px; z-index: 99998; cursor: pointer;';
              document.body.appendChild(elemDiv);
              elemDiv.appendChild(elem);

              if (window.chateleonIsLoaded) {
                var guviChatImage = document.querySelector('#ymDivBar img');
                guviChatImage.style.display = 'none';
              }
              addGuviClickListener();
            }
          };

          const addChatBoxObserver = function () {
              const chatBoxContainer = document.getElementById('ymPluginDivContainerInitial');
              const chatBoxObserver = new MutationObserver(chatBoxCallback);
              const config = { attributes: true, subtree: true };
              chatBoxObserver.observe(chatBoxContainer, config);
          }
      }

      return chateleonCustom;
  })();

})(window, document)
