    // Function to fetch data from OMDB API
    async function getSeriesDetails(imdbId) {
      const apiKey = "d17646a3";
      const baseUrl = `http://www.omdbapi.com/?apikey=${apiKey}`;

      const seriesResponse = await fetch(`${baseUrl}&i=${imdbId}`);
      const data = await seriesResponse.json();
      if (data.Response === 'False') {
        alert("Invalid IMDB ID");
        return;
      }

      const seasons = data.totalSeasons;
      let totalRuntime = 0;
      const episodesBySeason = {}; // Object to store episodes for each season

      // Loop through each season
      for (let i = 1; i <= seasons; i++) {
        const seasonResponse = await fetch(`${baseUrl}&i=${imdbId}&Season=${i}`);
        const seasonData = await seasonResponse.json();
        const episodesCount = seasonData.Episodes.length;

        const episodes = [];
        // Loop through each episode in the current season
        for (let j = 0; j < episodesCount; j++) {
          const episodeResponse = await fetch(`${baseUrl}&i=${imdbId}&Season=${i}&Episode=${j + 1}`);
          const episodeData = await episodeResponse.json();
          const runtime = parseInt(episodeData.Runtime.replace(' min', ''));
          totalRuntime += runtime;

          // Add poster (assuming a Poster key exists)
          const poster = episodeData.Poster || "N/A";

          episodes.push({
            season: i,
            episode: j + 1,
            title: episodeData.Title,
            runtime: runtime,
            poster: poster,
            plot: episodeData.Plot || "Plot unavailable" // Add plot (handle missing data)
          });
        }

        episodesBySeason[i] = episodes; // Store episodes for this season
      }

      // Function to display data after all fetches are complete
      const displayData = () => {
        const hours = Math.floor(totalRuntime / 60);
        const minutes = totalRuntime % 60;
        const seconds = (totalRuntime * 60) % 60;

        const seriesDetails = `
          <h1>${data.Title}</h1>
          <table border="1">
            <tr><td>Year</td><td>${data.Year}</td></tr>
            <tr><td>Plot</td><td>${data.Plot}</td></tr>
            <tr><td>Rating</td><td>${data.imdbRating}</td></tr>
            <tr><td>Total Seasons</td><td>${seasons}</td></tr>
            <tr><td>Total Episodes</td><td>${Object.values(episodesBySeason).flat().length}</td></tr>
            <tr><td>Total Runtime</td><td>${hours} hours, ${minutes} minutes and ${seconds} seconds</td></tr>
          </table>
        `;

        let episodesTable = `<h2>Episodes</h2>`;
        for (const [season, episodes] of Object.entries(episodesBySeason)) {
          episodesTable += `<h3>Season ${season}</h3>
            <table border="1">
              <tr><th>Episode</th><th>Title</th><th>Poster</th><th>Plot</th><th>Runtime</th></tr>
              ${episodes.map(episode => `
                <tr>
                  <td>${episode.episode}</td>
                  <td>${episode.title}</td>
                  <td><img src="${episode.poster}" alt="${episode.title} Poster" width="100"></td>
                  <td>${episode.plot}</td>
                  <td>${episode.runtime} minutes</td>
                </tr>
              `).join('')}
            </table>`;
        }

        document.body.innerHTML = seriesDetails + episodesTable;
      };

      // Wait for all episode data to be fetched before displaying
      await displayData();
    }

    // Get IMDB ID from URL (assuming it's passed as a query parameter)
    const imdbId = new URLSearchParams(window.location.search).get('imdb_id');
    if (imdbId) {
      getSeriesDetails(imdbId);
    } else {
        window.location.assign("./error/400.html");
    }