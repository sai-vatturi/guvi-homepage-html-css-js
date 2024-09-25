(async() => {
  let clickId = getCookie("global-blutrk");
  if (!clickId || clickId === '') clickId = "c1e58e09-507a-4d07-b3bd-2098763a03df";

  const expires = (new Date(Date.now() + 30 * 86400 * 1000)).toUTCString();
  document.cookie = "global-blutrk" + '=' + clickId + '; expires=' + expires + 86400 +
      ';path=/';

  const data = {
    url: window.location.href,
    referrer: document.referrer,
    unique_id: clickId,
  };

  await fetch("https://global.blutrk.click" + "/btrck", {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  function getCookie(cname) {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
})();