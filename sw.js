import { del, entries } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

const datotekeZaCache = [
  "/",
  "manifest.json",
  "index.html",
  "offline.html",
  "error.html",
  "server.js",
  "sw.js",
];

const staticCache = "staticCache";

self.addEventListener("install", (event) => {
  console.log("Cachinranje statičkih datoteka");
  event.waitUntil(
    caches.open(staticCache).then((cache) => {
      return cache.addAll(datotekeZaCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhiteList = [staticCache];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhiteList.indexOf(cacheName) == -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
        }

        return fetch(event.request).then((response) => {
          if (response.status == 404) {
            return caches.match("error.html");
          }
          return caches.open(staticCache).then((cache) => {
            cache.put(event.request.url, response.clone());
            return response;
          });
        });
      })
      .catch((error) => {
        return caches.match("offline.html");
      })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "syncFormData") {
    event.waitUntil(syncData());
  }
});

let syncData = async function () {
  entries().then((entries) => {
    entries.forEach((entry) => {
      let userData = entry[1];
      let formData = new FormData();
      formData.append("name", userData.name);
      formData.append("surname", userData.surname);
      fetch("/saveData", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Data synchronized ", data);
        })
        .catch((err) => {
          console.log("Greška u sinkronizaciji ", err);
        });
    });
  });
};
