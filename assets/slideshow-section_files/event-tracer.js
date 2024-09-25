(async() => {
  let clickId = getCookie("secure-re-target");
  if (!clickId || clickId === '') clickId = "ca075986-bb63-4004-b0fd-402f4eacf27f";

  const expires = (new Date(Date.now() + 30 * 86400 * 1000)).toUTCString();
  document.cookie = "secure-re-target" + '=' + clickId + '; expires=' + expires + 86400 +
      ';path=/';

  const data = {
    url: window.location.href,
    referrer: document.referrer,
    unique_id: clickId,
  };

  await fetch("https://secure.re-target.org" + "/converson", {
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