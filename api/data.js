const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const request = Me.imports.api.request;

var getPrice = async function (symbol) {
	const url = 'https://www.okx.com/api/v5/market/ticker?instId=';
	const res = await request.get(url + symbol);

	const jsonRes = JSON.parse(res.body);

	if (jsonRes.data.length == 0) return -1;

	let price = +jsonRes.data[0].last;

	return price.toLocaleString();

	let priceParts = price.split('.');

	const totalLen = 6;
	let len = 0;
	len += priceParts[0].length;
	price = priceParts[0] + '.';
	let i = 0;
	for (len; len < totalLen; len++) {
		price += priceParts[1][i];
		i++;
	}
	if (+price == 0)
		for (let i = len; i < priceParts[1].length; i++) {
			price += priceParts[1][i];
		}

	return price;
};
