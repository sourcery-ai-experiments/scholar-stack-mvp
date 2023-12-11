import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

// const API_URL = "https://registry.api.identifiers.org/restApi";
// const response = await axios.get(
//   `${API_URL}/namespaces?size=1000&sort=name,asc`
// );

const main = async () => {
  const response = await axios.get(
    `https://registry.api.identifiers.org/restApi/namespaces?size=1000&sort=name,asc`
  );

  const namespaces = response.data._embedded.namespaces;

  console.log(`Found ${namespaces.length} namespaces`);

  const identifiers = [];

  for (const namespace of namespaces) {
    if (namespace.deprecated) {
      continue;
    }

    const data = {
      icon: "ic:twotone-select-all",
      label: namespace.name,
      pattern: namespace.pattern,
      placeholder: namespace.sampleId,
      type: "other",
      value: namespace.prefix,
    };

    identifiers.push(data);
  }

  // add URL identifier manually
  identifiers.push({
    icon: "ic:twotone-select-all",
    label: "URL",
    pattern: "^https?:\\/\\/.*$",
    placeholder: "https://example.com/123",
    type: "other",
    value: "url",
  });

  // sort by label
  identifiers.sort((a, b) => {
    if (a.value < b.value) {
      return -1;
    }

    if (a.value > b.value) {
      return 1;
    }

    return 0;
  });

  const __filename = fileURLToPath(import.meta.url);

  const __dirname = path.dirname(__filename);

  const filePath = path.join(
    __dirname,
    "..",
    "assets",
    "json",
    "dev",
    "identifiers-org.json"
  );

  // create directory if it doesn't exist
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath));
  }

  fs.writeFileSync(filePath, JSON.stringify(identifiers, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
