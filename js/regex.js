export const inputRegex = [
    {
      id: "fname",
      regex: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,30}$/,
      warningId: "fname-invalid",
      message: "🚩 Please enter a valid first name."
    },
    { id: "lname",
      regex: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,30}$/,
      warningId: "lname-invalid",
      message: "🚩 Please enter a valid last name."
    },
    {
      id: "address",
      regex: /^[A-Za-z0-9À-ÖØ-öø-ÿ.,' -]{5,50}$/,
      warningId: "address-invalid",
      message: "🚩 Please enter a valid street address."
    },
    {
      id: "postcode",
      regex: /^[0-9]{5}$/,
      warningId: "postcode-invalid",
      message: "🚩 Please enter a valid postcode."
    },
    { id: "city",
      regex: /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,50}$/,
      warningId: "city-invalid",
      message: "🚩 Please enter a valid city name."
    },
    { id: "email",
      regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      warningId: "email-invalid",
      message: "🚩 Please enter a valid email address."
    },
    { id: "phoneno",
      regex: /^\+?[0-9]{7,15}$/,
      warningId: "phoneno-invalid",
      message: "🚩 Please enter a valid phone number."
    },
    { id: "personalId",
      regex: /^\d{6}[-]?\d{4}$/,
      warningId: "personalId-invalid",
      message: "🚩 Please enter a valid swedish personal ID number (YYMMDD-XXXX or YYMMDDXXXX)."
    }
  ];