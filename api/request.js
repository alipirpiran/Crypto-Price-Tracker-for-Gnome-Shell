const Soup = imports.gi.Soup;
const Lang = imports.lang;
let _soupASyncSession;

function _getSession() {
  if (!_soupASyncSession) _soupASyncSession = new Soup.SessionAsync();
  return _soupASyncSession;
}

function get(url) {
  return new Promise((resolve, reject) => {
    var _httpSession = new Soup.SessionAsync();
    Soup.Session.prototype.add_feature.call(
      _httpSession,
      new Soup.ProxyResolverDefault()
    );

    var request = Soup.Message.new('GET', url);

    _httpSession.queue_message(request, function (_httpSession, message) {
      // request is done
      resolve({
        code: message.status_code,
        body: request.response_body.data,
      });
    });
  });
}

function get2(url) {
  return new Promise((resolve, reject) => {
    try {
      var _httpSession = new Soup.SessionAsync();

      Soup.Session.prototype.add_feature.call(
        _httpSession,
        new Soup.ProxyResolverDefault()
      );

      var request = Soup.Message.c_new('GET', url);

      _httpSession.queue_message(request, function (_httpSession, message) {
        // request is done
        resolve({
          code: message.status_code,
          body: request.response_body.data,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

function get3(url) {
  return new Promise((resolve, reject) => {
    try {
      let request = Soup.Message.new('GET', url);
      const _httpSession = _getSession();
      _httpSession.queue_message(request, function (_httpSession, message) {
        // request is done
        resolve({
          code: message.status_code,
          body: request.response_body.data,
        });
      });
    } catch (error) {
      // print(error);
      reject(error);
    }
  });
}
