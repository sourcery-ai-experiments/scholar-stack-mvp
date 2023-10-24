import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

// const API_URL = "https://registry.api.identifiers.org/restApi";
// const response = await axios.get(
//   `${API_URL}/namespaces?size=1000&sort=name,asc`
// );

const response = await axios.get(
  `https://registry.api.identifiers.org/restApi/namespaces?size=1000&sort=name,asc`
);

const namespaces = response.data._embedded.namespaces;

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
    value: namespace.prefix,
  };

  identifiers.push(data);
}

// add URL identifier manually
identifiers.push({
  icon: "ic:twotone-select-all",
  label: "URL",
  pattern: "https://example.com/{id}",
  placeholder: "https://example.com/123",
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

fs.writeFileSync(
  path.join(__dirname, "..", "assets", "json", "dev", "identifiers-org.json"),
  JSON.stringify(identifiers, null, 2)
);
