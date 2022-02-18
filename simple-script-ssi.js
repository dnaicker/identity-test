// npm install api --save
// const sdk = require('api')('@trinsic/v1.0#1mld74kq6w8ws5');
const authToken = process.env.ACCESSTOK;
require('dotenv').config();
const {
  CredentialsServiceClient,
  ProviderServiceClient,
  WalletServiceClient,
  Credentials,
  ProviderCredentials 
} = require("@trinsic/service-clients");
const { LocalStorage } = require("node-localstorage");
var localStorage = new LocalStorage('./scratch')

// Credentials API
const credentialsClient = new CredentialsServiceClient(
    new Credentials(authToken),
    { noRetryPolicy: true }
);

// Provider API
const providerClient = new ProviderServiceClient(
    new ProviderCredentials(authToken),
    { noRetryPolicy: true }
);

// Wallet API
const walletClient = new WalletServiceClient(
    new Credentials(authToken),
    { noRetryPolicy: true }
);

// =====================================
// create wallet
const createWallet = async (ownerName) => {

	let tempWalletId = localStorage.getItem("walletId");

	console.log("tempWalletId", tempWalletId, typeof(tempWalletId));

	if(tempWalletId) {
		console.log("create new wallet")
	} else {
		console.log("use existing wallet")
	}

	try {
		let ownerName = null; // Can be null
		let walletId = null; // Can be null
		let wallet = await walletClient.createWallet({
				ownerName: ownerName,
				walletId: walletId
		});

		// store wallet id in local storage
		localStorage.setItem('walletId', wallet.walletId)

		return wallet.walletId;
	} catch (error) {
		console.debug(error)		
	}
	
	

}

// =====================================
// Create credential
// issuer credentials api
// copy offerUrl from response, does not require connectionId
// https://docs.trinsic.id/reference/createcredential
const createCredential = async (attributes) => {
	let credential = {
		"definitionId": null,
		"automaticIssuance":true,
		"credentialValues":{}
	};

	// ----------- 1 create credential definition
	let credentialDefinition = await credentialsClient.createCredentialDefinition({
		"supportRevocation":true,
		"tag":"login",
		"name":"login",
		"version":"0.1",
		"attributes": attributes
	})

	credential['definitionId'] = credentialDefinition.definitionId;

	credential['credentialValues'] = appendStringToCredentialValues(credentialDefinition.attributes)

	// ----------- 2 create credential and associate to definition id
	return await credentialsClient.createCredential(credential)
}


// =====================================
// Accept credential
// wallet api
// Accept credential through offerUrl/qr code, does not require connectionId
// https://docs.trinsic.id/reference/acceptcredential
const acceptCredential = async (offerURL) => {
	let credential = await walletClient.acceptCredential(offerURL)
	console.log(`accept credential response${credential}`);
	return;
}

// =====================================
// list credentials
// for credentials with no connectionId
const listCredentials = async (walletId) => {
	let credentials = await walletClient.listCredentials(walletId)
	console.log(`credentials${credentials}`);
	return;
}

// =====================================
// append string type to request create credential 
const appendStringToCredentialValues = (credentialDefinitionAttributes) => {
	let credentialValues = {};

	for (const item in credentialDefinitionAttributes) {
		credentialValues[credentialDefinitionAttributes.attribute[item]] = "string"		
	}

	console.log(`credential values updated${credentialValues}`);

	return credentialValues;  
}

// =====================================
const main = () => {
	const wallet = createWallet("DenverTest2");
	// const credential = createCredential(["First Name", "Email"]);
	// acceptCredential(wallet.walletId, credential.offerURL);
	// listCredentials(wallet.walletId)
}

main();