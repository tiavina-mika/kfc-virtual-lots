import "./styles.css";

// ---------------------------------------- //
// ----- use true encryption function ----- //
// ---------------------------------------- //
const encrypt = (text, id) => {
  return text + "-encrypted-" + id;
};

const decrypt = (text, id) => {
  return text + "-decrypted-" + id;
};

/**
 * decrypt or encrypt values
 * each field may be string, number or object
  @param {} values 
  @param {} userId 
  @param {} type 
 * @returns 
 */
const encryptOrDecryptData = (values, userId, type = "encrypt") => {
  const newData = {};

  Object.keys(values).forEach((key) => {
    // object field
    if (typeof values[key] === "object") {
      const subValues = {};

      Object.keys(values[key]).forEach((subKey) => {
        if (type === "encrypt") {
          subValues[subKey] = encrypt(values[key][subKey], userId);
        } else {
          subValues[subKey] = decrypt(values[key][subKey], userId);
        }
      });

      newData[key] = subValues;
    } else {
      // string or number field
      const field = values[key];
      if (type === "encrypt") {
        const encryptedField = encrypt(field, userId);

        // mock email so we can use it as email even encrypted
        if (key === "email") {
          newData[key] = encryptedField + "@encryptedemail.com";
        } else {
          newData[key] = encryptedField;
        }
      } else {
        if (key === "email") {
          // remove the mocked email hostname
          const encryptedEmail = field.split("@")[0];
          newData[key] = decrypt(encryptedEmail, userId);
        } else {
          newData[key] = decrypt(field, userId);
        }
      }
    }
  });

  return newData;
};

// ---------------------------------------- //
// --- encrypt and decrypt mocked data ---- //
// ---------------------------------------- //
const encrypted = encryptOrDecryptData(
  {
    firstName: "Tiks",
    lastName: "Kun",
    email: "tiks@gmail.com",
    billing: { address1: "Ambohitsoa" }
  },
  "01",
  "encrypt"
);

const decrypted = encryptOrDecryptData(encrypted, "01", "decrypt");

console.log("encrypted", encrypted);
console.log("decrypted", decrypted);

const App = () => {
  return (
    <div className="App">
      <h1>Encrypt and decrypt data</h1>
      <h2>
        Some user data are sensible, so the goal of encryption is that only the
        user can access to its own information
      </h2>
    </div>
  );
};

export default App;
