const Soup = imports.gi.Soup;
const Lang = imports.lang;
function get(url) {
    return new Promise((resolve, reject) => {
        var _httpSession = new Soup.SessionAsync();
        Soup.Session.prototype.add_feature.call(
            _httpSession,
            new Soup.ProxyResolverDefault()
        );

        var request = Soup.Message.new('GET', url);

        _httpSession.queue_message(request, function(_httpSession, message) {
            // request is done
            resolve({
                code: message.status_code,
                body: request.response_body.data,
            });
        });
    });
}
