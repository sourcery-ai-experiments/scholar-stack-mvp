import axios from "axios";

const API_URL = "https://registry.api.identifiers.org/restApi";

const response = await axios.get(
  `${API_URL}/namespaces?size=1000&sort=name,asc`
);

const namespaces = response.data._embedded.namespaces;

console.log("Found namespaces:", namespaces.length);
// console.log("namespaces:", namespaces);
