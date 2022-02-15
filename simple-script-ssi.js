// npm install api --save
const sdk = require('api')('@trinsic/v1.0#1mld74kq6w8ws5');
const authToken = '-fXgxPjJhehNoI54wXIQysCzXWYdX-4XTl03IjQROHM'

// =====================================
// create wallet
const createWallet = () => {
	sdk.CreateWallet('{}', {
			Accept: 'text/plain',
			Authorization: authToken
		})
		.then(res => {
			console.log(res)
			resolve(res.walletId);
		})
		.catch(err => {
			console.error(err)
		});
}

// =====================================
// Create credential
// issuer credentials api
// copy offerUrl from response, does not require connectionId
// https://docs.trinsic.id/reference/createcredential
const createCredential = (attributes) => {
	const credentialDefinition = {
		"supportRevocation":true,
		"tag":"login",
		"name":"login",
		"version":"0.1",
		"attributes": attributes
	};

	// ----------- 1 create credential definition
	sdk.CreateCredentialDefinition(credentialDefinition, {
		Accept: 'application/json', 
		Authorization: authToken})
	  .then(res => {
	  	console.log("credential definition created", res)

		let credential = {
			"definitionId":res.definitionId,
			"automaticIssuance":true,
			"credentialValues":{}
		};

		credential['credentialValues'] = appendStringToCredentialValues(credentialDefinition.attributes)
		
		// ----------- 2 create credential and associate to definition id
		sdk.CreateCredential(credential, {
			Accept: 'application/json', 
			Authorization: authToken})
		  .then(res => {
		  	resolve(res.offerUrl)
		  	console.log("credential created", res)
		  })
		  .catch(err => console.error(err));
	  })
	  .catch(err => console.error(err));

  	const appendStringToCredentialValues = (credentialDefinitionAttributes) => {
		let credentialValues = {};

		for (const item in credentialDefinitionAttributes) {
			credentialValues[credentialDefinitionAttributes.attribute[item]] = "string"		
		}

		console.log("credential values updated", credentialValues);

		return credentialValues;  
	}
}

// =====================================
// Accept credential
// wallet api
// Accept credential through offerUrl/qr code, does not require connectionId
// https://docs.trinsic.id/reference/acceptcredential
const acceptCredential = (walletId, offerURL) => {
sdk.AcceptCredential(
	{credentialData: offerURL},
	{
		walletId: walletId,
		Accept: 'text/plain', 
		Authorization: authToken
	})
  .then(res => console.log("accept credential", res))
  .catch(err => console.error(err));
}

// =====================================
// list credentials
// for credentials with no connectionId
const listCredentials = (walletId) => {
	const sdk = require('api')('@trinsic/v1.0#1mld74kq6w8ws5');

	sdk.ListCredentials({
	  walletId: walletId,
	  Accept: 'text/plain',
	  Authorization: authToken
	})
  	.then(res => console.log(res))
  	.catch(err => console.error(err));
}

const main = () => {
	const walletId = createWallet();
	const offerURL = createCredential(["First Name", "Email"]);
	acceptCredential(walletId, offerURL);
	listCredentials(walletId)
}

main();