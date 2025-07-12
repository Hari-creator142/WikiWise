// script.js
function fetchWiki() {
  const topic = document.getElementById("searchInput").value.trim();
  const resultDiv = document.getElementById("resultContainer");

  if (!topic) {
    resultDiv.innerHTML = "<p>Please enter a topic.</p>";
    return;
  }

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;

  resultDiv.innerHTML = "<p>Searching...</p>";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.type === "disambiguation") {
        const suggestions = data.title.split(" ").slice(0, 2).join(" ");
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${encodeURIComponent(suggestions)}`;

        fetch(searchUrl)
          .then(res => res.json())
          .then(results => {
            const titles = results[1];
            if (titles.length === 0) {
              resultDiv.innerHTML = `<p>Multiple topics found, but no suggestions available.</p>`;
              return;
            }
            let suggestionList = titles.map(title => `<li><a href="https://en.wikipedia.org/wiki/${encodeURIComponent(title)}" target="_blank">${title}</a></li>`).join("");
            resultDiv.innerHTML = `
              <h2>Multiple results found for "${topic}"</h2>
              <p>Please choose one of the following:</p>
              <ul>${suggestionList}</ul>
            `;
          });
      } else if (!data.extract) {
        resultDiv.innerHTML = `<p>No information found for "${topic}". Try a different topic.</p>`;
      } else {
        resultDiv.innerHTML = `
          <h2>${data.title}</h2>
          <p>${data.extract}</p>
          <a href="${data.content_urls.desktop.page}" target="_blank">🔗 Read full article</a>
        `;
      }
    })
    .catch(err => {
      console.error(err);
      resultDiv.innerHTML = "<p>Error fetching info. Try again later.</p>";
    });
}
