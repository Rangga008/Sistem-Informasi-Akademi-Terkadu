const bcrypt = require("bcryptjs");

const hash = "$2b$10$D3ANBy6YA.cVjRrlv9Fj9euAw.eMgaGyrnGGBSgCXjmr4zuE46Kvi";
const password = "kuren08";

bcrypt
	.compare(password, hash)
	.then((result) => {
		console.log("Password matches:", result);
	})
	.catch((err) => {
		console.error("Error:", err);
	});
