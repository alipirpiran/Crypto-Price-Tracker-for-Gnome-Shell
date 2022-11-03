const Soup = imports.gi.Soup;
let _soupASyncSession;

function _getSession() {
  if (!_soupASyncSession) _soupASyncSession = new Soup.Session();
  return _soupASyncSession;
}

function get(url) {
  switch (Soup.MAJOR_VERSION) {
    case 2:
      return get_soup_v2(url);
    case 3:
      return get_soup_v3(url);
  }
}

function get_soup_v3(url) {
  return new Promise((resolve, reject) => {
    var session = new Soup.Session();

    var message = Soup.Message.new('GET', url);

    session.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      null,
      function (session, result) {
        if (message.get_status() === Soup.Status.OK) {
          let bytes = session.send_and_read_finish(result);
          let decoder = new TextDecoder('utf-8');
          let response = decoder.decode(bytes.get_data());

          resolve({
            code: result.status_code,
            body: response,
          });
        }
      }
    );
  });
}

function get_soup_v2(url) {
  return new Promise((resolve, reject) => {
    var session = new Soup.SessionAsync();
    Soup.Session.prototype.add_feature.call(
      session,
      new Soup.ProxyResolverDefault()
    );

    var message = Soup.Message.new('GET', url);

    session.queue_message(message, function (_httpSession, result) {
      // request is done
      resolve({
        code: result.status_code,
        body: message.response_body.data,
      });
    });
  });
}
